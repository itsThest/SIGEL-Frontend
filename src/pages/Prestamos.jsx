import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, X, FileDown, Plus, ThumbsUp, ThumbsDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../components/LoadingSkeleton';
import useApi from '../hooks/useApi';
import usePagination from '../hooks/usePagination';
import Pagination from '../components/Pagination';
import { getPrestamos, crearPrestamo, aprobarPrestamo, rechazarPrestamo, devolverPrestamo } from '../services/prestamosService';
import { getActivos } from '../services/activosService';
import { isAdmin } from '../utils/auth';

const PAGE_SIZE = 10;

/* ── Helpers ─────────────────────────────────────────────────── */
const formatFecha = (iso) =>
  iso ? new Date(iso).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' }) : '—';

/* ── Badge estado ────────────────────────────────────────────── */
const EstadoBadge = ({ value }) => {
  const map = {
    'Pendiente': { cls: 'bg-blue-50 text-blue-700 border-blue-200',        icon: Clock },
    'Activo':    { cls: 'bg-amber-50 text-amber-700 border-amber-200',     icon: Clock },
    'Devuelto':  { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
    'Rechazado': { cls: 'bg-red-50 text-red-600 border-red-200',           icon: X },
  };
  const { cls, icon: Icon } = map[value] ?? { cls: 'bg-gray-100 text-gray-600 border-gray-200', icon: Clock };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
      <Icon size={11} />{value}
    </span>
  );
};

/* ── Modal: Nuevo Préstamo (Admin directo) ───────────────────── */
const ModalNuevoPrestamo = ({ onClose, onSuccess }) => {
  const { data: activosData, loading: loadingActivos } = useApi(getActivos);
  const disponibles = (activosData?.data ?? []).filter(a => a.disponibilidad === 'Disponible');

  const [form, setForm] = useState({ id_activo: '', id_usuario: '', observaciones_salida: '' });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState(null);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.id_activo)  { setErr('Selecciona un equipo disponible.'); return; }
    if (!form.id_usuario) { setErr('Ingresa el ID del usuario.'); return; }
    setSaving(true); setErr(null);
    try {
      await crearPrestamo({
        id_activo:            Number(form.id_activo),
        id_usuario:           Number(form.id_usuario),
        observaciones_salida: form.observaciones_salida,
      });
      toast.success('Préstamo registrado exitosamente.');
      onSuccess();
    } catch (ex) {
      setErr(ex.response?.data?.error ?? 'Error al registrar el préstamo.');
    } finally { setSaving(false); }
  };

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-carrera-blue/30 focus:border-carrera-blue text-sm transition-all placeholder-gray-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-carrera-blue">
          <div>
            <h2 className="text-base font-bold text-white">Registrar préstamo</h2>
            <p className="text-xs text-white/60 mt-0.5">El equipo pasará a estado "Prestado"</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          {err && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-sm">
              <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />{err}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Equipo a prestar <span className="text-utn-red">*</span></label>
            {loadingActivos ? (
              <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-400">
                <svg className="animate-spin h-4 w-4 text-carrera-blue" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Cargando equipos disponibles…
              </div>
            ) : disponibles.length === 0 ? (
              <div className="px-3 py-2.5 border border-amber-200 rounded-xl bg-amber-50 text-sm text-amber-700">
                No hay equipos disponibles para préstamo en este momento.
              </div>
            ) : (
              <select name="id_activo" value={form.id_activo} onChange={handle} required className={inputCls}>
                <option value="">— Selecciona un equipo —</option>
                {disponibles.map(a => (
                  <option key={a.id_activo} value={a.id_activo}>
                    {a.nombre} · {a.codigo_institucional} ({a.tipo})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">ID del usuario / estudiante <span className="text-utn-red">*</span></label>
            <input type="number" min="1" name="id_usuario" value={form.id_usuario}
              onChange={handle} required placeholder="Ej: 1" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Observaciones de salida <span className="text-gray-400 font-normal">(opcional)</span></label>
            <textarea name="observaciones_salida" value={form.observaciones_salida}
              onChange={handle} rows={3}
              placeholder="Se entrega con cables completos…"
              className={`${inputCls} resize-none`} />
          </div>
          <div className="flex justify-end gap-3 pt-1 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving || loadingActivos || disponibles.length === 0}
              className="px-5 py-2.5 rounded-xl bg-carrera-blue text-white text-sm font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md">
              {saving
                ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Registrando…</>
                : <><Plus size={15}/> Registrar préstamo</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Modal de Aprobación ─────────────────────────────────────── */
const ModalAprobacion = ({ prestamo, onClose, onConfirm, loading }) => {
  const [obs, setObs] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-carrera-blue">
          <h2 className="text-base font-bold text-white">Registrar Salida de Equipo</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
            <p><span className="font-semibold text-gray-600">Usuario:</span> {prestamo.usuario_nombres || prestamo.id_usuario}</p>
            <p><span className="font-semibold text-gray-600">Equipo:</span> {prestamo.activo_nombre || prestamo.id_activo}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Observaciones de salida <span className="text-utn-red">*</span>
            </label>
            <textarea value={obs} onChange={e => setObs(e.target.value)} rows={3} required
              placeholder="Se entrega equipo probado y con accesorios completos..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-carrera-blue/30 focus:border-carrera-blue text-sm resize-none transition-all" />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={() => { if(obs.trim()) onConfirm(obs); else toast.error('Las observaciones de salida son requeridas.'); }} disabled={loading || !obs.trim()}
              className="px-5 py-2 rounded-xl bg-carrera-blue text-white text-sm font-semibold hover:bg-blue-900 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-60 flex items-center gap-2 shadow-md">
              {loading
                ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Procesando…</>
                : <><ThumbsUp size={15}/> Aprobar y Entregar</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Modal de devolución ─────────────────────────────────────── */
const ModalDevolucion = ({ prestamo, onClose, onConfirm, loading }) => {
  const [obs, setObs] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-carrera-green">
          <h2 className="text-base font-bold text-white">Registrar devolución</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
            <p><span className="font-semibold text-gray-600">Préstamo #:</span> {prestamo.id_prestamo}</p>
            <p><span className="font-semibold text-gray-600">Activo #:</span> {prestamo.id_activo}</p>
            <p><span className="font-semibold text-gray-600">Salida:</span> {formatFecha(prestamo.fecha_salida)}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Observaciones de recepción <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea value={obs} onChange={e => setObs(e.target.value)} rows={3}
              placeholder="Equipo recibido en buen estado..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-carrera-green/30 focus:border-carrera-green text-sm resize-none transition-all" />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={() => onConfirm(obs)} disabled={loading}
              className="px-5 py-2 rounded-xl bg-carrera-green text-white text-sm font-semibold hover:bg-green-800 transition-colors disabled:opacity-60 flex items-center gap-2">
              {loading
                ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Procesando…</>
                : <><CheckCircle size={15}/> Confirmar devolución</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Exportar PDF ────────────────────────────────────────────── */
const exportarPDF = (prestamos) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const ahora = new Date().toLocaleString('es-EC', { dateStyle: 'full', timeStyle: 'short' });
  doc.setFillColor(0, 51, 102);
  doc.rect(0, 0, 297, 22, 'F');
  doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
  doc.text('Reporte de Préstamos — Laboratorio de Telecomunicaciones', 14, 10);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text('UTN — Facultad Regional', 14, 17);
  doc.setFontSize(8); doc.setTextColor(200, 200, 200);
  doc.text(`Generado: ${ahora}`, 297 - 14, 17, { align: 'right' });
  const activos   = prestamos.filter(p => p.estado_prestamo === 'Activo').length;
  const devueltos = prestamos.filter(p => p.estado_prestamo === 'Devuelto').length;
  const pendientes= prestamos.filter(p => p.estado_prestamo === 'Pendiente').length;
  doc.setTextColor(60, 60, 60); doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text(`Total: ${prestamos.length}  |  Activos: ${activos}  |  Pendientes: ${pendientes}  |  Devueltos: ${devueltos}`, 14, 30);
  autoTable(doc, {
    startY: 34,
    head: [['# Préstamo', 'ID Activo', 'ID Usuario', 'Fecha Salida', 'Fecha Recepción', 'Obs. Salida', 'Estado']],
    body: prestamos.map(p => [
      `#${p.id_prestamo}`, p.id_activo, p.id_usuario,
      formatFecha(p.fecha_salida), formatFecha(p.fecha_recepcion),
      p.observaciones_salida || '—', p.estado_prestamo,
    ]),
    headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold', halign: 'left' },
    bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0:{cellWidth:22},1:{cellWidth:22},2:{cellWidth:22},3:{cellWidth:38},4:{cellWidth:38},5:{cellWidth:'auto'},6:{cellWidth:26,fontStyle:'bold'} },
    didParseCell(data) {
      if (data.column.index === 6 && data.section === 'body') {
        const v = data.cell.raw;
        if (v === 'Activo')    data.cell.styles.textColor = [180, 100, 0];
        if (v === 'Devuelto')  data.cell.styles.textColor = [0, 100, 50];
        if (v === 'Pendiente') data.cell.styles.textColor = [0, 80, 160];
        if (v === 'Rechazado') data.cell.styles.textColor = [180, 0, 0];
      }
    },
    margin: { left: 14, right: 14 },
  });
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7); doc.setTextColor(160, 160, 160);
    doc.text(`Página ${i} de ${totalPages} — Generado por SIGEL Telecom`, 297 / 2, doc.internal.pageSize.height - 8, { align: 'center' });
  }
  doc.save('Reporte_Laboratorio.pdf');
};

/* ── Tabla de préstamos ──────────────────────────────────────── */
const TablaPrestamos = ({ items, total, pag, onDevolver, onAprobar, onRechazar, adminMode }) => (
  <>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {['#', 'Usuario', 'Equipo', 'Observaciones', 'Salida', 'Recepción', 'Estado',
              ...(adminMode ? ['Acción'] : [])
            ].map(h => (
              <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map(p => (
            <tr key={p.id_prestamo} className="hover:bg-gray-50/60 transition-colors">
              <td className="px-5 py-3.5 font-mono text-xs text-gray-400">#{p.id_prestamo}</td>
              <td className="px-5 py-3.5">
                <p className="font-semibold text-gray-800">{p.usuario_nombres || `ID: ${p.id_usuario}`}</p>
                {p.usuario_correo && <p className="text-xs text-gray-400">{p.usuario_correo}</p>}
              </td>
              <td className="px-5 py-3.5">
                <p className="text-gray-800 font-medium">{p.activo_nombre || `ID: ${p.id_activo}`}</p>
                {p.activo_codigo && <p className="text-xs font-mono text-gray-400">{p.activo_codigo}</p>}
              </td>
              <td className="px-5 py-3.5 text-gray-500 max-w-xs truncate">{p.observaciones_salida || '—'}</td>
              <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{formatFecha(p.fecha_salida)}</td>
              <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{formatFecha(p.fecha_recepcion)}</td>
              <td className="px-5 py-3.5"><EstadoBadge value={p.estado_prestamo} /></td>
              {adminMode && (
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    {/* Pendiente → Aprobar / Rechazar */}
                    {p.estado_prestamo === 'Pendiente' && (
                      <>
                        <button onClick={() => onAprobar(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-carrera-green text-white text-xs font-semibold rounded-lg hover:bg-green-800 transition-colors shadow-sm">
                          <ThumbsUp size={11} /> Aprobar
                        </button>
                        <button onClick={() => onRechazar(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-utn-red text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm">
                          <ThumbsDown size={11} /> Rechazar
                        </button>
                      </>
                    )}
                    {/* Activo → Devolver */}
                    {p.estado_prestamo === 'Activo' && (
                      <button onClick={() => onDevolver(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-carrera-green text-white text-xs font-semibold rounded-lg hover:bg-green-800 transition-colors shadow-sm">
                        <CheckCircle size={13} /> Devolver
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <Pagination page={pag.page} totalPages={pag.totalPages} total={total} pageSize={PAGE_SIZE} goNext={pag.goNext} goPrev={pag.goPrev} goPage={pag.goPage} />
  </>
);

/* ── Página principal ─────────────────────────────────────────── */
const Prestamos = () => {
  const { data, loading, error, refetch } = useApi(getPrestamos);
  const [selected,   setSelected]   = useState(null); // Para devolver
  const [selectedAprobar, setSelectedAprobar] = useState(null); // Para aprobar
  const [saving,     setSaving]     = useState(false);
  const [modalNuevo, setModalNuevo] = useState(false);

  const admin     = isAdmin();
  const prestamos = data?.data ?? [];
  const pendientes = prestamos.filter(p => p.estado_prestamo === 'Pendiente');
  const activos    = prestamos.filter(p => p.estado_prestamo === 'Activo');
  const devueltos  = prestamos.filter(p => p.estado_prestamo === 'Devuelto');
  const rechazados = prestamos.filter(p => p.estado_prestamo === 'Rechazado');

  const pagPendientes = usePagination(pendientes, PAGE_SIZE);
  const pagActivos    = usePagination(activos,    PAGE_SIZE);
  const pagDevueltos  = usePagination(devueltos,  PAGE_SIZE);
  const pagRechazados = usePagination(rechazados, PAGE_SIZE);

  const handleConfirmDevolucion = async (observaciones_recepcion) => {
    setSaving(true);
    try {
      await devolverPrestamo(selected.id_prestamo, { observaciones_recepcion });
      setSelected(null);
      toast.success('Equipo devuelto con éxito.');
      refetch();
    } catch (ex) {
      toast.error(ex.response?.data?.error ?? 'No se pudo registrar la devolución.');
    } finally { setSaving(false); }
  };

  const handleAprobar = (p) => {
    setSelectedAprobar(p); // Abre el modal en lugar de confirmar directamente
  };

  const handleConfirmAprobar = async (observaciones_salida) => {
    setSaving(true);
    try {
      await aprobarPrestamo(selectedAprobar.id_prestamo, { observaciones_salida });
      setSelectedAprobar(null);
      toast.success('Préstamo aprobado y equipo entregado.');
      refetch();
    } catch (ex) {
      toast.error(ex.response?.data?.error ?? 'No se pudo registrar la salida del equipo.');
    } finally { setSaving(false); }
  };

  const handleRechazar = async (p) => {
    if (!window.confirm(`¿Rechazar la solicitud #${p.id_prestamo}?`)) return;
    try {
      await rechazarPrestamo(p.id_prestamo);
      toast.success('Solicitud rechazada.');
      refetch();
    } catch (ex) {
      toast.error(ex.response?.data?.error ?? 'Error al rechazar.');
    }
  };

  const Section = ({ title, icon: Icon, items, pag, color, badgeColor, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className={`px-6 py-4 border-b ${color} flex items-center gap-2`}>
        <Icon size={15} className={`text-${badgeColor}-700`} />
        <h2 className={`text-sm font-bold text-${badgeColor}-700`}>{title}</h2>
        <span className={`ml-1 bg-${badgeColor}-200 text-${badgeColor}-800 text-xs font-bold px-2 py-0.5 rounded-full`}>{items.length}</span>
      </div>
      {children}
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      {modalNuevo && (
        <ModalNuevoPrestamo
          onClose={() => setModalNuevo(false)}
          onSuccess={() => { setModalNuevo(false); refetch(); }}
        />
      )}
      {selected && (
        <ModalDevolucion prestamo={selected} loading={saving}
          onClose={() => setSelected(null)} onConfirm={handleConfirmDevolucion} />
      )}
      {selectedAprobar && (
        <ModalAprobacion prestamo={selectedAprobar} loading={saving}
          onClose={() => setSelectedAprobar(null)} onConfirm={handleConfirmAprobar} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Préstamos</h1>
          <p className="text-gray-500 mt-1 text-sm">Control cronológico de préstamos de equipos</p>
        </div>
        {admin && (
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => setModalNuevo(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-carrera-blue text-white text-sm font-semibold rounded-xl hover:bg-blue-900 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              <Plus size={16} /> Nuevo Préstamo
            </button>
            <button
              onClick={() => exportarPDF(prestamos)}
              disabled={prestamos.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-carrera-green text-white text-sm font-semibold rounded-xl hover:bg-green-800 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FileDown size={16} /> Exportar PDF
            </button>
          </div>
        )}
      </div>

      {loading && <LoadingSkeleton count={3} type="table" />}

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />{error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Pendientes (solo Admin) */}
          {admin && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-blue-100 bg-blue-50 flex items-center gap-2">
                <Clock size={15} className="text-blue-700" />
                <h2 className="text-sm font-bold text-blue-700">Solicitudes pendientes</h2>
                <span className="ml-1 bg-blue-200 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">{pendientes.length}</span>
                {pendientes.length > 0 && (
                  <span className="ml-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                )}
              </div>
              {pendientes.length === 0
                ? <div className="py-10 text-center"><Clock size={32} className="text-gray-200 mx-auto mb-3"/><p className="text-gray-400 text-sm">No hay solicitudes pendientes.</p></div>
                : <TablaPrestamos items={pagPendientes.paginated} total={pendientes.length} pag={pagPendientes} onDevolver={setSelected} onAprobar={handleAprobar} onRechazar={handleRechazar} adminMode={admin} />
              }
            </div>
          )}

          {/* Activos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-amber-100 bg-amber-50 flex items-center gap-2">
              <Clock size={15} className="text-amber-700" />
              <h2 className="text-sm font-bold text-amber-700">Préstamos activos</h2>
              <span className="ml-1 bg-amber-200 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">{activos.length}</span>
            </div>
            {activos.length === 0
              ? <div className="py-14 text-center"><Clock size={36} className="text-gray-200 mx-auto mb-3"/><p className="text-gray-400 text-sm">No hay préstamos activos.</p></div>
              : <TablaPrestamos items={pagActivos.paginated} total={activos.length} pag={pagActivos} onDevolver={setSelected} onAprobar={handleAprobar} onRechazar={handleRechazar} adminMode={admin} />
            }
          </div>

          {/* Devueltos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50 flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-700" />
              <h2 className="text-sm font-bold text-emerald-700">Historial de devoluciones</h2>
              <span className="ml-1 bg-emerald-200 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">{devueltos.length}</span>
            </div>
            {devueltos.length === 0
              ? <div className="py-14 text-center"><CheckCircle size={36} className="text-gray-200 mx-auto mb-3"/><p className="text-gray-400 text-sm">Aún no hay devoluciones.</p></div>
              : <TablaPrestamos items={pagDevueltos.paginated} total={devueltos.length} pag={pagDevueltos} onDevolver={setSelected} onAprobar={handleAprobar} onRechazar={handleRechazar} adminMode={admin} />
            }
          </div>

          {/* Rechazados */}
          {rechazados.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex items-center gap-2">
                <X size={15} className="text-red-600" />
                <h2 className="text-sm font-bold text-red-600">Solicitudes rechazadas</h2>
                <span className="ml-1 bg-red-200 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{rechazados.length}</span>
              </div>
              <TablaPrestamos items={pagRechazados.paginated} total={rechazados.length} pag={pagRechazados} onDevolver={setSelected} onAprobar={handleAprobar} onRechazar={handleRechazar} adminMode={admin} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Prestamos;

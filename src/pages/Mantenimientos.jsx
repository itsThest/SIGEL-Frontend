import React, { useState } from 'react';
import { AlertTriangle, Wrench, CheckCircle, X, Plus } from 'lucide-react';
import useApi from '../hooks/useApi';
import { getMantenimientos, registrarIngreso, registrarSalida } from '../services/mantenimientosService';
import { getActivos } from '../services/activosService';

/* ── Helpers ─────────────────────────────────────────────────── */
const formatFecha = (iso) =>
  iso ? new Date(iso).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' }) : '—';

const Spinner = () => (
  <div className="flex justify-center py-20">
    <svg className="animate-spin h-8 w-8 text-carrera-blue" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  </div>
);

/* ── Badge de estado ─────────────────────────────────────────── */
const EstadoBadge = ({ value }) => {
  const map = {
    'En Proceso': { cls: 'bg-yellow-50 text-yellow-700 border-yellow-200',  icon: Wrench },
    'Finalizado': { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  };
  const { cls, icon: Icon } = map[value] ?? { cls: 'bg-gray-100 text-gray-600 border-gray-200', icon: Wrench };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
      <Icon size={11} /> {value}
    </span>
  );
};

/* ── Modal: Registrar Mantenimiento ──────────────────────────── */
const TIPOS_MANT = [
  'Mantenimiento preventivo',
  'Mantenimiento preventivo - Inspección integral del equipo',
  'Mantenimiento preventivo especializado',
  'Calibración de equipos',
];

const ModalNuevoMantenimiento = ({ onClose, onSuccess }) => {
  // Cargar activos disponibles al abrir el modal
  const { data: activosData, loading: loadingActivos } = useApi(getActivos);
  const disponibles = (activosData?.data ?? []).filter(a => a.disponibilidad === 'Disponible');

  const [form, setForm] = useState({
    id_activo: '',
    tipo_mantenimiento: 'Mantenimiento preventivo',
    detalles: '',
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState(null);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.id_activo) { setErr('Selecciona un equipo disponible.'); return; }
    setSaving(true); setErr(null);
    try {
      await registrarIngreso({
        id_activo:          Number(form.id_activo),
        tipo_mantenimiento: form.tipo_mantenimiento,
        detalles:           form.detalles,
      });
      onSuccess();
    } catch (ex) {
      setErr(ex.response?.data?.error ?? 'Error al registrar el mantenimiento.');
    } finally { setSaving(false); }
  };

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-carrera-blue/30 focus:border-carrera-blue text-sm transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-carrera-blue">
          <div>
            <h2 className="text-base font-bold text-white">Registrar mantenimiento</h2>
            <p className="text-xs text-white/60 mt-0.5">El equipo pasará a estado "En Mantenimiento"</p>
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

          {/* Selección de activo */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Equipo disponible <span className="text-utn-red">*</span>
            </label>
            {loadingActivos ? (
              <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-400">
                <svg className="animate-spin h-4 w-4 text-carrera-blue" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Cargando equipos…
              </div>
            ) : disponibles.length === 0 ? (
              <div className="px-3 py-2.5 border border-amber-200 rounded-xl bg-amber-50 text-sm text-amber-700">
                No hay equipos disponibles para mantenimiento en este momento.
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

          {/* Tipo de mantenimiento */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Tipo de mantenimiento <span className="text-utn-red">*</span>
            </label>
            <select
              name="tipo_mantenimiento"
              value={form.tipo_mantenimiento}
              onChange={handle}
              required
              className={inputCls}
            >
              {TIPOS_MANT.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          {/* Detalles del problema */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Detalles del problema / motivo <span className="text-utn-red">*</span>
            </label>
            <textarea
              name="detalles"
              value={form.detalles}
              onChange={handle}
              required
              rows={4}
              placeholder="Describe el problema detectado o el motivo del mantenimiento…"
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-1 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving || loadingActivos || disponibles.length === 0}
              className="px-5 py-2.5 rounded-xl bg-carrera-blue text-white text-sm font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md">
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Registrando…
                </>
              ) : (
                <><Wrench size={15} /> Registrar ingreso</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Modal: Finalizar reparación ─────────────────────────────── */
const ModalFinalizar = ({ mant, onClose, onConfirm, loading }) => {
  const [detalles, setDetalles] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-carrera-green">
          <h2 className="text-base font-bold text-white">Finalizar reparación</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
            <p><span className="font-semibold text-gray-600">Mantenimiento #:</span> {mant.id_mantenimiento}</p>
            <p><span className="font-semibold text-gray-600">Activo #:</span> {mant.id_activo}</p>
            <p><span className="font-semibold text-gray-600">Tipo:</span> {mant.tipo_mantenimiento}</p>
            <p><span className="font-semibold text-gray-600">Ingreso:</span> {formatFecha(mant.fecha_ingreso)}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Detalles de la reparación <span className="text-utn-red">*</span>
            </label>
            <textarea value={detalles} onChange={e => setDetalles(e.target.value)} rows={3}
              placeholder="Se reemplazó la fuente de poder, equipo funcionando correctamente..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-carrera-green/30 focus:border-carrera-green text-sm resize-none transition-all" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={() => onConfirm(detalles)} disabled={loading || !detalles.trim()}
              className="px-5 py-2 rounded-xl bg-carrera-green text-white text-sm font-semibold hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center gap-2">
              {loading
                ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Guardando…</>
                : <><CheckCircle size={15}/> Finalizar</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Tabla de mantenimientos ─────────────────────────────────── */
const TablaMantenimientos = ({ items, onFinalizar }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-100">
          {['#', 'ID Activo', 'Tipo', 'Detalles técnicos', 'Ingreso', 'Salida', 'Estado', 'Acción'].map(h => (
            <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {items.map(m => (
          <tr key={m.id_mantenimiento} className="hover:bg-gray-50/60 transition-colors">
            <td className="px-5 py-3.5 font-mono text-xs text-gray-400">#{m.id_mantenimiento}</td>
            <td className="px-5 py-3.5 font-semibold text-gray-800">{m.id_activo}</td>
            <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{m.tipo_mantenimiento}</td>
            <td className="px-5 py-3.5 text-gray-500 max-w-sm"><p className="line-clamp-2 leading-snug">{m.detalles || '—'}</p></td>
            <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{formatFecha(m.fecha_ingreso)}</td>
            <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{formatFecha(m.fecha_salida)}</td>
            <td className="px-5 py-3.5"><EstadoBadge value={m.estado_mantenimiento} /></td>
            <td className="px-5 py-3.5">
              {m.estado_mantenimiento === 'En Proceso' && (
                <button onClick={() => onFinalizar(m)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-carrera-green text-white text-xs font-semibold rounded-lg hover:bg-green-800 transition-colors shadow-sm">
                  <CheckCircle size={13} /> Finalizar
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ── Página principal ─────────────────────────────────────────── */
const Mantenimientos = () => {
  const { data, loading, error, refetch } = useApi(getMantenimientos);
  const [modalNuevo,   setModalNuevo]   = useState(false);
  const [selectedFin,  setSelectedFin]  = useState(null);
  const [savingFin,    setSavingFin]    = useState(false);

  const lista      = data?.data ?? [];
  const enProceso  = lista.filter(m => m.estado_mantenimiento === 'En Proceso');
  const finalizados = lista.filter(m => m.estado_mantenimiento === 'Finalizado');

  const handleFinalizar = async (detalles_reparacion) => {
    setSavingFin(true);
    try {
      await registrarSalida(selectedFin.id_mantenimiento, { detalles_reparacion });
      setSelectedFin(null);
      refetch();
    } catch (ex) {
      alert(ex.response?.data?.error ?? 'Error al finalizar el mantenimiento.');
    } finally { setSavingFin(false); }
  };

  return (
    <div>
      {/* Modales */}
      {modalNuevo && (
        <ModalNuevoMantenimiento
          onClose={() => setModalNuevo(false)}
          onSuccess={() => { setModalNuevo(false); refetch(); }}
        />
      )}
      {selectedFin && (
        <ModalFinalizar mant={selectedFin} loading={savingFin}
          onClose={() => setSelectedFin(null)} onConfirm={handleFinalizar} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mantenimientos</h1>
          <p className="text-gray-500 mt-1 text-sm">Historial técnico de reparaciones y revisiones</p>
        </div>
        <button
          onClick={() => setModalNuevo(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-carrera-blue text-white text-sm font-semibold rounded-xl hover:bg-blue-900 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 self-start sm:self-auto"
        >
          <Plus size={16} /> Registrar Mantenimiento
        </button>
      </div>

      {loading && <Spinner />}

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />{error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* En proceso */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-yellow-100 bg-yellow-50 flex items-center gap-2">
              <Wrench size={15} className="text-yellow-700" />
              <h2 className="text-sm font-bold text-yellow-700">En proceso</h2>
              <span className="ml-1 bg-yellow-200 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">{enProceso.length}</span>
            </div>
            {enProceso.length === 0
              ? <div className="py-14 text-center"><Wrench size={36} className="text-gray-200 mx-auto mb-3"/><p className="text-gray-400 text-sm">No hay equipos en mantenimiento activo.</p></div>
              : <TablaMantenimientos items={enProceso} onFinalizar={setSelectedFin} />
            }
          </div>

          {/* Historial finalizado */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50 flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-700" />
              <h2 className="text-sm font-bold text-emerald-700">Historial finalizado</h2>
              <span className="ml-1 bg-emerald-200 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">{finalizados.length}</span>
            </div>
            {finalizados.length === 0
              ? <div className="py-14 text-center"><CheckCircle size={36} className="text-gray-200 mx-auto mb-3"/><p className="text-gray-400 text-sm">Aún no hay mantenimientos finalizados.</p></div>
              : <TablaMantenimientos items={finalizados} onFinalizar={setSelectedFin} />
            }
          </div>
        </>
      )}
    </div>
  );
};

export default Mantenimientos;

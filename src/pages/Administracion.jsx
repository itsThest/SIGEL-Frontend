import React, { useState, useMemo, useCallback } from 'react';
import {
  Shield, Users, BookOpen, GraduationCap, ArrowUpCircle,
  Snowflake, AlertTriangle, CheckCircle, X, Loader2,
  Search, Edit2, ChevronRight, Info, UserCheck, UserX,
  LayoutList, Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useApi from '../hooks/useApi';
import { getUsuariosAdmin, gestionarUsuario, avanzarSemestres } from '../services/usuariosService';
import { getMaterias, crearMateria, editarMateria } from '../services/materiasService';

/* ═══════════════════════════════════════════════════════════════════════════
   UTILIDADES
══════════════════════════════════════════════════════════════════════════ */

const ROL_MAP = {
  1: { label: 'Administrador', cls: 'bg-purple-100 text-purple-800 border-purple-200' },
  2: { label: 'Técnico',       cls: 'bg-blue-100   text-blue-800   border-blue-200'   },
  3: { label: 'Estudiante',    cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  4: { label: 'Docente',       cls: 'bg-amber-100   text-amber-800   border-amber-200'  },
  5: { label: 'Graduado',      cls: 'bg-gray-100    text-gray-600    border-gray-200'   },
};

const RolBadge = ({ id_rol, nombre_rol }) => {
  const info = ROL_MAP[id_rol] ?? { label: nombre_rol ?? 'Sin rol', cls: 'bg-gray-100 text-gray-600 border-gray-200' };
  return (
    <span className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full border ${info.cls}`}>
      {info.label}
    </span>
  );
};

const ActivoBadge = ({ activo }) => activo
  ? <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"><UserCheck size={10} />Activo</span>
  : <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200"><UserX size={10} />Inactivo</span>;

const Toggle = ({ checked, onChange, colorOn = 'bg-carrera-blue', disabled = false }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none
      ${checked ? colorOn : 'bg-gray-200'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200
        ${checked ? 'translate-x-4' : 'translate-x-0.5'}`}
    />
  </button>
);

const MetricCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className={`flex items-center gap-3 p-4 ${bg} rounded-xl`}>
    <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
      <Icon size={18} className={color} />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 1 — GESTIÓN DE USUARIOS
══════════════════════════════════════════════════════════════════════════ */

/* ── Modal de edición de usuario ── */
const ModalEditarUsuario = ({ usuario, onClose, onSave }) => {
  const [form, setForm] = useState({
    id_rol:   usuario.id_rol  ?? 3,
    semestre: usuario.semestre ?? '',
    activo:   usuario.activo  ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState(null);

  const esEstudiante = Number(form.id_rol) === 3;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      const body = {
        id_rol:   Number(form.id_rol),
        activo:   form.activo,
        semestre: esEstudiante && form.semestre !== '' ? Number(form.semestre) : null,
      };
      await onSave(usuario.id_usuario, body);
    } catch (ex) {
      setErr(ex.response?.data?.error ?? 'Error al guardar los cambios.');
    } finally { setSaving(false); }
  };

  const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-carrera-blue/30 focus:border-carrera-blue text-sm transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-carrera-blue">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Edit2 size={14} /> Editar usuario
            </h2>
            <p className="text-xs text-white/60 mt-0.5">
              {usuario.nombres} {usuario.apellidos}
            </p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          {err && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-sm">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />{err}
            </div>
          )}

          {/* Info del usuario */}
          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-0.5">
            <p><span className="font-semibold text-gray-700">Correo:</span> {usuario.correo}</p>
            {usuario.identificacion && <p><span className="font-semibold text-gray-700">Cédula:</span> {usuario.identificacion}</p>}
          </div>

          {/* Rol */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Rol del usuario</label>
            <select
              value={form.id_rol}
              onChange={e => setForm(f => ({ ...f, id_rol: e.target.value }))}
              className={inputCls}
            >
              <option value={1}>Administrador</option>
              <option value={2}>Técnico</option>
              <option value={3}>Estudiante</option>
              <option value={4}>Docente</option>
              <option value={5}>Graduado</option>
            </select>
          </div>

          {/* Semestre — solo visible si es Estudiante */}
          {esEstudiante && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Semestre actual
                <span className="ml-1 font-normal text-gray-400">(1–8, vacío = sin asignar)</span>
              </label>
              <input
                type="number"
                min={1} max={8}
                value={form.semestre}
                onChange={e => setForm(f => ({ ...f, semestre: e.target.value }))}
                placeholder="Ej: 3"
                className={inputCls}
              />
            </div>
          )}

          {/* Toggles */}
          <div className="space-y-4 border-t border-gray-100 pt-4">
            {/* Activo / Inactivo */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-lg ${form.activo ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  {form.activo ? <UserCheck size={14} className="text-emerald-600" /> : <UserX size={14} className="text-red-500" />}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Estado de la cuenta</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {form.activo ? 'El usuario puede iniciar sesión normalmente.' : 'El usuario está dado de baja y no puede acceder.'}
                  </p>
                </div>
              </div>
              <Toggle
                checked={form.activo}
                colorOn="bg-emerald-500"
                onChange={v => setForm(f => ({ ...f, activo: v }))}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-1 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-carrera-blue text-white text-sm font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
              {saving ? <><Loader2 size={14} className="animate-spin" />Guardando…</> : <><CheckCircle size={14} />Guardar cambios</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Tabla de usuarios ── */
const TabGestionUsuarios = () => {
  const { data, loading, error, refetch } = useApi(getUsuariosAdmin);
  const [busqueda, setBusqueda]   = useState('');
  const [editando, setEditando]   = useState(null);

  const usuarios = data?.data ?? [];

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return usuarios;
    return usuarios.filter(u =>
      u.nombres?.toLowerCase().includes(q)      ||
      u.apellidos?.toLowerCase().includes(q)    ||
      u.correo?.toLowerCase().includes(q)       ||
      u.identificacion?.toLowerCase().includes(q)
    );
  }, [usuarios, busqueda]);

  const handleSave = async (id, body) => {
    await gestionarUsuario(id, body);
    toast.success('Usuario actualizado correctamente.');
    setEditando(null);
    refetch();
  };

  return (
    <div className="space-y-4">
      {editando && (
        <ModalEditarUsuario
          usuario={editando}
          onClose={() => setEditando(null)}
          onSave={handleSave}
        />
      )}

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, correo o cédula…"
          className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-carrera-blue/30 focus:border-carrera-blue text-sm placeholder-gray-400 shadow-sm transition-all"
        />
        {busqueda && (
          <button onClick={() => setBusqueda('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-14">
          <Loader2 size={28} className="animate-spin text-carrera-blue opacity-50" />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />{error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtrados.length === 0 ? (
            <div className="py-14 text-center">
              <Users size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No se encontraron usuarios.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Nombre', 'Correo / Cédula', 'Rol', 'Semestre', 'Estado', 'Acciones'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtrados.map(u => (
                    <tr key={u.id_usuario} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-carrera-blue to-blue-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {u.nombres?.[0]}{u.apellidos?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-xs leading-tight">
                              {u.nombres} {u.apellidos}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs text-gray-600">{u.correo}</p>
                        {u.identificacion && <p className="text-[11px] text-gray-400 font-mono">{u.identificacion}</p>}
                      </td>
                      <td className="px-5 py-3.5">
                        <RolBadge id_rol={u.id_rol} nombre_rol={u.nombre_rol} />
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {u.semestre
                          ? <span className="font-mono font-bold text-carrera-blue text-sm">{u.semestre}°</span>
                          : <span className="text-gray-300 text-xs">—</span>
                        }
                      </td>
                      <td className="px-5 py-3.5">
                        <ActivoBadge activo={u.activo} />
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setEditando(u)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-carrera-blue/10 text-carrera-blue text-xs font-semibold rounded-lg hover:bg-carrera-blue hover:text-white transition-all duration-200"
                        >
                          <Edit2 size={11} /> Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50">
                <p className="text-xs text-gray-400">
                  Mostrando <strong>{filtrados.length}</strong> de <strong>{usuarios.length}</strong> usuarios
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 2 — CONTROL ACADÉMICO (Avance Masivo)
══════════════════════════════════════════════════════════════════════════ */

const TabControlAcademico = () => {
  const [textoConfirm, setTextoConfirm] = useState('');
  const [loading, setLoading]           = useState(false);
  const [resultado, setResultado]       = useState(null);

  const PALABRA = 'CONFIRMAR';
  const habilitado = textoConfirm.trim().toUpperCase() === PALABRA && !loading;

  const handleEjecutar = async () => {
    if (!habilitado) return;
    setLoading(true); setResultado(null);
    try {
      const res = await avanzarSemestres();
      setResultado(res.data);
      setTextoConfirm('');
      toast.success('¡Avance de semestre completado!', { duration: 5000, icon: '🎓' });
    } catch (ex) {
      toast.error(ex.response?.data?.error ?? 'Error al ejecutar el avance.');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Card de advertencia */}
      <div className="bg-white rounded-2xl border-2 border-red-100 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-amber-400" />
        <div className="p-6 space-y-5">

          {/* Encabezado */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-50 rounded-xl flex-shrink-0">
              <GraduationCap size={24} className="text-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">Cierre de Ciclo Académico</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-full uppercase tracking-wide">Irreversible</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Esta acción avanzará a <strong>todos los estudiantes activos</strong> al siguiente semestre.
                Los de <strong>8vo semestre</strong> pasarán a ser <strong>Graduados</strong>.
                Los estudiantes con semestre <strong>congelado</strong> no serán afectados.
              </p>
            </div>
          </div>

          {/* Bullets de impacto */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2.5">
            <p className="text-[11px] font-bold text-red-700 uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle size={12} /> ¿Qué ocurrirá?
            </p>
            {[
              { icon: ArrowUpCircle, cls: 'text-blue-600 bg-blue-50',    text: 'Estudiantes de Semestre 1–7 avanzarán +1 de forma masiva.' },
              { icon: GraduationCap, cls: 'text-emerald-600 bg-emerald-50', text: 'Estudiantes de 8vo Semestre → Graduados (semestre = null).' },
              { icon: Snowflake,     cls: 'text-sky-600 bg-sky-50',       text: 'Estudiantes con semestre congelado NO serán modificados.' },
              { icon: AlertTriangle, cls: 'text-amber-600 bg-amber-50',   text: 'La operación es atómica. Si falla, se revierten todos los cambios.' },
            ].map(({ icon: Icon, cls, text }) => (
              <div key={text} className="flex items-start gap-2.5">
                <div className={`p-1 rounded-md flex-shrink-0 mt-0.5 ${cls.split(' ')[1]}`}>
                  <Icon size={10} className={cls.split(' ')[0]} />
                </div>
                <p className="text-xs text-red-800 leading-snug">{text}</p>
              </div>
            ))}
          </div>

          {/* Input de confirmación */}
          {!resultado && (
            <div className="space-y-3 border-t border-gray-100 pt-4">
              <div className="flex items-start gap-2 text-xs text-gray-500">
                <Info size={13} className="flex-shrink-0 mt-0.5 text-gray-400" />
                <p>
                  Escribe{' '}
                  <span className="font-mono font-bold bg-gray-100 text-red-600 px-1.5 py-0.5 rounded">{PALABRA}</span>
                  {' '}en el campo para habilitar el botón de ejecución:
                </p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={textoConfirm}
                  onChange={e => setTextoConfirm(e.target.value)}
                  disabled={loading}
                  placeholder={`Escribe ${PALABRA} para habilitar`}
                  className={`w-full px-4 py-3 border-2 rounded-xl font-mono text-sm transition-all
                    placeholder-gray-300 focus:outline-none
                    ${habilitado ? 'border-red-400 bg-red-50/40 text-red-700' : 'border-gray-200 bg-gray-50 text-gray-700 focus:border-carrera-blue/50 focus:bg-white'}
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {habilitado && (
                  <CheckCircle size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                )}
              </div>

              {/* Barra de progreso indeterminada */}
              {loading && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Loader2 size={13} className="animate-spin text-orange-500" />
                    <p className="text-xs text-gray-500">Procesando avance masivo…</p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-500 via-orange-400 to-amber-400"
                      style={{ width: '55%', animation: 'indeterminate 1.4s ease-in-out infinite' }}
                    />
                    <style>{`@keyframes indeterminate{0%{transform:translateX(-145%)}100%{transform:translateX(300%)}}`}</style>
                  </div>
                </div>
              )}

              <button
                onClick={handleEjecutar}
                disabled={!habilitado}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold
                  bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md
                  hover:from-red-700 hover:to-orange-600 hover:shadow-lg transition-all duration-200
                  hover:-translate-y-0.5 active:scale-95
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Procesando…</>
                  : <><ArrowUpCircle size={15} /> Ejecutar Avance de Semestre <ChevronRight size={13} /></>
                }
              </button>
            </div>
          )}

          {/* Resultado */}
          {resultado && !loading && (
            <div className="border-t border-gray-100 pt-4 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <CheckCircle size={17} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-emerald-800">¡Avance ejecutado con éxito!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">{resultado.message}</p>
                </div>
                <button onClick={() => setResultado(null)} className="text-emerald-400 hover:text-emerald-600 transition-colors">
                  <X size={14} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <MetricCard icon={ArrowUpCircle} label="Avanzaron semestre" value={resultado.avanzados ?? 0} color="text-blue-600" bg="bg-blue-50" />
                <MetricCard icon={GraduationCap}  label="Nuevos graduados"   value={resultado.egresados ?? 0} color="text-emerald-600" bg="bg-emerald-50" />
                <MetricCard icon={Users}           label="Total procesados"    value={(resultado.avanzados ?? 0) + (resultado.egresados ?? 0)} color="text-purple-600" bg="bg-purple-50" />
              </div>
              <button onClick={() => setResultado(null)} className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1">
                Preparar nuevo avance
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 3 — MALLA CURRICULAR (Solo lectura)
══════════════════════════════════════════════════════════════════════════ */

const SEMESTRE_COLORS = [
  'from-blue-500 to-blue-600',
  'from-indigo-500 to-indigo-600',
  'from-violet-500 to-violet-600',
  'from-purple-500 to-purple-600',
  'from-fuchsia-500 to-fuchsia-600',
  'from-pink-500 to-pink-600',
  'from-rose-500 to-rose-600',
  'from-orange-500 to-orange-600',
];

/* ── Modal de creación/edición de materia ── */
const ModalMateria = ({ materia, onClose, onSave }) => {
  const [form, setForm] = useState({
    nombre_materia: materia?.nombre_materia || '',
    semestre:       materia?.semestre || '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState(null);

  const isEdit = !!materia;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      const body = {
        nombre_materia: form.nombre_materia.trim(),
        semestre: form.semestre ? Number(form.semestre) : null,
      };
      if (isEdit) {
        await onSave(materia.id_materia, body);
      } else {
        await onSave(null, body);
      }
    } catch (ex) {
      setErr(ex.response?.data?.error ?? 'Error al guardar la materia.');
    } finally { setSaving(false); }
  };

  const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-carrera-blue/30 focus:border-carrera-blue text-sm transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 bg-carrera-blue">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            {isEdit ? <Edit2 size={14} /> : <Plus size={14} />} 
            {isEdit ? 'Editar materia' : 'Nueva materia'}
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          {err && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-sm">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />{err}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre de la materia *</label>
            <input
              type="text"
              required
              value={form.nombre_materia}
              onChange={e => setForm(f => ({ ...f, nombre_materia: e.target.value }))}
              placeholder="Ej: Redes de Comunicaciones"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Semestre (1 al 8)</label>
            <input
              type="number"
              min={1} max={8}
              value={form.semestre}
              onChange={e => setForm(f => ({ ...f, semestre: e.target.value }))}
              placeholder="Ej: 4"
              className={inputCls}
            />
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving || !form.nombre_materia.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-carrera-blue text-white text-sm font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
              {saving ? <><Loader2 size={14} className="animate-spin" />Guardando…</> : <><CheckCircle size={14} />{isEdit ? 'Guardar' : 'Crear'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TabMallaCurricular = () => {
  const { data, loading, error, refetch } = useApi(getMaterias);
  const materias = data?.data ?? [];

  const [modalMateria, setModalMateria] = useState(false);
  const [editandoMateria, setEditandoMateria] = useState(null);

  // Agrupar por semestre
  const porSemestre = useMemo(() => {
    const grupos = {};
    materias.forEach(m => {
      const key = m.semestre ?? 'Sin semestre';
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(m);
    });
    // Ordenar: primero numéricos 1-8, luego "Sin semestre"
    return Object.entries(grupos).sort(([a], [b]) => {
      const na = Number(a), nb = Number(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      if (!isNaN(na)) return -1;
      return 1;
    });
  }, [materias]);

  const handleSaveMateria = async (id, body) => {
    if (id) {
      await editarMateria(id, body);
      toast.success('Materia actualizada correctamente.');
    } else {
      await crearMateria(body);
      toast.success('Materia creada correctamente.');
    }
    setModalMateria(false);
    setEditandoMateria(null);
    refetch();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-14">
      <Loader2 size={28} className="animate-spin text-carrera-blue opacity-50" />
    </div>
  );

  if (error) return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
      <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />{error}
    </div>
  );

  return (
    <div className="space-y-4">
      {(modalMateria || editandoMateria) && (
        <ModalMateria
          materia={editandoMateria}
          onClose={() => { setModalMateria(false); setEditandoMateria(null); }}
          onSave={handleSaveMateria}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <LayoutList size={14} className="text-gray-400" />
          <span>Malla Curricular ({materias.length} materias)</span>
        </div>
        <button
          onClick={() => setModalMateria(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-carrera-blue text-white text-xs font-semibold rounded-lg hover:bg-blue-900 transition-all shadow-sm"
        >
          <Plus size={14} /> Nueva Materia
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {porSemestre.map(([semestre, lista], idx) => {
          const colorClass = SEMESTRE_COLORS[(Number(semestre) - 1) % SEMESTRE_COLORS.length] ?? 'from-gray-400 to-gray-500';
          return (
            <div key={semestre} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header del semestre */}
              <div className={`bg-gradient-to-r ${colorClass} px-4 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm">
                    {isNaN(Number(semestre)) ? semestre : `Semestre ${semestre}`}
                  </span>
                </div>
                <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {lista.length} materia{lista.length !== 1 ? 's' : ''}
                </span>
              </div>
              {/* Lista de materias */}
              <ul className="divide-y divide-gray-50">
                {lista.map((m, i) => (
                  <li key={m.id_materia} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-gray-50/60 transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-gray-100 group-hover:bg-carrera-blue/10 text-gray-400 group-hover:text-carrera-blue text-[10px] font-bold flex items-center justify-center flex-shrink-0 transition-colors">
                        {i + 1}
                      </span>
                      <span className="text-xs text-gray-700 font-medium leading-snug">{m.nombre_materia}</span>
                    </div>
                    <button
                      onClick={() => setEditandoMateria(m)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-carrera-blue hover:bg-carrera-blue/10 rounded-lg transition-all"
                      title="Editar materia"
                    >
                      <Edit2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {porSemestre.length === 0 && (
        <div className="py-14 text-center">
          <BookOpen size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No hay materias registradas en la malla curricular.</p>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL — Sistema de Pestañas
══════════════════════════════════════════════════════════════════════════ */

const TABS = [
  { id: 'usuarios',    label: 'Gestión de Usuarios',  icon: Users,         component: TabGestionUsuarios   },
  { id: 'academico',   label: 'Control Académico',     icon: GraduationCap, component: TabControlAcademico  },
  { id: 'malla',       label: 'Malla Curricular',      icon: BookOpen,      component: TabMallaCurricular   },
];

const Administracion = () => {
  const [activeTab, setActiveTab] = useState('usuarios');
  const TabContent = TABS.find(t => t.id === activeTab)?.component ?? null;

  return (
    <div className="animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-start gap-3 mb-7">
        <div className="p-2.5 bg-red-50 rounded-xl flex-shrink-0 mt-0.5">
          <Shield size={20} className="text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administración</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Panel de control — Solo disponible para el Administrador</p>
        </div>
      </div>

      {/* ── Menú de pestañas ── */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-2xl mb-6 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-1 justify-center
                ${active
                  ? 'bg-white text-carrera-blue shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Contenido de la pestaña activa ── */}
      <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {TabContent && <TabContent />}
      </div>

      {/* Aviso de seguridad */}
      <div className="mt-8 flex items-start gap-3 bg-gray-50 border border-gray-200 text-gray-500 px-4 py-3.5 rounded-xl text-xs">
        <Shield size={13} className="mt-0.5 flex-shrink-0 text-gray-400" />
        <p>
          Todas las acciones quedan registradas en la consola del servidor y se ejecutan
          dentro de transacciones SQL atómicas. Ante cualquier error, los cambios se revierten automáticamente.
        </p>
      </div>
    </div>
  );
};

export default Administracion;

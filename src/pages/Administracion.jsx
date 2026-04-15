import React, { useState } from 'react';
import {
  AlertTriangle, GraduationCap, ArrowUpCircle, Shield,
  ChevronRight, CheckCircle, X, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { avanzarSemestres } from '../services/usuariosService';

/* ─── Modal de confirmación estricta ─────────────────────────────────── */
const ModalConfirmacionCiclo = ({ onClose, onConfirm, loading }) => {
  const [texto, setTexto] = useState('');
  const confirmado = texto.trim().toUpperCase() === 'CONFIRMAR';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header rojo de advertencia */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5 flex items-start gap-4">
          <div className="p-2 bg-white/15 rounded-xl flex-shrink-0">
            <AlertTriangle size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">¡Acción irreversible!</h2>
            <p className="text-xs text-red-100 mt-0.5 leading-relaxed">
              Cierre de Ciclo Académico — Avance de Semestre
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-4">
          {/* Descripción de impacto */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">¿Qué ocurrirá?</p>
            <ul className="space-y-1.5">
              {[
                { icon: ArrowUpCircle, color: 'text-blue-600', text: 'Todos los estudiantes de Semestre 1 al 7 avanzarán un semestre.' },
                { icon: GraduationCap, color: 'text-emerald-600', text: 'Los estudiantes de Semestre 8 serán marcados como Graduados (semestre = null).' },
                { icon: AlertTriangle, color: 'text-red-600', text: 'Esta acción NO se puede deshacer fácilmente.' },
              ].map(({ icon: Icon, color, text }) => (
                <li key={text} className="flex items-start gap-2 text-xs text-amber-700">
                  <Icon size={13} className={`${color} mt-0.5 flex-shrink-0`} />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Campo de confirmación tipada */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Para continuar, escribe{' '}
              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-red-600">CONFIRMAR</span>
              {' '}en el campo:
            </label>
            <input
              type="text"
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder="Escribe CONFIRMAR"
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-red-400 text-sm font-mono transition-all"
              autoFocus
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={!confirmado || loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Procesando…</>
                : <><GraduationCap size={15} /> Ejecutar Cierre</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Tarjeta de acción peligrosa ────────────────────────────────────── */
const DangerCard = ({ icon: Icon, title, description, buttonLabel, buttonIcon: BIcon, onClick, badgeText }) => (
  <div className="bg-white rounded-2xl border-2 border-red-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-200 overflow-hidden">
    {/* Franja de advertencia */}
    <div className="h-1.5 bg-gradient-to-r from-red-500 via-orange-400 to-amber-400" />
    <div className="p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-red-50 rounded-xl flex-shrink-0">
          <Icon size={22} className="text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
            {badgeText && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-full uppercase tracking-wide">
                {badgeText}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <button
          onClick={onClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-500 text-white text-sm font-semibold rounded-xl hover:from-red-700 hover:to-orange-600 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
        >
          <BIcon size={15} />
          {buttonLabel}
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  </div>
);

/* ─── Página principal de Administración ─────────────────────────────── */
const Administracion = () => {
  const [modalCiclo, setModalCiclo]   = useState(false);
  const [loadingCiclo, setLoadingCiclo] = useState(false);
  const [resultado, setResultado]       = useState(null);

  const handleAvanzarSemestre = async () => {
    setLoadingCiclo(true);
    try {
      const res = await avanzarSemestres();
      setModalCiclo(false);
      setResultado(res.data);
      toast.success(res.data.message, { duration: 6000, icon: '🎓' });
    } catch (ex) {
      toast.error(ex.response?.data?.error ?? 'Error al ejecutar el cierre académico.');
    } finally {
      setLoadingCiclo(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-3xl mx-auto">

      {/* Modal */}
      {modalCiclo && (
        <ModalConfirmacionCiclo
          onClose={() => setModalCiclo(false)}
          onConfirm={handleAvanzarSemestre}
          loading={loadingCiclo}
        />
      )}

      {/* Header */}
      <div className="mb-8 flex items-start gap-3">
        <div className="p-2.5 bg-red-50 rounded-xl flex-shrink-0 mt-0.5">
          <Shield size={20} className="text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administración</h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            Acciones de sistema — Solo disponibles para el Administrador
          </p>
        </div>
      </div>

      {/* Resultado de última acción */}
      {resultado && (
        <div className="mb-6 flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-xl text-sm animate-in slide-in-from-top-2 duration-300">
          <CheckCircle size={16} className="mt-0.5 flex-shrink-0 text-emerald-600" />
          <div>
            <p className="font-semibold">Cierre académico ejecutado con éxito</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              {resultado.egresados} graduado(s) · {resultado.avanzados} estudiante(s) avanzaron de semestre
            </p>
          </div>
          <button onClick={() => setResultado(null)} className="ml-auto text-emerald-500 hover:text-emerald-700">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Sección Ciclo Académico */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-gray-100" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ciclo Académico</span>
          <div className="h-px flex-1 bg-gray-100" />
        </div>

        <DangerCard
          icon={GraduationCap}
          title="Avanzar Semestre Académico"
          description="Incrementa el semestre de todos los estudiantes activos (Sem. 1–7) en 1 nivel. Los estudiantes de 8vo semestre pasan a estado Graduado (semestre nulo). Esta operación usa una transacción atómica SQL y no puede deshacerse fácilmente."
          buttonLabel="Avanzar Semestre"
          buttonIcon={ArrowUpCircle}
          badgeText="Irreversible"
          onClick={() => setModalCiclo(true)}
        />
      </div>

      {/* Aviso de seguridad */}
      <div className="mt-8 flex items-start gap-3 bg-gray-50 border border-gray-200 text-gray-500 px-4 py-3.5 rounded-xl text-xs">
        <Shield size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
        <p>
          Todas las acciones de esta sección quedan registradas en la consola del servidor y son ejecutadas
          dentro de transacciones SQL atómicas. Ante cualquier error, los cambios se revierten automáticamente.
        </p>
      </div>
    </div>
  );
};

export default Administracion;

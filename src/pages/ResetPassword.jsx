import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, FlaskConical, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../services/authService';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate   = useNavigate();

  const [nuevaPassword,    setNuevaPassword]    = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [showPass,         setShowPass]         = useState(false);
  const [showConfirm,      setShowConfirm]      = useState(false);
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState(null);
  const [success,          setSuccess]          = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (nuevaPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden. Por favor, verifica.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, nuevaPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'No se pudo restablecer la contraseña. El enlace puede haber expirado.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-carrera-blue/40 focus:border-carrera-blue transition-all duration-200 text-sm placeholder-gray-400";

  return (
    <div className="min-h-screen flex font-sans">
      {/* ── Panel izquierdo ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-16 py-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #003366 0%, #005a9e 50%, #00843D 100%)' }}
      >
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -bottom-24 -right-16 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 right-10 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative z-10 text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-white/15 p-6 rounded-2xl backdrop-blur-sm border border-white/20 shadow-2xl">
              <FlaskConical size={56} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight leading-tight">
            Nueva<br />Contraseña
          </h1>
          <p className="text-white/70 text-lg mt-4 max-w-xs mx-auto leading-relaxed">
            Elige una contraseña segura para proteger tu cuenta institucional
          </p>
          <div className="mt-10 inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white text-sm font-medium px-5 py-2 rounded-full backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-carrera-green animate-pulse" />
            UTN — Facultad Regional
          </div>
        </div>
      </div>

      {/* ── Panel derecho ────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Header móvil */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <FlaskConical size={28} className="text-carrera-blue" />
            <h2 className="text-xl font-bold text-carrera-blue">SIGEL Telecom</h2>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-carrera-blue transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Volver al inicio de sesión
          </Link>

          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Restablecer contraseña</h2>
            <p className="text-gray-500 mt-2 text-sm">
              Ingresa tu nueva contraseña. Debe tener al menos 6 caracteres.
            </p>
          </div>

          {/* Estado de éxito */}
          {success ? (
            <div className="flex flex-col items-center text-center py-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 w-full">
                <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-emerald-800 mb-2">¡Contraseña actualizada!</h3>
                <p className="text-sm text-emerald-700 leading-relaxed">
                  Tu contraseña ha sido cambiada exitosamente.
                  Serás redirigido al inicio de sesión en unos segundos...
                </p>
              </div>
              <Link
                to="/login"
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-carrera-blue text-white text-sm font-semibold hover:bg-blue-900 transition-all duration-300 shadow-md"
              >
                Ir al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              {/* Mensaje de error */}
              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nueva contraseña */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock size={18} />
                    </span>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={nuevaPassword}
                      onChange={(e) => setNuevaPassword(e.target.value)}
                      className={inputCls}
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock size={18} />
                    </span>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmarPassword}
                      onChange={(e) => setConfirmarPassword(e.target.value)}
                      className={`${inputCls} ${
                        confirmarPassword && nuevaPassword !== confirmarPassword
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                          : confirmarPassword && nuevaPassword === confirmarPassword
                          ? 'border-emerald-300 focus:ring-emerald-200 focus:border-emerald-400'
                          : ''
                      }`}
                      placeholder="Repite la contraseña"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {/* Indicador de coincidencia en tiempo real */}
                  {confirmarPassword && (
                    <p className={`text-xs mt-1.5 font-medium ${nuevaPassword === confirmarPassword ? 'text-emerald-600' : 'text-red-500'}`}>
                      {nuevaPassword === confirmarPassword ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-semibold text-white text-sm transition-all duration-300 shadow-md mt-2
                    ${loading
                      ? 'bg-carrera-blue/60 cursor-not-allowed'
                      : 'bg-carrera-blue hover:bg-blue-900 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                    }`}
                >
                  {loading ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <Lock size={17} />
                  )}
                  {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

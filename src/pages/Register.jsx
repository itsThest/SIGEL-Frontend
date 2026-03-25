import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import { Mail, Lock, User, CreditCard, AlertCircle, CheckCircle, FlaskConical, ArrowLeft } from 'lucide-react';

const UTN_DOMAIN = '@utn.edu.ec';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    identificacion: '',
    correo: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState(null);
  const [success, setSuccess]   = useState(false);

  const correoValido = form.correo.toLowerCase().endsWith(UTN_DOMAIN);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!correoValido) {
      setError(`Solo se permiten correos ${UTN_DOMAIN}`);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await register({
        nombres: form.nombres,
        apellidos: form.apellidos,
        identificacion: form.identificacion,
        correo: form.correo,
        password: form.password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'No se pudo completar el registro.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (extra = '') =>
    `w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-carrera-blue/40 focus:border-carrera-blue transition-all duration-200 text-sm placeholder-gray-400 ${extra}`;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md mx-4">
          <div className="flex justify-center mb-4">
            <div className="bg-carrera-green/10 p-4 rounded-full">
              <CheckCircle size={48} className="text-carrera-green" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Registro exitoso!</h2>
          <p className="text-gray-500 text-sm">Tu cuenta fue creada. Redirigiendo al inicio de sesión…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-sans">
      {/* Panel izquierdo decorativo */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-16 py-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #003366 0%, #005a9e 50%, #00843D 100%)' }}
      >
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -bottom-24 -right-16 w-96 h-96 bg-white/5 rounded-full" />
        <div className="relative z-10 text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-white/15 p-6 rounded-2xl backdrop-blur-sm border border-white/20 shadow-2xl">
              <FlaskConical size={56} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight leading-tight">
            Únete al Sistema<br />de Laboratorio
          </h1>
          <p className="text-white/70 text-lg mt-4 max-w-xs mx-auto leading-relaxed">
            Regístrate con tu correo institucional para solicitar préstamos de equipos
          </p>
          <div className="mt-10 inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white text-sm font-medium px-5 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-carrera-green animate-pulse" />
            Solo correos @utn.edu.ec
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Header móvil */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <FlaskConical size={28} className="text-carrera-blue" />
            <h2 className="text-xl font-bold text-carrera-blue">SIGEL Telecom</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Crear cuenta</h2>
            <p className="text-gray-500 mt-2 text-sm">Completa tus datos para registrarte como estudiante</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombres */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombres <span className="text-utn-red">*</span></label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><User size={17} /></span>
                  <input name="nombres" value={form.nombres} onChange={handle} required placeholder="Juan Carlos"
                    className={inputCls()} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Apellidos <span className="text-utn-red">*</span></label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><User size={17} /></span>
                  <input name="apellidos" value={form.apellidos} onChange={handle} required placeholder="Pérez López"
                    className={inputCls()} />
                </div>
              </div>
            </div>

            {/* Identificación */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Identificación / Cédula <span className="text-utn-red">*</span></label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><CreditCard size={17} /></span>
                <input name="identificacion" value={form.identificacion} onChange={handle} required placeholder="1234567890"
                  className={inputCls()} />
              </div>
            </div>

            {/* Correo institucional */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Correo Institucional <span className="text-utn-red">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={17} /></span>
                <input
                  name="correo" type="email" value={form.correo} onChange={handle} required
                  placeholder="nombre@utn.edu.ec"
                  className={inputCls(
                    form.correo
                      ? correoValido
                        ? 'border-carrera-green focus:border-carrera-green focus:ring-carrera-green/30'
                        : 'border-utn-red focus:border-utn-red focus:ring-red-300'
                      : ''
                  )}
                />
              </div>
              {/* Validación en tiempo real */}
              {form.correo && !correoValido && (
                <p className="mt-1.5 text-xs text-utn-red flex items-center gap-1">
                  <AlertCircle size={12} /> Solo se permiten correos @utn.edu.ec
                </p>
              )}
              {form.correo && correoValido && (
                <p className="mt-1.5 text-xs text-carrera-green flex items-center gap-1">
                  <CheckCircle size={12} /> Correo institucional válido
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña <span className="text-utn-red">*</span></label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={17} /></span>
                <input name="password" type="password" value={form.password} onChange={handle} required
                  placeholder="Mínimo 6 caracteres" className={inputCls()} />
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmar contraseña <span className="text-utn-red">*</span></label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={17} /></span>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handle} required
                  placeholder="Repite tu contraseña"
                  className={inputCls(
                    form.confirmPassword
                      ? form.password === form.confirmPassword
                        ? 'border-carrera-green focus:border-carrera-green focus:ring-carrera-green/30'
                        : 'border-utn-red focus:border-utn-red focus:ring-red-300'
                      : ''
                  )}
                />
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="mt-1.5 text-xs text-utn-red flex items-center gap-1">
                  <AlertCircle size={12} /> Las contraseñas no coinciden
                </p>
              )}
            </div>

            {/* Botón registrar */}
            <button
              type="submit"
              disabled={loading || (form.correo.length > 0 && !correoValido)}
              className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-semibold text-white text-sm transition-all duration-300 shadow-md mt-2
                ${loading || (form.correo.length > 0 && !correoValido)
                  ? 'bg-carrera-blue/50 cursor-not-allowed'
                  : 'bg-carrera-blue hover:bg-blue-900 hover:shadow-lg hover:-translate-y-0.5'
                }`}
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          {/* Link a login */}
          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-carrera-blue font-semibold hover:underline inline-flex items-center gap-1">
              <ArrowLeft size={14} /> Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

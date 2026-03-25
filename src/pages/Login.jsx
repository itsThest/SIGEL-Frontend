import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { Mail, Lock, LogIn, AlertCircle, FlaskConical } from 'lucide-react';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(correo, password);

      if (data.success || data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        navigate('/dashboard');
      } else {
        setError('Respuesta del servidor no válida.');
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'No se pudo conectar con el servidor. Verifica tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* ── Panel izquierdo ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-16 py-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #003366 0%, #005a9e 50%, #00843D 100%)' }}
      >
        {/* Círculos decorativos */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -bottom-24 -right-16 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 right-10 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative z-10 text-center">
          {/* Icono institucional */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/15 p-6 rounded-2xl backdrop-blur-sm border border-white/20 shadow-2xl">
              <FlaskConical size={56} className="text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight leading-tight">
            Sistema de Gestión<br />de Laboratorio
          </h1>
          <p className="text-white/70 text-lg mt-4 max-w-xs mx-auto leading-relaxed">
            Inventario y control de recursos de la Carrera de Telecomunicaciones
          </p>

          {/* Pill badge UTN */}
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

          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Iniciar sesión</h2>
            <p className="text-gray-500 mt-2 text-sm">Ingresa tus credenciales para continuar</p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Campo Correo Institucional */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Correo Institucional
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-carrera-blue/40 focus:border-carrera-blue transition-all duration-200 text-sm placeholder-gray-400"
                  placeholder="usuario@utn.edu.ec"
                  required
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-carrera-blue/40 focus:border-carrera-blue transition-all duration-200 text-sm placeholder-gray-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Botón */}
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
                <LogIn size={17} />
              )}
              {loading ? 'Autenticando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-10">
            ¿Eres estudiante?{' '}
            <a href="/register" className="text-carrera-blue font-medium cursor-pointer hover:underline">
              Regístrate aquí
            </a>
          </p>
          <p className="text-center text-xs text-gray-400 mt-2">
            ¿Problemas para ingresar?{' '}
            <span className="text-carrera-blue font-medium cursor-pointer hover:underline">
              Contacta al administrador
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

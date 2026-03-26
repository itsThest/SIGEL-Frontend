import React, { useEffect, useState } from 'react';
import { User, Mail, CreditCard, Shield, Clock, AlertTriangle, MonitorPlay } from 'lucide-react';
import { getPerfil } from '../services/usuariosService';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';

const Profile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await getPerfil();
        setData(res.data);
      } catch (err) {
        toast.error('No se pudo cargar el perfil.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <LoadingSkeleton count={1} type="table" />
        <LoadingSkeleton count={3} type="card" />
      </div>
    );
  }

  if (!data || !data.perfil) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle size={48} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700">Perfil no encontrado</h2>
        <p className="text-sm text-gray-500 mt-2">Prueba a cerrar sesión y volver a entrar.</p>
      </div>
    );
  }

  const { perfil, prestamos } = data;
  const displayName = perfil.nombres ? `${perfil.nombres} ${perfil.apellidos || ''}` : 'Usuario';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-500 mt-1 text-sm">Gestiona tu información y visualiza tus préstamos en curso.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tarjeta de Información del Usuario */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group transition-all duration-300 hover:shadow-md">
            {/* Fondo decorativo */}
            <div className="h-32 bg-gradient-to-br from-carrera-blue to-blue-900 w-full absolute top-0 left-0"></div>
            
            <div className="p-6 pt-20 relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-white shadow-lg p-1.5 mb-4 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full rounded-full bg-blue-50 flex items-center justify-center text-3xl font-bold text-carrera-blue">
                  {initials}
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-800">{displayName}</h2>
              <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-carrera-blue/10 text-carrera-blue text-xs font-semibold">
                <Shield size={12} /> {perfil.tipo_usuario}
              </span>
            </div>

            <div className="px-6 pb-6 pt-2 space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">
                  <User size={16} />
                </div>
                <div className="flex-1 truncate">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nombres Completos</p>
                  <p className="font-medium text-gray-800 truncate">{displayName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">
                  <Mail size={16} />
                </div>
                <div className="flex-1 truncate">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Correo Institucional</p>
                  <p className="font-medium text-gray-800 truncate">{perfil.correo}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">
                  <CreditCard size={16} />
                </div>
                <div className="flex-1 truncate">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Identificación / Cédula</p>
                  <p className="font-medium text-gray-800 truncate">{perfil.identificacion}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Mis Préstamos Actuales */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 px-1">
            <MonitorPlay size={20} className="text-gray-400" />
            <h3 className="text-lg font-bold text-gray-800">Equipos en mi poder</h3>
          </div>

          {prestamos.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 border-dashed p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                <MonitorPlay size={24} />
              </div>
              <p className="text-gray-500 font-medium">No tienes equipos activos en este momento.</p>
              <p className="text-xs text-gray-400 mt-1">Los préstamos que solicites aparecerán aquí una vez aprobados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prestamos.map((p) => (
                <div key={p.id_prestamo} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 flex-shrink-0 border border-gray-100 overflow-hidden flex items-center justify-center">
                      {p.foto_url ? (
                        <img src={p.foto_url} alt={p.activo_nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <MonitorPlay size={24} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold tracking-wider mb-1.5 uppercase border border-amber-200/50">
                        {p.estado_prestamo}
                      </span>
                      <h4 className="font-bold text-gray-800 text-sm truncate">{p.activo_nombre}</h4>
                      <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">{p.activo_codigo}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-start gap-2">
                    <Clock size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-700">Observaciones de salida:</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{p.observaciones_salida || 'Ninguna.'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

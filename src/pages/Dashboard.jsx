import React from 'react';
import { FlaskConical, Package, ClipboardList, Wrench, AlertTriangle } from 'lucide-react';
import useApi from '../hooks/useApi';
import { getActivos } from '../services/activosService';

const StatCard = ({ icon: Icon, label, value, color, textColor }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 hover:shadow-md transition-shadow duration-200">
    <div className={`${color} p-3.5 rounded-xl text-white flex-shrink-0`}>
      <Icon size={22} />
    </div>
    <div>
      <p className={`text-3xl font-extrabold ${textColor ?? 'text-gray-800'}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { data, loading, error } = useApi(getActivos);
  const activos = data?.data ?? [];

  const total           = activos.length;
  const disponibles     = activos.filter(a => a.disponibilidad === 'Disponible').length;
  const prestados       = activos.filter(a => a.disponibilidad === 'Prestado').length;
  const enMantenimiento = activos.filter(a => a.disponibilidad === 'En Mantenimiento').length;
  const dañados         = activos.filter(a => a.estado_fisico  === 'Dañado').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Resumen del estado del laboratorio</p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <svg className="animate-spin h-8 w-8 text-carrera-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          <AlertTriangle size={16} className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-10">
            <StatCard icon={FlaskConical}  label="Total de Equipos"     value={total}           color="bg-carrera-blue"  />
            <StatCard icon={Package}       label="Disponibles"          value={disponibles}     color="bg-carrera-green" />
            <StatCard icon={ClipboardList} label="En Préstamo"          value={prestados}       color="bg-amber-500"     />
            <StatCard icon={Wrench}        label="En Mantenimiento"     value={enMantenimiento} color="bg-utn-grey"      />
            <StatCard icon={AlertTriangle} label="Equipos Dañados"      value={dañados}         color="bg-utn-red"       />
          </div>

          {/* Lista rápida de activos recientes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-700">Inventario reciente</h2>
            </div>
            {activos.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">No hay equipos registrados aún.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {activos.slice(0, 8).map(a => (
                  <div key={a.id_activo} className="flex items-center justify-between px-6 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{a.nombre}</p>
                      <p className="text-xs text-gray-400">{a.codigo_institucional} · {a.tipo}</p>
                    </div>
                    <DisponibilidadBadge value={a.disponibilidad} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export const DisponibilidadBadge = ({ value }) => {
  const map = {
    'Disponible':      'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Prestado':        'bg-amber-50 text-amber-700 border-amber-200',
    'En Mantenimiento':'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${map[value] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {value}
    </span>
  );
};

export default Dashboard;

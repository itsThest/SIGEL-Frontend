import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Package, ClipboardList, Clock, Wrench, AlertTriangle,
} from 'lucide-react';
import useApi from '../hooks/useApi';
import { getDashboardStats } from '../services/dashboardService';

/* ── Colores semánticos del Pie ─────────────────────────────────── */
const PIE_COLORS = {
  'Disponible':       '#059669',  // emerald-600
  'Prestado':         '#D97706',  // amber-600
  'En Mantenimiento': '#2563EB',  // blue-600
};
const PIE_FALLBACK = ['#6366F1', '#EC4899', '#14B8A6', '#F59E0B'];

/* ── Color de barras por posición ───────────────────────────────── */
const BAR_COLOR = '#003366';

/* ── Skeleton del Dashboard ─────────────────────────────────────── */
const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-6">
    {/* Tarjetas */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4 shadow-sm">
          <div className="w-14 h-14 rounded-xl bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-7 w-16 bg-gray-200 rounded-md" />
            <div className="h-3 w-28 bg-gray-200 rounded-md" />
          </div>
        </div>
      ))}
    </div>
    {/* Gráficos */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-80">
        <div className="h-4 w-40 bg-gray-200 rounded-md mb-6" />
        <div className="h-56 bg-gray-100 rounded-xl" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-80">
        <div className="h-4 w-40 bg-gray-200 rounded-md mb-6" />
        <div className="h-56 bg-gray-100 rounded-xl" />
      </div>
    </div>
  </div>
);

/* ── Tarjeta de KPI ─────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, bg, iconColor, trend }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 hover:shadow-md transition-all duration-200 group">
    <div className={`${bg} p-3.5 rounded-xl flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}>
      <Icon size={22} className={iconColor} />
    </div>
    <div>
      <p className="text-3xl font-extrabold text-gray-900 tabular-nums">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5 font-medium leading-snug">{label}</p>
    </div>
  </div>
);

/* ── Tooltip personalizado para el BarChart ─────────────────────── */
const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-2.5 text-sm">
      <p className="font-semibold text-gray-700 mb-0.5">{label}</p>
      <p className="text-carrera-blue font-bold">{payload[0].value} equipo{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  );
};

/* ── Tooltip personalizado para el PieChart ─────────────────────── */
const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-2.5 text-sm">
      <p className="font-semibold text-gray-700 mb-0.5">{name}</p>
      <p className="font-bold" style={{ color: payload[0].payload.fill }}>{value} equipo{value !== 1 ? 's' : ''}</p>
    </div>
  );
};

/* ── Leyenda personalizada del Pie ──────────────────────────────── */
const CustomLegend = ({ payload }) => (
  <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 mt-3">
    {payload.map((entry) => (
      <div key={entry.value} className="flex items-center gap-1.5 text-xs text-gray-600">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
        {entry.value}
      </div>
    ))}
  </div>
);

/* ── Dashboard principal ────────────────────────────────────────── */
const Dashboard = () => {
  const { data, loading, error } = useApi(getDashboardStats);
  const stats = data?.data;

  const totales             = stats?.totales             ?? {};
  const activosPorCategoria = stats?.activosPorCategoria ?? [];
  const estadoActivos       = stats?.estadoActivos       ?? [];

  /* Asignar color a cada estado del Pie */
  const pieData = estadoActivos.map((item, i) => ({
    ...item,
    fill: PIE_COLORS[item.name] ?? PIE_FALLBACK[i % PIE_FALLBACK.length],
  }));

  return (
    <div className="animate-in fade-in duration-500">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Centro de mando — Laboratorio de Telecomunicaciones</p>
      </div>

      {/* ── Skeleton ────────────────────────────────────────────────── */}
      {loading && <DashboardSkeleton />}

      {/* ── Error ───────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Contenido principal ─────────────────────────────────────── */}
      {!loading && !error && (
        <>
          {/* ── Tarjetas KPI ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Package}
              label="Equipos Totales"
              value={totales.activos ?? 0}
              bg="bg-blue-50"
              iconColor="text-carrera-blue"
            />
            <StatCard
              icon={ClipboardList}
              label="Préstamos Activos"
              value={totales.prestamosActivos ?? 0}
              bg="bg-amber-50"
              iconColor="text-amber-600"
            />
            <StatCard
              icon={Clock}
              label="Solicitudes Pendientes"
              value={totales.solicitudesPendientes ?? 0}
              bg="bg-purple-50"
              iconColor="text-purple-600"
            />
            <StatCard
              icon={Wrench}
              label="Mantenimientos en Curso"
              value={totales.mantenimientosEnCurso ?? 0}
              bg="bg-emerald-50"
              iconColor="text-emerald-600"
            />
          </div>

          {/* ── Gráficos ────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Columna izquierda — BarChart (ocupa 3/5) */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="mb-5">
                <h2 className="text-sm font-bold text-gray-700">Activos por Categoría</h2>
                <p className="text-xs text-gray-400 mt-0.5">Distribución del inventario por tipo de equipo</p>
              </div>

              {activosPorCategoria.length === 0 ? (
                <div className="h-60 flex items-center justify-center text-gray-400 text-sm">
                  Sin datos suficientes
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={activosPorCategoria}
                    margin={{ top: 5, right: 10, left: -20, bottom: 60 }}
                    barSize={28}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#f8fafc', radius: 6 }} />
                    <Bar
                      dataKey="value"
                      fill={BAR_COLOR}
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Columna derecha — PieChart (ocupa 2/5) */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="mb-5">
                <h2 className="text-sm font-bold text-gray-700">Estado del Inventario</h2>
                <p className="text-xs text-gray-400 mt-0.5">Disponibilidad actual de los equipos</p>
              </div>

              {pieData.length === 0 ? (
                <div className="h-60 flex items-center justify-center text-gray-400 text-sm">
                  Sin datos suficientes
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={62}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend content={<CustomLegend />} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Resumen textual */}
                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                    {pieData.map((item) => {
                      const total = pieData.reduce((s, d) => s + d.value, 0);
                      const pct   = total ? Math.round((item.value / total) * 100) : 0;
                      return (
                        <div key={item.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                            <span className="text-gray-600">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: item.fill }} />
                            </div>
                            <span className="font-semibold text-gray-700 w-8 text-right">{item.value}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

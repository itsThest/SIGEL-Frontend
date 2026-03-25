import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FlaskConical,
  ClipboardList,
  LogOut,
  ChevronRight,
  X,
} from 'lucide-react';
import { isAdmin } from '../utils/auth';

const ALL_NAV_ITEMS = [
  { to: '/dashboard',      label: 'Dashboard',      icon: LayoutDashboard, adminOnly: false },
  { to: '/activos',        label: 'Activos',         icon: Package,         adminOnly: false },
  { to: '/prestamos',      label: 'Préstamos',       icon: ClipboardList,   adminOnly: false },
  { to: '/mantenimientos', label: 'Mantenimientos',  icon: FlaskConical,    adminOnly: true  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const admin = isAdmin();
  const navItems = ALL_NAV_ITEMS.filter(item => !item.adminOnly || admin);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      {/* Backdrop para móviles */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={onClose} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 min-h-screen bg-[#1a1f2e] text-white shrink-0 shadow-2xl transition-transform duration-300 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-carrera-green/20 p-2 rounded-lg">
              <FlaskConical size={22} className="text-carrera-green" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">SIGEL</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Telecom UTN</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          Principal
        </p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group
               ${isActive
                 ? 'bg-carrera-green/15 text-carrera-green font-semibold'
                 : 'text-gray-400 hover:bg-white/7 hover:text-white'
               }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={`flex-shrink-0 transition-colors ${isActive ? 'text-carrera-green' : 'text-gray-500 group-hover:text-gray-300'}`}
                />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="text-carrera-green/60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Cerrar sesión */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-utn-red/15 hover:text-utn-red transition-all duration-200 group"
        >
          <LogOut size={18} className="flex-shrink-0 group-hover:text-utn-red transition-colors" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;

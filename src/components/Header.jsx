import React from 'react';
import { Bell, Menu } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;
  const displayName = user?.nombre || user?.name || user?.email || 'Usuario';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-gray-100 shadow-sm shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger Mobile */}
        <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
          <Menu size={20} />
        </button>

        {/* Título institucional */}
        <div className="hidden sm:block">
          <p className="text-sm font-bold text-carrera-blue leading-tight">
            Laboratorio de Telecomunicaciones
          </p>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest">UTN — Facultad Regional</p>
        </div>
      </div>

      {/* Derecha — Notificaciones + Avatar */}
      <div className="flex items-center gap-3 ml-auto">
        <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-utn-red" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{displayName}</p>
            <p className="text-[11px] text-gray-400 capitalize">{user?.rol || 'Administrador'}</p>
          </div>
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-carrera-blue text-white text-sm font-bold shadow-sm select-none">
            {initials || '?'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

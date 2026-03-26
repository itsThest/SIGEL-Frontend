import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;
  const displayName = user?.nombre || user?.nombres || user?.email || 'Usuario';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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

        <div className="relative flex items-center gap-2.5 pl-3 border-l border-gray-100" ref={dropdownRef}>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{displayName}</p>
            <p className="text-[11px] text-gray-400 capitalize">{user?.rol || 'Administrador'}</p>
          </div>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-carrera-blue hover:bg-blue-900 transition-colors cursor-pointer text-white text-sm font-bold shadow-sm select-none"
          >
            {initials || '?'}
          </button>

          {/* Menú Dropdown Animado */}
          {dropdownOpen && (
            <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 transform origin-top-right transition-all duration-200 animate-in fade-in zoom-in-95">
              <div className="px-4 py-3 border-b border-gray-50 sm:hidden">
                <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.rol}</p>
              </div>
              <button
                onClick={() => { setDropdownOpen(false); navigate('/perfil'); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-carrera-blue transition-colors"
              >
                <User size={16} />
                Mi Perfil
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-utn-red hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

/**
 * auth.js — Utilidades de autenticación y roles.
 * Lee el objeto `user` guardado en localStorage al hacer login.
 */

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

/** Devuelve true si el usuario logueado tiene rol 'Administrador' */
export const isAdmin = () => getUser()?.rol === 'Administrador';

/** Devuelve true si el usuario logueado tiene rol 'Tecnico' */
export const isTecnico = () => getUser()?.rol === 'Tecnico';

/** Devuelve true si el usuario es Admin o Técnico */
export const isStaff = () => isAdmin() || isTecnico();

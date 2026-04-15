/**
 * auth.js — Utilidades de autenticación y roles.
 * Lee el objeto `user` guardado en localStorage al hacer login.
 *
 * Roles: 1 = Administrador | 2 = Técnico | 3 = Estudiante
 * Mantiene fallback por nombre de rol para sesiones existentes.
 */

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

/** Devuelve el id_rol numérico del usuario (1 / 2 / 3) */
export const getRolId = () => getUser()?.id_rol ?? null;

/** true si el usuario es Administrador (id_rol === 1) */
export const isAdmin = () => {
  const u = getUser();
  if (!u) return false;
  if (u.id_rol !== undefined) return u.id_rol === 1;
  return u.rol === 'Administrador' || u.tipo_usuario === 'Administrador'; // fallback
};

/** true si el usuario es Técnico (id_rol === 2) */
export const isTecnico = () => {
  const u = getUser();
  if (!u) return false;
  if (u.id_rol !== undefined) return u.id_rol === 2;
  return u.rol === 'Tecnico' || u.tipo_usuario === 'Tecnico';
};

/** true si es Administrador o Técnico */
export const isStaff = () => isAdmin() || isTecnico();

/** true si es solo Estudiante (id_rol === 3) */
export const isEstudiante = () => {
  const u = getUser();
  if (!u) return false;
  if (u.id_rol !== undefined) return u.id_rol === 3;
  return u.rol === 'Estudiante' || u.tipo_usuario === 'Estudiante';
};

/**
 * Devuelve el nivel_acceso numérico del usuario (1-5).
 * El backend lo incluye en el JWT desde authController.js.
 * Fallback a 1 si no está presente (sesiones antiguas).
 */
export const getNivelAcceso = () => getUser()?.nivel_acceso ?? 1;

import api from '../api/axiosConfig';

export const getPerfil        = ()         => api.get('/usuarios/perfil');

/** Lista simplificada para selectores (Préstamos, etc.) */
export const getListaUsuarios = ()         => api.get('/usuarios/lista');

/** Lista completa para el panel de Administración */
export const getUsuariosAdmin = ()         => api.get('/usuarios/admin');

/** Actualiza rol, semestre, activo y/o semestre_congelado de un usuario */
export const gestionarUsuario = (id, body) => api.put(`/usuarios/${id}/gestion`, body);

/** Cierre de ciclo académico — avanza semestres y gradúa al 8vo */
export const avanzarSemestres = ()         => api.put('/usuarios/avanzar-semestres');


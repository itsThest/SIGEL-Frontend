import api from '../api/axiosConfig';

export const getPerfil        = ()     => api.get('/usuarios/perfil');

/** Lista simplificada de usuarios para el selector del Admin en Préstamos */
export const getListaUsuarios = ()     => api.get('/usuarios/lista');

/** Cierre de ciclo académico — avanza semestres y gradúa al 8vo */
export const avanzarSemestres = ()     => api.put('/usuarios/avanzar-semestres');

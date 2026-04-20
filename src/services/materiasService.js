import api from '../api/axiosConfig';

/** GET /api/materias — Lista todas las materias para los selectores */
export const getMaterias = () => api.get('/materias');

export const crearMateria  = (body) => api.post('/materias', body);
export const editarMateria = (id, body) => api.put(`/materias/${id}`, body);


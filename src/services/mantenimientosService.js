import api from '../api/axiosConfig';

export const getMantenimientos = () => api.get('/mantenimientos');
export const registrarIngreso = (body) => api.post('/mantenimientos', body);
export const registrarSalida = (id, body) => api.put(`/mantenimientos/${id}/salida`, body);

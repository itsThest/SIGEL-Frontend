import api from '../api/axiosConfig';

/**
 * Obtiene mantenimientos con filtros opcionales de fecha:
 *   - fechaInicio (YYYY-MM-DD)
 *   - fechaFin    (YYYY-MM-DD)
 */
export const getMantenimientos = (params = {}) =>
  api.get('/mantenimientos', { params });

export const registrarIngreso = (body) => api.post('/mantenimientos', body);
export const registrarSalida  = (id, body) => api.put(`/mantenimientos/${id}/salida`, body);


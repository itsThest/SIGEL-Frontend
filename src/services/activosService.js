import api from '../api/axiosConfig';

/**
 * Obtiene activos. Si se pasa id_laboratorio, filtra por ese laboratorio.
 * @param {number|string|null} id_laboratorio
 */
export const getActivos = (id_laboratorio = null) => {
  const params = id_laboratorio ? { id_laboratorio } : {};
  return api.get('/activos', { params });
};

export const crearActivo = (formData) =>
  api.post('/activos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

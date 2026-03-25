import api from '../api/axiosConfig';

export const getActivos = () => api.get('/activos');
export const crearActivo = (formData) =>
  api.post('/activos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

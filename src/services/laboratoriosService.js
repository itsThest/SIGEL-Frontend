import api from '../api/axiosConfig';

/** GET /api/laboratorios — lista de laboratorios disponibles */
export const getLaboratorios = () => api.get('/laboratorios');

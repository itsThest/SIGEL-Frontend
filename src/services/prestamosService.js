import api from '../api/axiosConfig';

export const getPrestamos     = ()         => api.get('/prestamos');
export const crearPrestamo    = (body)     => api.post('/prestamos', body);
export const aprobarPrestamo  = (id, body) => api.put(`/prestamos/${id}/aprobar`, body);
export const rechazarPrestamo = (id)       => api.put(`/prestamos/${id}/rechazar`);
export const devolverPrestamo = (id, body) => api.put(`/prestamos/${id}/devolucion`, body);


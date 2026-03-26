import api from '../api/axiosConfig';

export const getPerfil = () => api.get('/usuarios/perfil');

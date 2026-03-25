import api from '../api/axiosConfig';

export const login = async (correo, password) => {
  const response = await api.post('/auth/login', { correo, password });
  return response.data;
};

export const register = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};


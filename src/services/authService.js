import api from '../api/axiosConfig';

export const login = async (correo, password) => {
  const response = await api.post('/auth/login', { correo, password });
  return response.data;
};

export const register = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const forgotPassword = async (correo) => {
  const response = await api.post('/auth/forgot-password', { correo });
  return response.data;
};

export const resetPassword = async (token, nuevaPassword) => {
  const response = await api.post('/auth/reset-password', { token, nuevaPassword });
  return response.data;
};

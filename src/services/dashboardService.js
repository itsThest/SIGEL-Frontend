import api from '../api/axiosConfig';

// Returns raw Axios response so useApi hook can access .data correctly
export const getDashboardStats = () => api.get('/dashboard/stats');

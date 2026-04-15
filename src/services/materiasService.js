// ── Archivo: src/services/materiasService.js ────────────────────────────────
import api from '../api/axiosConfig';

/** GET /api/materias — Lista todas las materias para los selectores */
export const getMaterias = () => api.get('/materias');

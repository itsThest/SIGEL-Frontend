import api from '../api/axiosConfig';

/**
 * Obtiene activos. Acepta un objeto de parámetros opcionales:
 *   - id_laboratorio : filtra por laboratorio
 *   - fechaInicio    : fecha mínima de creación (YYYY-MM-DD)
 *   - fechaFin       : fecha máxima de creación (YYYY-MM-DD)
 *
 * Para retrocompatibilidad, si se pasa un número/string también funciona
 * como id_laboratorio (comportamiento heredado).
 */
export const getActivos = (params = null) => {
  // Retrocompatibilidad: si llega un número o string, es id_laboratorio
  const queryParams =
    params === null || params === undefined
      ? {}
      : typeof params === 'object'
        ? params
        : { id_laboratorio: params };

  return api.get('/activos', { params: queryParams });
};

export const crearActivo = (formData) =>
  api.post('/activos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });


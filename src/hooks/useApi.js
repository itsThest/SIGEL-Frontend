import { useState, useEffect, useCallback } from 'react';

/**
 * useApi — hook genérico para llamadas al backend.
 * @param {Function} serviceFn — función que retorna una promesa axios
 * @param {boolean} autoFetch — ejecutar automáticamente al montar (default: true)
 */
const useApi = (serviceFn, autoFetch = true) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await serviceFn(...args);
      setData(res.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Error inesperado';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [serviceFn]);

  useEffect(() => {
    if (autoFetch) fetch();
  }, [autoFetch, fetch]);

  return { data, loading, error, refetch: fetch };
};

export default useApi;

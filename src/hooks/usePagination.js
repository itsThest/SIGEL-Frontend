import { useState, useMemo } from 'react';

/**
 * usePagination — paginación genérica para arrays.
 * @param {Array}  items    — array completo de datos
 * @param {number} pageSize — elementos por página (default 10)
 */
const usePagination = (items, pageSize = 10) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Si el array cambia y la página actual deja de ser válida, resetear
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  const goNext  = () => setPage(p => Math.min(p + 1, totalPages));
  const goPrev  = () => setPage(p => Math.max(p - 1, 1));
  const goPage  = (n) => setPage(Math.max(1, Math.min(n, totalPages)));
  const reset   = () => setPage(1);

  return { page: safePage, totalPages, paginated, goNext, goPrev, goPage, reset };
};

export default usePagination;

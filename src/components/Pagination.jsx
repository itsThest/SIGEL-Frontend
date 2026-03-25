import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination — controles de navegación de página.
 * Props: page, totalPages, total, pageSize, goNext, goPrev, goPage
 */
const Pagination = ({ page, totalPages, total, pageSize, goNext, goPrev }) => {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/60">
      <p className="text-xs text-gray-500">
        Mostrando <span className="font-semibold text-gray-700">{from}–{to}</span> de{' '}
        <span className="font-semibold text-gray-700">{total}</span> registros
      </p>

      <div className="flex items-center gap-1.5">
        <button
          onClick={goPrev}
          disabled={page === 1}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-white hover:border-carrera-blue hover:text-carrera-blue disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={14} /> Anterior
        </button>

        {/* Páginas numéricas (máx 5 visibles) */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(n => {
            if (totalPages <= 5) return true;
            if (n === 1 || n === totalPages) return true;
            return Math.abs(n - page) <= 1;
          })
          .reduce((acc, n, idx, arr) => {
            if (idx > 0 && n - arr[idx - 1] > 1) acc.push('...');
            acc.push(n);
            return acc;
          }, [])
          .map((item, idx) =>
            item === '...'
              ? <span key={`e${idx}`} className="px-1 text-gray-400 text-xs">…</span>
              : (
                <button
                  key={item}
                  onClick={() => {}}
                  className={`w-8 h-8 text-xs font-semibold rounded-lg border transition-all
                    ${item === page
                      ? 'bg-carrera-blue text-white border-carrera-blue shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:bg-white hover:border-carrera-blue hover:text-carrera-blue'
                    }`}
                >
                  {item}
                </button>
              )
          )
        }

        <button
          onClick={goNext}
          disabled={page === totalPages}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-white hover:border-carrera-blue hover:text-carrera-blue disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Siguiente <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

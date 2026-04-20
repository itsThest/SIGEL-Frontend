// ── Archivo: src/utils/pdfService.js ─────────────────────────────────────────
// Servicio centralizado de generación de PDFs con formato institucional UTN.
// Usa jspdf + jspdf-autotable (ya instalados en el proyecto).
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Paleta institucional ──────────────────────────────────────────────────────
const AZUL_MARINO  = [0,   51, 102];   // #003366 — encabezado de tabla
const AZUL_CLARO   = [235, 242, 255];  // filas alternadas
const GRIS_TEXTO   = [50,  50,  50];
const GRIS_SUAVE   = [160, 160, 160];
const BLANCO       = [255, 255, 255];

/**
 * Genera y descarga un PDF con formato institucional UTN.
 *
 * @param {string}      tituloReporte  - Título del reporte (ej. 'REPORTE DE ACTIVOS')
 * @param {string[]}    columnas       - Nombres de las columnas para la tabla
 * @param {Array[]}     datos          - Filas: cada elemento es un array de valores planos
 * @param {{ inicio: string, fin: string } | null} rangoFechas
 *   - Si existe, imprime "Periodo: X al Y". Si es null, imprime la fecha actual.
 * @param {string}      [nombreArchivo] - Nombre del archivo sin extensión
 */
export const generarReportePDF = (
  tituloReporte,
  columnas,
  datos,
  rangoFechas = null,
  nombreArchivo = 'Reporte_UTN'
) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const PW  = doc.internal.pageSize.getWidth();   // 297 mm
  const PH  = doc.internal.pageSize.getHeight();  // 210 mm

  // ── 1. Banda superior de color ────────────────────────────────────────────
  doc.setFillColor(...AZUL_MARINO);
  doc.rect(0, 0, PW, 28, 'F');

  // ── 2. Encabezado institucional ──────────────────────────────────────────
  doc.setTextColor(...BLANCO);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('UNIVERSIDAD TÉCNICA DEL NORTE', PW / 2, 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('FICA — Carrera de Telecomunicaciones', PW / 2, 17, { align: 'center' });
  doc.text('Laboratorio de Telecomunicaciones', PW / 2, 22, { align: 'center' });

  // ── 3. Título del reporte ─────────────────────────────────────────────────
  doc.setTextColor(...GRIS_TEXTO);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(tituloReporte.toUpperCase(), PW / 2, 36, { align: 'center' });

  // ── 4. Periodo / Fecha de emisión ────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...GRIS_SUAVE);

  const lineaPeriodo = rangoFechas
    ? `Periodo: ${rangoFechas.inicio} al ${rangoFechas.fin}`
    : `Fecha de emisión: ${new Date().toLocaleDateString('es-EC', {
        day: '2-digit', month: 'long', year: 'numeric',
      })}`;

  doc.text(lineaPeriodo, PW / 2, 42, { align: 'center' });

  // Línea separadora bajo el encabezado
  doc.setDrawColor(...AZUL_MARINO);
  doc.setLineWidth(0.4);
  doc.line(14, 45, PW - 14, 45);

  // ── 5. Tabla de datos ─────────────────────────────────────────────────────
  autoTable(doc, {
    startY: 48,
    head: [columnas],
    body: datos,
    theme: 'grid',
    styles: {
      fontSize: 8,
      textColor: GRIS_TEXTO,
      cellPadding: { top: 2.5, right: 3, bottom: 2.5, left: 3 },
      overflow: 'linebreak',
      lineColor: [210, 218, 230],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: AZUL_MARINO,
      textColor: BLANCO,
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
    },
    alternateRowStyles: {
      fillColor: AZUL_CLARO,
    },
    bodyStyles: {
      fillColor: BLANCO,
    },
    margin: { left: 14, right: 14 },
    // Repite encabezado en cada página
    showHead: 'everyPage',
    // Hook para colorear celdas de "Estado" con colores semánticos
    didParseCell(data) {
      if (data.section !== 'body') return;
      const v = String(data.cell.raw ?? '');
      const colorMap = {
        'Disponible':       [0,   130,  80],
        'Prestado':         [180, 100,   0],
        'En Mantenimiento': [0,    80, 160],
        'Finalizado':       [0,   130,  80],
        'En Proceso':       [160, 120,   0],
        'Verificación':     [120,  50, 160],
        'Activo':           [180, 100,   0],
        'Devuelto':         [0,   130,  80],
        'Pendiente':        [0,    80, 160],
        'Rechazado':        [180,   0,   0],
        'Bueno':            [0,   130,  80],
        'Regular':          [160, 120,   0],
        'Dañado':           [180,   0,   0],
      };
      if (colorMap[v]) {
        data.cell.styles.textColor = colorMap[v];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // ── 6. Pie de página (todas las páginas) ─────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    const isLastPage = i === totalPages;
    const footerY    = PH - 10;

    // Rectángulo inferior sutil
    doc.setFillColor(245, 247, 250);
    doc.rect(0, PH - 14, PW, 14, 'F');

    // Número de página — alineado a la derecha
    doc.setFontSize(7.5);
    doc.setTextColor(...GRIS_SUAVE);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${totalPages}  —  SIGEL Telecom · UTN`,
      PW - 14,
      footerY,
      { align: 'right' }
    );

    // Generado por — alineado a la izquierda
    doc.text(
      `Generado: ${new Date().toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' })}`,
      14,
      footerY
    );

    // Línea de firma — centrada solo en la última página
    if (isLastPage) {
      const firmaY = PH - 22;
      doc.setDrawColor(...AZUL_MARINO);
      doc.setLineWidth(0.3);
      const firmaX1 = PW / 2 - 35;
      const firmaX2 = PW / 2 + 35;
      doc.line(firmaX1, firmaY, firmaX2, firmaY);
      doc.setFontSize(7);
      doc.setTextColor(...GRIS_TEXTO);
      doc.text('Firma del Responsable', PW / 2, firmaY + 4, { align: 'center' });
    }
  }

  // ── 7. Descarga ───────────────────────────────────────────────────────────
  doc.save(`${nombreArchivo}.pdf`);
};

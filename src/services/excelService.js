/**
 * excelService.js
 * Utilidad reutilizable para exportar arrays de objetos a archivos .xlsx
 * Librería: xlsx (SheetJS) — ya instalada con `npm install xlsx`
 */
import * as XLSX from 'xlsx';

/**
 * Ajusta el ancho de cada columna al contenido más largo de esa columna.
 * @param {Array<Object>} rows  — filas ya aplanadas (igual que las del Excel)
 * @param {Array<string>} keys  — encabezados / nombres de columna
 */
const autoColumnWidths = (rows, keys) =>
  keys.map((key) => ({
    wch: Math.max(
      key.length,
      ...rows.map((r) => String(r[key] ?? '').length)
    ) + 2,
  }));

/**
 * Exporta un array de objetos a un archivo Excel (.xlsx) y lo descarga.
 *
 * @param {Array<Object>} data      — array de filas ya mapeadas/aplanadas
 * @param {string}        fileName  — nombre del archivo SIN extensión
 * @param {string}        sheetName — nombre de la hoja (default: 'Datos')
 */
export const exportToExcel = (data, fileName, sheetName = 'Datos') => {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const keys = Object.keys(data[0]);

  const worksheet  = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = autoColumnWidths(data, keys);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Descarga en el navegador
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/* ─────────────────────────────────────────────────────────────────
   Funciones de mapeo específicas por módulo
   Evitan que aparezca "[object Object]" en el Excel.
───────────────────────────────────────────────────────────────── */

/**
 * Activos: aplana los campos del inventario.
 */
export const mapActivosParaExcel = (activos) =>
  activos.map((a) => ({
    'Código':         a.codigo_institucional ?? '—',
    'Nombre':         a.nombre               ?? '—',
    'Marca / Serie':  a.mac_o_serial          ?? '—',
    'Tipo / Categoría': a.tipo               ?? '—',
    'Laboratorio':    a.nombre_lab ?? a.laboratorio?.nombre_lab ?? '—',
    'Estado Físico':  a.estado_fisico         ?? '—',
    'Disponibilidad': a.disponibilidad        ?? '—',
  }));

/**
 * Préstamos: aplana usuario, materia, equipo y fechas.
 */
export const mapPrestamosParaExcel = (prestamos) =>
  prestamos.map((p) => ({
    '# Préstamo':       p.id_prestamo                                    ?? '—',
    'Usuario':          p.usuario_nombres ?? `ID: ${p.id_usuario}`       ?? '—',
    'Correo':           p.usuario_correo                                  ?? '—',
    'Equipo':           p.activo_nombre  ?? `ID: ${p.id_activo}`         ?? '—',
    'Código Equipo':    p.activo_codigo                                   ?? '—',
    'Materia':          p.nombre_materia ?? p.materia?.nombre_materia     ?? '—',
    'Semestre Materia': p.semestre       ?? p.materia?.semestre           ?? '—',
    'Fecha Salida':     p.fecha_salida
                          ? new Date(p.fecha_salida).toLocaleString('es-EC') : '—',
    'Fecha Recepción':  p.fecha_recepcion
                          ? new Date(p.fecha_recepcion).toLocaleString('es-EC') : '—',
    'Observaciones Salida':    p.observaciones_salida    || '—',
    'Observaciones Recepción': p.observaciones_recepcion || '—',
    'Estado':           p.estado_prestamo ?? '—',
  }));

/**
 * Mantenimientos: aplana equipo, tipo, detalles y estado (incluye Verificación).
 */
export const mapMantenimientosParaExcel = (mantenimientos) =>
  mantenimientos.map((m) => ({
    '# Mant.':              m.id_mantenimiento                          ?? '—',
    'ID Activo':            m.id_activo                                 ?? '—',
    'Nombre Equipo':        m.activo_nombre ?? `ID: ${m.id_activo}`     ?? '—',
    'Tipo Mantenimiento':   m.tipo_mantenimiento                        ?? '—',
    'Fecha Ingreso':        m.fecha_ingreso
                              ? new Date(m.fecha_ingreso).toLocaleString('es-EC') : '—',
    'Fecha Salida':         m.fecha_salida
                              ? new Date(m.fecha_salida).toLocaleString('es-EC') : '—',
    'Detalles / Problema':  m.detalles                                  ?? '—',
    'Detalles Reparación':  m.detalles_reparacion                       ?? '—',
    'Estado':               m.estado_mantenimiento                      ?? '—',
  }));

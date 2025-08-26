// src/modules/inventario-corte/parser.js
const cheerio = require('cheerio');

const toKey = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^\w]+/g, '_')
    .replace(/^_+|_+$/g, '');

const toNumber = (txt) => {
  if (txt == null) return 0;
  const clean = String(txt).replace(/,/g, '').replace(/[^\d.-]/g, '');
  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
};

function textOf($, el) {
  // clona para quitar caret/íconos
  const t = $(el).clone();
  t.find('span, i').remove();
  return t.text().replace(/\s+/g, ' ').trim();
}

function parseSelect($, selector) {
  const out = [];
  const $sel = $(selector);
  if (!$sel.length) return out;
  $sel.find('option').each((_, opt) => {
    out.push({
      value: ($(opt).attr('value') || '').trim(),
      label: $(opt).text().trim(),
      selected: $(opt).is(':selected'),
    });
  });
  return out;
}

/**
 * Parsea la grilla #productos-almacen-h-grid:
 * - columns: encabezados limpios (sin caret)
 * - rows: filas del tbody; convierte Capacidad/Litros/Kilos/Porcentaje a número
 * - totals: del tfoot (Capacidad, Litros, Kilos)
 * - selects: combos presentes en los filtros (grupos/almacenes/productos)
 */
function parseInventarioCorte(html) {
  const $ = cheerio.load(html);
  const $grid = $('#productos-almacen-h-grid');
  const $table = $grid.find('table.items');

  if (!$grid.length || !$table.length) {
    return { columns: [], count: 0, rows: [], totals: {}, selects: {} };
  }

  // Encabezados (primera fila del THEAD)
  let headers = $table.find('thead > tr').first().find('th')
    .map((_, th) => textOf($, th))
    .get();

  // Normaliza y elimina "Opciones" si viniera
  headers = headers.map(h => h.replace(/\s+/g, ' ').trim());
  if (headers.length && /opciones/i.test(headers[headers.length - 1])) {
    headers.pop();
  }

  // Mapeo para columnas numéricas conocidas
  const numericCols = new Set(
    headers.map(h => toKey(h)).filter(k =>
      ['capacidad', 'litros', 'kilos', 'porcentaje', 'procentaje'].includes(k) // "Procentaje" viene con typo a veces
    )
  );

  // Filas del cuerpo
  const rows = [];
  $table.find('tbody > tr').each((_, tr) => {
    const tds = $(tr).find('td').map((__, td) => $(td).text().replace(/\s+/g, ' ').trim()).get();
    if (!tds.length) return;

    // recorta si trae la col de "Opciones" vacía
    const cells = tds.length > headers.length ? tds.slice(0, headers.length) : tds;

    const obj = {};
    cells.forEach((val, i) => {
      const key = toKey(headers[i]) || `col_${i}`;
      obj[key] = numericCols.has(key) ? toNumber(val) : val;
    });
    rows.push(obj);
  });

  // Totales (tfoot)
  const totals = {};
  const $tfoot = $table.find('tfoot > tr').first();
  if ($tfoot.length) {
    const tds = $tfoot.find('td').map((_, td) => $(td).text().trim()).get();
    // Busca índices por nombre de columna
    const idxCap = headers.findIndex(h => /capacidad/i.test(h));
    const idxLit = headers.findIndex(h => /litros/i.test(h));
    const idxKil = headers.findIndex(h => /kilos/i.test(h));
    if (idxCap >= 0 && tds[idxCap]) totals.capacidad = toNumber(tds[idxCap]);
    if (idxLit >= 0 && tds[idxLit]) totals.litros = toNumber(tds[idxLit]);
    if (idxKil >= 0 && tds[idxKil]) totals.kilos = toNumber(tds[idxKil]);
  }

  // Selects (de la fila de filtros)
  const selects = {
    grupos: parseSelect($, '#ProductosAlmacenH_idGrupo'),
    almacenes: parseSelect($, '#ProductosAlmacenH_idAlmacen'),
    productos: parseSelect($, '#ProductosAlmacenH_idProducto'),
  };

  return { columns: headers, count: rows.length, rows, totals, selects };
}

module.exports = { parseInventarioCorte };

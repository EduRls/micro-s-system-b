// src/modules/pruebas-tecnicas/parser.js
const cheerio = require('cheerio');

const toNumber = (txt) => {
  if (txt == null) return 0;
  const clean = String(txt).replace(/,/g, '').replace(/[^\d.-]/g, '');
  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Tabla #treeTable con 2 columnas visibles:
 *   [ "Concepto", "Cantidad" ]
 * Lee TODAS las filas del tbody (incluye totales y niveles).
 */
function parsePruebasTecnicas(html) {
  const $ = cheerio.load(html);
  const $table = $('#treeTable');
  if ($table.length === 0) return { columns: [], count: 0, rows: [] };

  const rows = [];
  $table.find('tbody > tr').each((_, tr) => {
    const $tds = $(tr).find('td');
    if ($tds.length < 2) return;

    const concepto = $tds.eq(0).text().replace(/\s+/g, ' ').trim();
    const cantidadTxt = $tds.eq(1).text().replace(/\s+/g, ' ').trim();
    rows.push({ concepto, cantidad: toNumber(cantidadTxt) });
  });

  return {
    columns: ['Concepto', 'Cantidad'],
    count: rows.length,
    rows,
  };
}

module.exports = { parsePruebasTecnicas };

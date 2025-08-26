// src/modules/auto-compara/parser.js
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

/**
 * Tabla #treeTable con headers:
 * ["", "Autoconsumo","Ventas Autoconsumo","Diferencia"]
 * El primer header vacío se mapea a "concepto".
 */
function parseAutoCompara(html) {
  const $ = cheerio.load(html);
  const $table = $('#treeTable');
  if ($table.length === 0) return { columns: [], count: 0, rows: [] };

  // Headers visibles
  let headers = $table.find('thead th').map((_, th) => $(th).text().trim()).get();
  if (!headers.length) headers = ['Concepto'];
  if (headers[0] === '') headers[0] = 'Concepto';

  // Keys normalizadas
  const normKeys = headers.map((h, i) => (i === 0 ? 'concepto' : toKey(h) || `col_${i}`));

  const rows = [];
  $table.find('tbody > tr').each((_, tr) => {
    const tds = $(tr).find('td').map((__, td) =>
      $(td).text().replace(/\s+/g, ' ').trim()
    ).get();
    if (!tds.length) return;

    // recorta si hubiese más celdas que headers
    const cells = tds.slice(0, normKeys.length);

    const obj = {};
    cells.forEach((val, i) => {
      const k = normKeys[i] || `col_${i}`;
      obj[k] = i === 0 ? val : toNumber(val);
    });
    rows.push(obj);
  });

  return { columns: headers, count: rows.length, rows };
}

module.exports = { parseAutoCompara };

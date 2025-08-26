const cheerio = require('cheerio');

const toKey = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^\w]+/g, '_')
    .replace(/^_+|_+$/g, '');

const toNumber = (txt) => {
  if (txt == null) return 0;
  // Quita separadores de miles, deja signos/decimal
  const clean = String(txt).replace(/,/g, '').replace(/[^\d.-]/g, '');
  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Tabla #treeTable (jerárquica). Extraemos las filas tal cual aparecen.
 * Header [0] suele estar vacío => "Concepto"
 */
function parseVentasRubro(html) {
  const $ = cheerio.load(html);
  const $table = $('#treeTable');
  if ($table.length === 0) return { columns: [], count: 0, rows: [] };

  // Headers
  let headers = $table.find('thead th').map((_, th) => $(th).text().trim()).get();
  if (!headers.length) headers = ['Concepto'];
  if (headers[0] === '') headers[0] = 'Concepto';

  // Normalización y desambiguación de claves (si hay repetidos)
  const seen = new Map();
  const normKeys = headers.map((h, i) => {
    const base = i === 0 ? 'concepto' : toKey(h);
    if (i === 0) return base;
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}_${count + 1}`;
  });

  // Filas
  const rows = [];
  $table.find('tbody > tr').each((_, tr) => {
    const tds = $(tr).find('td').map((__, td) => $(td).text().replace(/\s+/g, ' ').trim()).get();
    if (!tds.length) return;

    const obj = {};
    tds.forEach((val, i) => {
      const key = normKeys[i] || `col_${i}`;
      obj[key] = i === 0 ? val : toNumber(val);
    });
    rows.push(obj);
  });

  return { columns: headers, count: rows.length, rows };
}

module.exports = { parseVentasRubro };

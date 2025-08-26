// src/modules/pago-diferencia/parser.js
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
 * ["", "Real","Participada","Real","Participada","Diferencia","Cobro por Diferencia","%","Pago por Diferencia"]
 * Duplicados ("Real","Participada") se renombran: real, participada, real_2, participada_2
 * El "%" se mapea a "porcentaje".
 */
function parsePagoDiferencia(html) {
  const $ = cheerio.load(html);
  const $table = $('#treeTable');
  if ($table.length === 0) return { columns: [], count: 0, rows: [] };

  // Headers visibles
  let headers = $table.find('thead th').map((_, th) => $(th).text().trim()).get();
  if (!headers.length) headers = ['Concepto'];
  if (headers[0] === '') headers[0] = 'Concepto';

  // Normalización + deduplicados
  const seen = new Map();
  const normKeys = headers.map((h, i) => {
    if (i === 0) return 'concepto';
    let base = toKey(h);
    if (!base) base = h.trim() === '%' ? 'porcentaje' : `col_${i}`;
    const c = seen.get(base) || 0;
    seen.set(base, c + 1);
    return c === 0 ? base : `${base}_${c + 1}`;
  });

  const rows = [];
  $table.find('tbody > tr').each((_, tr) => {
    const tds = $(tr).find('td').map((__, td) =>
      $(td).text().replace(/\s+/g, ' ').trim()
    ).get();
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

module.exports = { parsePagoDiferencia };

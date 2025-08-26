// src/modules/depositos/parser.js
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
 * Tabla #treeTable
 * Headers ejemplo: ["", "Ventas","PE","VR","GT","CH","O","Total Des.","Efectivo","CH","Deposito","Ajuste","Total"]
 * Nota: hay dos "CH" -> generamos claves únicas: ch, ch_2
 */
function parseDepositos(html) {
  const $ = cheerio.load(html);
  const $table = $('#treeTable');
  if ($table.length === 0) return { columns: [], count: 0, rows: [] };

  // Headers
  let headers = $table.find('thead th').map((_, th) => $(th).text().trim()).get();
  if (!headers.length) headers = ['Concepto'];
  if (headers[0] === '') headers[0] = 'Concepto';

  // Deduplicar nombres repetidos (ej. "CH")
  const seen = new Map();
  const normKeys = headers.map((h, i) => {
    const base = i === 0 ? 'concepto' : toKey(h);
    if (i === 0) return base;
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}_${count + 1}`; // ch, ch_2, ch_3 ...
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

module.exports = { parseDepositos };

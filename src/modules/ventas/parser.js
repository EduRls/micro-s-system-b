// src/modules/ventas-detallado/parser.js
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
 * ["", "Kilos","Litros","C","Credito","D. Credito","Contado","D. Contado","Venta","Precio LLeno"]
 * El primer header vacío se mapea a "Concepto".
 */
function parseVentasDetallado(html) {
  const $ = cheerio.load(html);
  const $table = $('#treeTable');
  if ($table.length === 0) return { columns: [], count: 0, rows: [] };

  // Headers
  let headers = $table.find('thead th').map((_, th) => $(th).text().trim()).get();
  if (!headers.length) headers = ['Concepto'];
  if (headers[0] === '') headers[0] = 'Concepto';

  // keys normalizadas
  const normKeys = headers.map((h, i) => (i === 0 ? 'concepto' : toKey(h) || `col_${i}`));

  const rows = [];
  const idToIndex = new Map();

  $table.find('tbody > tr').each((_, tr) => {
    const $tr = $(tr);
    const rawId = $tr.attr('id') || '';
    const id = rawId || undefined;

    // parentId por clase "child-of-<id>"
    let parentId = null;
    const cls = $tr.attr('class') || '';
    const m = cls.match(/child-of-(\S+)/);
    if (m) parentId = m[1];

    // celdas
    const tds = $tr.find('td').map((__, td) => $(td).text().replace(/\s+/g, ' ').trim()).get();
    const cells = tds.slice(0, normKeys.length);

    const obj = {};
    cells.forEach((val, i) => {
      const k = normKeys[i] || `col_${i}`;
      obj[k] = i === 0 ? val : toNumber(val);
    });

    if (id) obj.id = id;
    if (parentId) obj.parentId = parentId;

    rows.push(obj);
    if (id) idToIndex.set(id, rows.length - 1);
  });

  // level calculado a partir de parentId
  const computeLevel = (r) => {
    let lvl = 0;
    let p = r.parentId;
    const seen = new Set();
    while (p && !seen.has(p)) {
      seen.add(p);
      lvl += 1;
      const idx = idToIndex.get(p);
      if (idx == null) break;
      p = rows[idx]?.parentId || null;
    }
    return lvl;
  };
  rows.forEach((r) => (r.level = computeLevel(r)));

  return { columns: headers, count: rows.length, rows };
}

module.exports = { parseVentasDetallado };

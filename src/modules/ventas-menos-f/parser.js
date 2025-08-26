// src/modules/ventas-menos-f/parser.js
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
 * Parser para la tabla #treeTable de Ventas -F
 * Devuelve: { columns, rows, count }
 * - Primera columna => "concepto"
 * - Incluye jerarquía: id, parentId y level (por las clases child-of-*)
 * - is_parent: true si algún renglón lo tiene como padre
 */
function parseVentasFM(html) {
  const $ = cheerio.load(html);
  const $table = $('#treeTable');
  if ($table.length === 0) return { columns: [], count: 0, rows: [] };

  // Headers visibles
  let headers = $table.find('thead th').map((_, th) => $(th).text().trim()).get();
  if (!headers.length) headers = ['Concepto'];
  if (headers[0] === '') headers[0] = 'Concepto';

  // Keys normalizadas que usaremos en cada row
  const normKeys = headers.map((h, i) => (i === 0 ? 'concepto' : toKey(h) || `col_${i}`));

  // Captura filas crudas con info de jerarquía
  const raw = [];
  $table.find('tbody > tr').each((_, tr) => {
    const $tr = $(tr);
    const id = String($tr.attr('id') || '').trim() || null;

    // child-of-node-XYZ -> parentId = "node-XYZ"
    const cls = String($tr.attr('class') || '');
    const m = cls.match(/child-of-([^\s]+)/);
    const parentId = m ? m[1] : null;

    const tds = $tr.find('td').map((__, td) => $(td).text().replace(/\s+/g, ' ').trim()).get();
    if (!tds.length) return;

    const cells = tds.slice(0, normKeys.length);
    const obj = { id, parentId };

    cells.forEach((val, i) => {
      const k = normKeys[i] || `col_${i}`;
      obj[k] = i === 0 ? val : toNumber(val);
    });

    raw.push(obj);
  });

  // Mapa para niveles e is_parent
  const byId = new Map(raw.filter(r => r.id).map(r => [r.id, r]));
  const childrenCount = new Map();

  raw.forEach(r => {
    if (r.parentId) {
      childrenCount.set(r.parentId, (childrenCount.get(r.parentId) || 0) + 1);
    }
  });

  // Calcula level por cadena de padres
  const getLevel = (row) => {
    let lvl = 0;
    let p = row.parentId && byId.get(row.parentId);
    while (p) {
      lvl += 1;
      p = p.parentId && byId.get(p.parentId);
      if (lvl > 20) break; // salvaguarda
    }
    return lvl;
  };

  const rows = raw.map(r => ({
    ...r,
    level: getLevel(r),
    is_parent: !!childrenCount.get(r.id),
  }));

  return { columns: headers, count: rows.length, rows };
}

module.exports = { parseVentasFM };

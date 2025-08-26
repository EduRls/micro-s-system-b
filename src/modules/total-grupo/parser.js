// src/modules/total-grupo/parser.js
const cheerio = require('cheerio');

const toKey = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^\w]+/g, '_')
    .replace(/^_+|_+$/g, '');

const toNumber = (txt) => {
  if (txt == null) return 0;
  // quita separadores y respeta signo
  const clean = String(txt).replace(/,/g, '').replace(/[^\d.-]/g, '');
  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Extrae la tabla #treeTable con headers y filas.
 * Devuelve:
 *  - columns: arreglo de nombres de columna de presentación (la 1ª es "Concepto")
 *  - rows: objetos con claves normalizadas: concepto + columnas numéricas
 */
function parseTotalGrupo(html) {
  const $ = cheerio.load(html);
  const $table = $('#treeTable');
  if ($table.length === 0) {
    return { columns: [], count: 0, rows: [] };
  }

  // Headers
  const headers = $table
    .find('thead th')
    .map((_, th) => $(th).text().trim())
    .get();

  // Primera header suele venir vacía (la del concepto)
  if (!headers.length || headers[0] === '') {
    headers[0] = 'Concepto';
  }

  // Mapeo de claves normalizadas
  const normKeys = headers.map((h, i) => (i === 0 ? 'concepto' : toKey(h)));

  // Filas
  const rows = [];
  $table.find('tbody > tr').each((_, tr) => {
    const tds = $(tr)
      .find('td')
      .map((__, td) => $(td).text().replace(/\s+/g, ' ').trim())
      .get();
    if (!tds.length) return;

    const obj = {};
    tds.forEach((val, i) => {
      const key = normKeys[i] || `col_${i}`;
      if (i === 0) {
        obj[key] = val; // concepto string
      } else {
        obj[key] = toNumber(val); // números
      }
    });
    rows.push(obj);
  });

  return { columns: headers, count: rows.length, rows };
}

module.exports = { parseTotalGrupo };

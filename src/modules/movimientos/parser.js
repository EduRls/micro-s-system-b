const { parseFirstTable } = require('../../lib/html');

function parseMovimientos(html) {
  const json = parseFirstTable(html);
  // Quitar fila ruidosa si aparece
  json.rows = json.rows.filter((r, i) => !(i === 0 && /Movimientos por Region/i.test(r.col_0 || '')));
  return json;
}

module.exports = { parseMovimientos };

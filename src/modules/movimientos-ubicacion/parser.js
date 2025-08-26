// src/modules/movimientos-ubicacion/parser.js
const cheerio = require('cheerio');

function toNumber(txt) {
  if (txt == null) return 0;
  const clean = String(txt).replace(/[^\d.-]/g, '').replace(/,/g, '');
  return clean ? Number(clean) : 0;
}

/**
 * Extrae SOLO la tabla #treeTable y devuelve filas con jerarquía.
 * columns: concepto, importe, nivel, parent
 */
function parseMovimientosUbicacion(html) {
  const $ = cheerio.load(html);
  const $table = $('#treeTable');
  const rows = [];
  const nodeMap = new Map(); // nodeId -> { concepto, parentKey }

  if ($table.length === 0) {
    return { columns: ['concepto', 'importe', 'nivel', 'parent'], count: 0, rows: [] };
  }

  // Primer barrido: recolecta datos crudos y vínculo padre-hijo
  $table.find('tbody > tr').each((_, tr) => {
    const $tr = $(tr);
    const tds = $tr.find('td');
    if (tds.length < 2) return;

    const concepto = $(tds[0]).text().replace(/\s+/g, ' ').trim();
    const importe = toNumber($(tds[1]).text());

    if (!concepto) return;

    const nodeKey = ($tr.attr('id') || '').trim(); // ej. "node-6V"
    const classAttr = ($tr.attr('class') || '').trim();
    const m = classAttr.match(/child-of-(node-[\w-]+)/i);
    const parentKey = m ? m[1] : null;

    const item = { nodeKey, parentKey, concepto, importe };
    rows.push(item);

    if (nodeKey) {
      nodeMap.set(nodeKey, { concepto, parentKey });
    }
  });

  // Segundo barrido: calcula nivel y parent (nombre) siguiendo la cadena de padres
  function levelFor(key) {
    let lvl = 0;
    let cur = key ? nodeMap.get(key)?.parentKey : null;
    while (cur) {
      lvl += 1;
      cur = nodeMap.get(cur)?.parentKey || null;
    }
    return lvl;
  }

  const out = rows.map(r => {
    const nivel = levelFor(r.nodeKey);
    const parent = r.parentKey ? (nodeMap.get(r.parentKey)?.concepto || null) : null;
    return { concepto: r.concepto, importe: r.importe, nivel, parent };
  });

  return { columns: ['concepto', 'importe', 'nivel', 'parent'], count: out.length, rows: out };
}

module.exports = { parseMovimientosUbicacion };

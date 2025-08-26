// src/modules/autoconsumo/parser.js
const { load } = require('cheerio');

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

// detecta niveles tipo treeTable por clases "child-of-node-XYZ"
const getLevel = ($tr) => {
  const cls = ($tr.attr('class') || '').split(/\s+/);
  let lvl = 0;
  cls.forEach((c) => {
    if (/^child-of-/.test(c)) lvl++;
  });
  return lvl;
};

function parseAutoconsumo(html) {
  if (!html || typeof html !== 'string') {
    return { columns: [], rows: [], count: 0, sum: { cantidad: 0, ventas: 0, km_recorridos: 0, km_lt_prom: 0, lt_ton_prom: 0 } };
  }

  const $ = load(html);
  const $table = $('#treeTable');
  if ($table.length === 0) {
    return { columns: [], rows: [], count: 0, sum: { cantidad: 0, ventas: 0, km_recorridos: 0, km_lt_prom: 0, lt_ton_prom: 0 } };
  }

  // Headers
  let headers = $table.find('thead th').map((_, th) => $(th).text().trim()).get();
  if (!headers.length) headers = ['Concepto'];
  if (headers[0] === '') headers[0] = 'Concepto';

  // Normaliza claves y evita duplicados (ej. "CH", "CH" -> ch, ch_2)
  const seen = new Map();
  const normKeys = headers.map((h, i) => {
    const base = i === 0 ? 'concepto' : toKey(h);
    if (i === 0) return base;
    const kCount = seen.get(base) || 0;
    seen.set(base, kCount + 1);
    return kCount === 0 ? base : `${base}_${kCount + 1}`;
  });

  const rows = [];
  $table.find('tbody > tr').each((_, tr) => {
    const $tr = $(tr);
    const tds = $tr.find('td').map((__, td) => $(td).text().replace(/\s+/g, ' ').trim()).get();
    if (!tds.length) return;

    const obj = {};
    tds.forEach((val, i) => {
      const key = normKeys[i] || `col_${i}`;
      obj[key] = i === 0 ? val : toNumber(val);
    });

    // metadatos de jerarquía para la vista
    obj.level = getLevel($tr);
    obj.is_parent = /(?:\s|^)parent(?:\s|$)/.test($tr.attr('class') || '');
    obj.id = $tr.attr('id') || undefined;

    rows.push(obj);
  });

  // Sumas rápidas (si existen esas columnas en el header)
  const idxConcepto = 0;
  const idxCantidad = normKeys.findIndex(k => /^cantidad$/.test(k));
  const idxVentas = normKeys.findIndex(k => /^ventas$/.test(k));
  const idxKmRec = normKeys.findIndex(k => /km_recorridos|km_recorrido|km_fin|km_ini/i.test(k));
  const idxKmLt = normKeys.findIndex(k => /^km_lt$|^km_lt_prom$|km_?\/?_?lt/i.test(k));
  const idxLtTon = normKeys.findIndex(k => /^lt_ton$|^lt_ton_prom$|lt_?\/?_?ton/i.test(k));

  const sum = rows.reduce(
    (acc, r) => {
      // ignora filas de día si quieres sumar solo niveles 0..2 (ubicación/grupo/unidad)
      const lvl = Number(r.level || 0);
      if (lvl > 2) return acc;

      if (idxCantidad > idxConcepto && typeof r[normKeys[idxCantidad]] === 'number') acc.cantidad += r[normKeys[idxCantidad]];
      if (idxVentas > idxConcepto && typeof r[normKeys[idxVentas]] === 'number') acc.ventas += r[normKeys[idxVentas]];
      if (idxKmRec > idxConcepto && typeof r[normKeys[idxKmRec]] === 'number') acc.km_recorridos += r[normKeys[idxKmRec]];

      // promedios: tomamos última fila válida (también podrías promediar de verdad)
      if (idxKmLt > idxConcepto && typeof r[normKeys[idxKmLt]] === 'number') acc.km_lt_prom = r[normKeys[idxKmLt]];
      if (idxLtTon > idxConcepto && typeof r[normKeys[idxLtTon]] === 'number') acc.lt_ton_prom = r[normKeys[idxLtTon]];
      return acc;
    },
    { cantidad: 0, ventas: 0, km_recorridos: 0, km_lt_prom: 0, lt_ton_prom: 0 }
  );

  return { columns: headers, rows, count: rows.length, sum };
}

module.exports = { parseAutoconsumo };

// src/modules/inventario-corte/controller.js
const { makeClient } = require('../../lib/httpClient');
const { login } = require('../../lib/auth');
const { UPPER_USER, UPPER_PASS } = require('../../config/env');
const { getInventarioCorteHTML } = require('./service');
const { parseInventarioCorte } = require('./parser');

// grupos del selector
const GRUPO_MAP = {
  '03A': 15, '04A': 16,
  15: 15, 16: 16, '15': 15, '16': 16
};

const toIdGrupo = (g) => {
  if (g == null || g === '') return 15; // default 03A
  return GRUPO_MAP[g] || 15;
};

// Convierte "YYYY-MM-DD" -> "DD/MM/YYYY". Si ya trae "/" lo respeta.
function toDDMMYYYY_slash(s) {
  if (!s) return '';
  const txt = String(s);
  if (txt.includes('/')) return txt; // ya viene bien
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(txt);
  if (!m) return txt;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

async function inventarioJSON(req, res) {
  const user = (req.body?.user || UPPER_USER || '').trim();
  const pass = (req.body?.pass || UPPER_PASS || '').trim();
  const {
    fecha, // "YYYY-MM-DD" desde front
    idGrupo, grupo, // puede venir "15" o "03A"
    idAlmacen,
    idProducto = 1,
    page = 1,
  } = req.body || {};

  if (!user || !pass) return res.status(400).json({ ok:false, error:'Falta user/pass' });

  const { client, jar } = makeClient();

  try {
    const lg = await login(client, jar, { user, pass });
    if (!lg.ok) return res.status(401).json({ ok:false, error:'Login falló' });

    const html = await getInventarioCorteHTML(client, {
      fecha: toDDMMYYYY_slash(fecha),
      idGrupo: toIdGrupo(idGrupo ?? grupo),
      idAlmacen,
      idProducto,
      page,
    });

    if (/LoginForm\[username\]|Acceso al Sistema/i.test(html))
      return res.status(401).json({ ok:false, error:'Sesión no válida tras login' });

    const data = parseInventarioCorte(html);
    res.json({ ok:true, ...data });
  } catch (e) {
    res.status(500).json({ ok:false, error: e.message || String(e) });
  }
}

async function inventarioHTML(req, res) {
  const user = (req.body?.user || UPPER_USER || '').trim();
  const pass = (req.body?.pass || UPPER_PASS || '').trim();
  const {
    fecha, idGrupo, grupo, idAlmacen, idProducto = 1, page = 1,
  } = req.body || {};

  if (!user || !pass) return res.status(400).send('Falta user/pass');

  const { client, jar } = makeClient();
  try {
    const lg = await login(client, jar, { user, pass });
    if (!lg.ok) return res.status(401).send('Login falló');

    const html = await getInventarioCorteHTML(client, {
      fecha: toDDMMYYYY_slash(fecha),
      idGrupo: toIdGrupo(idGrupo ?? grupo),
      idAlmacen,
      idProducto,
      page,
    });

    res.type('text/html').send(html);
  } catch (e) {
    res.status(500).send(e.message || String(e));
  }
}

module.exports = { inventarioJSON, inventarioHTML };
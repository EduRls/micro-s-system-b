// src/modules/ventas-f/controller.js
const { makeClient } = require('../../lib/httpClient');
const { login } = require('../../lib/auth');
const { makeFechaStr } = require('../../lib/dates');
const { UPPER_USER, UPPER_PASS } = require('../../config/env');

const { getVentasFHTML } = require('./service');
const { parseVentasF } = require('./parser');

// 03A/04A → 15/16
const GRUPO_MAP = { '03A': 15, '04A': 16, 15: 15, 16: 16, '15': 15, '16': 16 };
const toGrupoId = (g) => GRUPO_MAP[g] || Number(g) || 15;

// Producto: A,C,D,E → 2,1,4,3
const PROD_MAP = {
  A: 2, C: 1, D: 4, E: 3,
  1: 1, 2: 2, 3: 3, 4: 4,
  '1': 1, '2': 2, '3': 3, '4': 4,
};
const toProducto = (p) => PROD_MAP[String(p || '').toUpperCase()] || Number(p) || 2;

async function ventasFJSON(req, res) {
  const user = (req.body?.user || UPPER_USER || '').trim();
  const pass = (req.body?.pass || UPPER_PASS || '').trim();

  const {
    fecha, from, to,        // cualquiera; lo normalizamos con makeFechaStr
    idGrupo, grupo,         // uno solo (15/16 o "03A"/"04A")
    producto,               // 2/1/4/3 o A/C/D/E
    regionId = 1,
    ubicacionId = 6,
  } = req.body || {};

  if (!user || !pass) return res.status(400).json({ ok: false, error: 'Falta user/pass' });

  const { client, jar } = makeClient();

  try {
    const lg = await login(client, jar, { user, pass });
    if (!lg.ok) return res.status(401).json({ ok: false, error: 'Login falló' });

    const fechaStr = makeFechaStr({ fecha, from, to }); // "DD-MM-YYYY - DD-MM-YYYY"
    const html = await getVentasFHTML(client, {
      regionId,
      ubicacionId,
      idGrupo: toGrupoId(idGrupo ?? grupo),
      producto: toProducto(producto),
      fecha: fechaStr,
    });

    if (/LoginForm\[username\]|Acceso al Sistema/i.test(html))
      return res.status(401).json({ ok: false, error: 'Sesión no válida tras login' });

    const data = parseVentasF(html);
    res.json({ ok: true, ...data });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message || String(e) });
  }
}

async function ventasFHTML(req, res) {
  const user = (req.body?.user || UPPER_USER || '').trim();
  const pass = (req.body?.pass || UPPER_PASS || '').trim();

  const {
    fecha, from, to,
    idGrupo, grupo,
    producto,
    regionId = 1,
    ubicacionId = 6,
  } = req.body || {};

  if (!user || !pass) return res.status(400).send('Falta user/pass');

  const { client, jar } = makeClient();

  try {
    const lg = await login(client, jar, { user, pass });
    if (!lg.ok) return res.status(401).send('Login falló');

    const fechaStr = makeFechaStr({ fecha, from, to });
    const html = await getVentasFHTML(client, {
      regionId,
      ubicacionId,
      idGrupo: toGrupoId(idGrupo ?? grupo),
      producto: toProducto(producto),
      fecha: fechaStr,
    });

    res.type('text/html').send(html);
  } catch (e) {
    res.status(500).send(e.message || String(e));
  }
}

module.exports = { ventasFJSON, ventasFHTML };

// src/modules/ventas-menos-f/controller.js
const { makeClient } = require('../../lib/httpClient');
const { login } = require('../../lib/auth');
const { makeFechaStr } = require('../../lib/dates'); // -> "DD-MM-YYYY - DD-MM-YYYY"
const { UPPER_USER, UPPER_PASS } = require('../../config/env');

const { getVentasFMHTML } = require('./service');
const { parseVentasFM } = require('./parser');

// Mapeos conocidos
const GRUPO_MAP = { '03A': 15, '04A': 16, 15: 15, 16: 16, '15': 15, '16': 16 };
const toGrupoId = (g, fallback = 15) => {
  if (Array.isArray(g) && g.length) return GRUPO_MAP[g[0]] || Number(g[0]) || fallback;
  return GRUPO_MAP[g] || Number(g) || fallback; // por defecto 03A (15)
};

async function ventasMenosFJSON(req, res) {
  const user = (req.body?.user || UPPER_USER || '').trim();
  const pass = (req.body?.pass || UPPER_PASS || '').trim();

  const {
    fecha, from, to, // cualquiera; se normaliza con makeFechaStr
    grupo, grupoId, grupoIds,
    regionId = 1,
    ubicacionId = 6,
  } = req.body || {};

  if (!user || !pass) return res.status(400).json({ ok: false, error: 'Falta user/pass' });

  const { client, jar } = makeClient();

  try {
    const lg = await login(client, jar, { user, pass });
    if (!lg.ok) return res.status(401).json({ ok: false, error: 'Login falló' });

    const fechaStr = makeFechaStr({ fecha, from, to }); // "DD-MM-YYYY - DD-MM-YYYY"
    const gid = toGrupoId(grupoId ?? grupoIds ?? grupo, 15);

    const html = await getVentasFMHTML(client, {
      regionId,
      ubicacionId,
      grupoId: gid,
      fecha: fechaStr,
    });

    // si por alguna razón devolvió login
    if (/LoginForm\[username\]|Acceso al Sistema/i.test(html)) {
      return res.status(401).json({ ok: false, error: 'Sesión no válida tras login' });
    }

    const parsed = parseVentasFM(html);
    res.json({ ok: true, ...parsed });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message || String(e) });
  }
}

async function ventasMenosFHTML(req, res) {
  const user = (req.body?.user || UPPER_USER || '').trim();
  const pass = (req.body?.pass || UPPER_PASS || '').trim();

  const {
    fecha, from, to,
    grupo, grupoId, grupoIds,
    regionId = 1,
    ubicacionId = 6,
  } = req.body || {};

  if (!user || !pass) return res.status(400).send('Falta user/pass');

  const { client, jar } = makeClient();

  try {
    const lg = await login(client, jar, { user, pass });
    if (!lg.ok) return res.status(401).send('Login falló');

    const fechaStr = makeFechaStr({ fecha, from, to });
    const gid = toGrupoId(grupoId ?? grupoIds ?? grupo, 15);

    const html = await getVentasFMHTML(client, {
      regionId,
      ubicacionId,
      grupoId: gid,
      fecha: fechaStr,
    });

    res.type('text/html').send(html);
  } catch (e) {
    res.status(500).send(e.message || String(e));
  }
}

module.exports = { ventasMenosFJSON, ventasMenosFHTML };

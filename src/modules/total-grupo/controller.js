// src/modules/total-grupo/controller.js
const { makeClient } = require('../../lib/httpClient');
const { login } = require('../../lib/auth');
const { makeFechaStr } = require('../../lib/dates');
const { getTotalGrupoHTML } = require('./service');
const { parseTotalGrupo } = require('./parser');
const { UPPER_USER, UPPER_PASS } = require('../../config/env');

// Mapeo región visible -> id backend
const REGION_MAP = {
  A: 1,
  B: 2,
  C: 3,
  D: 5,
  E: 6,
  V: 7,
  R: 8,
  M: 9,
};

function toRegionId(regionLetter = 'A') {
  const key = String(regionLetter || 'A').toUpperCase().trim();
  return REGION_MAP[key] || REGION_MAP['A'];
}

async function totalGrupoJSON(req, res) {
  const user = (req.body?.user || UPPER_USER || '').trim();
  const pass = (req.body?.pass || UPPER_PASS || '').trim();
  const { region, fecha, from, to } = req.body || {};
  if (!user || !pass) return res.status(400).json({ ok: false, error: 'Falta user/pass' });

  const regionId = toRegionId(region);

  const { client, jar } = makeClient();
  try {
    const lg = await login(client, jar, { user, pass });
    if (!lg.ok) return res.status(401).json({ ok: false, error: 'Login falló' });

    const fechaStr = makeFechaStr({ fecha, from, to });
    const html = await getTotalGrupoHTML(client, { regionId, fecha: fechaStr });

    if (/LoginForm\[username\]|Acceso al Sistema/i.test(html)) {
      return res.status(401).json({ ok: false, error: 'Sesión no válida tras login' });
    }

    const data = parseTotalGrupo(html);
    return res.json({ ok: true, ...data });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || String(e) });
  }
}

async function totalGrupoHTML(req, res) {
  const user = (req.body?.user || UPPER_USER || '').trim();
  const pass = (req.body?.pass || UPPER_PASS || '').trim();
  const { region, fecha, from, to } = req.body || {};
  if (!user || !pass) return res.status(400).send('Falta user/pass');

  const regionId = toRegionId(region);

  const { client, jar } = makeClient();
  try {
    const lg = await login(client, jar, { user, pass });
    if (!lg.ok) return res.status(401).send('Login falló');

    const fechaStr = makeFechaStr({ fecha, from, to });
    const html = await getTotalGrupoHTML(client, { regionId, fecha: fechaStr });
    res.type('text/html').send(html);
  } catch (e) {
    res.status(500).send(e.message || String(e));
  }
}

module.exports = { totalGrupoJSON, totalGrupoHTML };

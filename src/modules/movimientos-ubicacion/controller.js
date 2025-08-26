// src/modules/movimientos-ubicacion/controller.js
const { makeClient } = require('../../lib/httpClient');
const { login } = require('../../lib/auth');
const { makeFechaStr } = require('../../lib/dates');
const { getMovimientosUbicacionHTML } = require('./service');
const { parseMovimientosUbicacion } = require('./parser');
const { UPPER_USER, UPPER_PASS } = require('../../config/env');

async function ubicacionJSON(req, res) {
  const user = (req.body?.user || UPPER_USER || '').trim();
  const pass = (req.body?.pass || UPPER_PASS || '').trim();
  const { fecha, from, to } = req.body || {};
  if (!user || !pass) return res.status(400).json({ ok: false, error: 'Falta user/pass' });

  const { client, jar } = makeClient();
  try {
    const lg = await login(client, jar, { user, pass });
    if (!lg.ok) return res.status(401).json({ ok: false, error: 'Login falló' });

    const fechaStr = makeFechaStr({ fecha, from, to });
    const html = await getMovimientosUbicacionHTML(client, { fecha: fechaStr });

    if (/LoginForm\[username\]|Acceso al Sistema/i.test(html)) {
      return res.status(401).json({ ok: false, error: 'Sesión no válida tras login' });
    }

    const data = parseMovimientosUbicacion(html);
    return res.json({ ok: true, ...data });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || String(e) });
  }
}

async function ubicacionHTML(req, res) {
  const user = (req.body?.user || UPPER_USER || '').trim();
  const pass = (req.body?.pass || UPPER_PASS || '').trim();
  const { fecha, from, to } = req.body || {};
  if (!user || !pass) return res.status(400).send('Falta user/pass');

  const { client, jar } = makeClient();
  try {
    const lg = await login(client, jar, { user, pass });
    if (!lg.ok) return res.status(401).send('Login falló');

    const fechaStr = makeFechaStr({ fecha, from, to });
    const html = await getMovimientosUbicacionHTML(client, { fecha: fechaStr });
    res.type('text/html').send(html);
  } catch (e) {
    res.status(500).send(e.message || String(e));
  }
}

module.exports = { ubicacionJSON, ubicacionHTML };

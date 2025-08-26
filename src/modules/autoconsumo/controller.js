// src/modules/autoconsumo/controller.js
const { makeClient } = require('../../lib/httpClient');
const { login } = require('../../lib/auth');
const { makeFechaStr } = require('../../lib/dates');
const { getAutoconsumoHTML } = require('./service');
const { parseAutoconsumo } = require('./parser');
const { UPPER_USER, UPPER_PASS } = require('../../config/env');

async function autoconsumoJSON(req, res) {
  const user = (req.body?.user || UPPER_USER || '').trim();
  const pass = (req.body?.pass || UPPER_PASS || '').trim();
  if (!user || !pass) return res.status(400).json({ ok: false, error: 'Falta user/pass' });

  const {
    fecha, from, to,
    idRegion = 1,
    idUbicacion = 6,
    idTipoVehiculo = 1,   // 1=V, 2=T, 3=U
    gasdiesel = 1,        // 1=Gas, 2=Diesel, 3=Gasolina
    grupoIds = [15],      // 03A por defecto
  } = req.body || {};

  const { client, jar } = makeClient();

  try {
    const lg = await login(client, jar, { user, pass });
    if (!lg.ok) return res.status(401).json({ ok: false, error: 'Login falló' });

    const fechaStr = makeFechaStr({ fecha, from, to }); // "DD-MM-YYYY - DD-MM-YYYY"
    const html = await getAutoconsumoHTML(client, {
      fecha: fechaStr,
      idRegion,
      idUbicacion,
      idTipoVehiculo,
      gasdiesel,
      grupoIds: Array.isArray(grupoIds) ? grupoIds : [15],
    });

    // Si la sesión no quedó válida por cualquier razón
    if (/LoginForm\[username\]|Acceso al Sistema/i.test(html)) {
      return res.status(401).json({ ok: false, error: 'Sesión no válida tras login' });
    }

    const data = parseAutoconsumo(html);
    return res.json({ ok: true, ...data });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || String(e) });
  }
}

async function autoconsumoHTML(req, res) {
  const user = (req.body?.user || UPPER_USER || '').trim();
  const pass = (req.body?.pass || UPPER_PASS || '').trim();
  if (!user || !pass) return res.status(400).send('Falta user/pass');

  const {
    fecha, from, to,
    idRegion = 1,
    idUbicacion = 6,
    idTipoVehiculo = 1,
    gasdiesel = 1,
    grupoIds = [15],
  } = req.body || {};

  const { client, jar } = makeClient();

  try {
    const lg = await login(client, jar, { user, pass });
    if (!lg.ok) return res.status(401).send('Login falló');

    const fechaStr = makeFechaStr({ fecha, from, to });
    const html = await getAutoconsumoHTML(client, {
      fecha: fechaStr,
      idRegion,
      idUbicacion,
      idTipoVehiculo,
      gasdiesel,
      grupoIds: Array.isArray(grupoIds) ? grupoIds : [15],
    });

    res.type('text/html').send(html);
  } catch (e) {
    res.status(500).send(e.message || String(e));
  }
}

module.exports = { autoconsumoJSON, autoconsumoHTML };

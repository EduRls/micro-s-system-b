// src/modules/pruebas-tecnicas/controller.js
const { makeClient } = require('../../lib/httpClient');
const { login } = require('../../lib/auth');
const { makeFechaStr } = require('../../lib/dates');
const { UPPER_USER, UPPER_PASS } = require('../../config/env');

const { getPruebasTecnicasHTML } = require('./service');
const { parsePruebasTecnicas } = require('./parser');

function normalizeGrupo(v) {
  if (v == null) return '03A';
  const s = String(v).trim().toUpperCase();
  return (s === '04A') ? '04A' : '03A';
}

async function pruebasTecJSON(req, res) {
  const user = (req.body?.user || UPPER_USER || '').trim();
  const pass = (req.body?.pass || UPPER_PASS || '').trim();
  if (!user || !pass) return res.status(400).json({ ok: false, error: 'Falta user/pass' });

  const { fecha, from, to, idRegion, idUbicacion, grupo, idGrupo } = req.body || {};

  const fechaStr  = makeFechaStr({ fecha, from, to }); // "DD-MM-YYYY - DD-MM-YYYY"
  const regionId  = Number.isFinite(+idRegion)   ? +idRegion   : 1;
  const ubicId    = Number.isFinite(+idUbicacion)? +idUbicacion: 6;
  const grupoStr  = normalizeGrupo(grupo);
  const grupoId   = Number.isFinite(+idGrupo) ? +idGrupo : undefined;

  const { client, jar } = makeClient();
  try {
    const lg = await login(client, jar, { user, pass });
    if (!lg.ok) return res.status(401).json({ ok: false, error: 'Login falló' });

    const html = await getPruebasTecnicasHTML(client, {
      fecha: fechaStr,
      idRegion: regionId,
      idUbicacion: ubicId,
      grupo: grupoStr,
      idGrupo: grupoId,
    });

    if (/LoginForm\[username\]|Acceso al Sistema/i.test(html)) {
      return res.status(401).json({ ok: false, error: 'Sesión no válida tras login' });
    }

    const data = parsePruebasTecnicas(html);
    res.json({ ok: true, ...data });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message || String(e) });
  }
}

async function pruebasTecHTML(req, res) {
  const user = (req.body?.user || UPPER_USER || '').trim();
  const pass = (req.body?.pass || UPPER_PASS || '').trim();
  if (!user || !pass) return res.status(400).send('Falta user/pass');

  const { fecha, from, to, idRegion, idUbicacion, grupo, idGrupo } = req.body || {};

  const fechaStr  = makeFechaStr({ fecha, from, to });
  const regionId  = Number.isFinite(+idRegion)   ? +idRegion   : 1;
  const ubicId    = Number.isFinite(+idUbicacion)? +idUbicacion: 6;
  const grupoStr  = normalizeGrupo(grupo);
  const grupoId   = Number.isFinite(+idGrupo) ? +idGrupo : undefined;

  const { client, jar } = makeClient();
  try {
    const lg = await login(client, jar, { user, pass });
    if (!lg.ok) return res.status(401).send('Login falló');

    const html = await getPruebasTecnicasHTML(client, {
      fecha: fechaStr,
      idRegion: regionId,
      idUbicacion: ubicId,
      grupo: grupoStr,
      idGrupo: grupoId,
    });

    res.type('text/html').send(html);
  } catch (e) {
    res.status(500).send(e.message || String(e));
  }
}

module.exports = { pruebasTecJSON, pruebasTecHTML };

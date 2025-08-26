// src/modules/pago-diferencia/controller.js
const { makeClient } = require('../../lib/httpClient');
const { login } = require('../../lib/auth');
const { makeFechaStr } = require('../../lib/dates');
const { getPagoDifHTML } = require('./service');
const { parsePagoDiferencia } = require('./parser');
const { UPPER_USER, UPPER_PASS } = require('../../config/env');

const REGION_MAP = { A:1, B:2, C:3, D:5, E:6, V:7, R:8, M:9 };
const toRegionId = (r='A') => REGION_MAP[String(r).toUpperCase()] || 1;

async function pagoDifJSON(req, res) {
  const user = (req.body?.user || UPPER_USER || '').trim();
  const pass = (req.body?.pass || UPPER_PASS || '').trim();
  const { region='A', fecha, from, to } = req.body || {};
  if (!user || !pass) return res.status(400).json({ ok:false, error:'Falta user/pass' });

  const { client, jar } = makeClient();
  try {
    const lg = await login(client, jar, { user, pass });
    if (!lg.ok) return res.status(401).json({ ok:false, error:'Login falló' });

    const fechaStr = makeFechaStr({ fecha, from, to });
    const html = await getPagoDifHTML(client, { regionId: toRegionId(region), fecha: fechaStr });

    if (/LoginForm\[username\]|Acceso al Sistema/i.test(html))
      return res.status(401).json({ ok:false, error:'Sesión no válida tras login' });

    const data = parsePagoDiferencia(html);
    res.json({ ok:true, ...data });
  } catch (e) {
    res.status(500).json({ ok:false, error: e.message || String(e) });
  }
}

async function pagoDifHTML(req, res) {
  const user = (req.body?.user || UPPER_USER || '').trim();
  const pass = (req.body?.pass || UPPER_PASS || '').trim();
  const { region='A', fecha, from, to } = req.body || {};
  if (!user || !pass) return res.status(400).send('Falta user/pass');

  const { client, jar } = makeClient();
  try {
    const lg = await login(client, jar, { user, pass });
    if (!lg.ok) return res.status(401).send('Login falló');

    const fechaStr = makeFechaStr({ fecha, from, to });
    const html = await getPagoDifHTML(client, { regionId: toRegionId(region), fecha: fechaStr });
    res.type('text/html').send(html);
  } catch (e) {
    res.status(500).send(e.message || String(e));
  }
}

module.exports = { pagoDifJSON, pagoDifHTML };

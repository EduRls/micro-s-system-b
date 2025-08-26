// src/modules/auto-compara/controller.js
const { makeClient } = require('../../lib/httpClient');
const { login } = require('../../lib/auth');
const { makeFechaStr } = require('../../lib/dates'); // ya convierte a "DD-MM-YYYY - DD-MM-YYYY"
const { UPPER_USER, UPPER_PASS } = require('../../config/env');

const { getAutoComparaHTML } = require('./service');
const { parseAutoCompara } = require('./parser');

const GRUPO_MAP = { '03A':15, '04A':16, 15:15, 16:16, '15':15, '16':16 };
const toGrupoIds = (g) => {
  if (Array.isArray(g)) return g.map(x => GRUPO_MAP[x] || Number(x)).filter(Boolean);
  if (g == null || g === '') return [15]; // por defecto 03A
  return [GRUPO_MAP[g] || Number(g)].filter(Boolean);
};

// 1=V,2=T,3=U
const TV_MAP = { 'V':1, 'T':2, 'U':3, 1:1, 2:2, 3:3, '1':1, '2':2, '3':3 };
const toTipoVehiculo = (v) => TV_MAP[v] || 3;

// 1=Gas,2=Diesel,3=Gasolina
const COMB_MAP = { 'GAS':1, 'DIESEL':2, 'GASOLINA':3, 1:1, 2:2, 3:3, '1':1, '2':2, '3':3 };
const toComb = (c) => {
  const key = String(c || '').toUpperCase();
  if (COMB_MAP[key]) return COMB_MAP[key];
  return Number(c) || 1;
};

async function autoComparaJSON(req, res) {
  const user = (req.body?.user || UPPER_USER || '').trim();
  const pass = (req.body?.pass || UPPER_PASS || '').trim();
  const {
    fecha, from, to,              // cualquiera; se pasa a makeFechaStr
    tipoVehiculo, combustible,
    grupos, grupo, grupoIds,
    regionId = 1, ubicacionId = 6,
  } = req.body || {};

  if (!user || !pass) return res.status(400).json({ ok:false, error:'Falta user/pass' });

  const { client, jar } = makeClient();

  try {
    const lg = await login(client, jar, { user, pass });
    if (!lg.ok) return res.status(401).json({ ok:false, error:'Login falló' });

    const fechaStr = makeFechaStr({ fecha, from, to }); // "DD-MM-YYYY - DD-MM-YYYY"
    const html = await getAutoComparaHTML(client, {
      regionId,
      ubicacionId,
      tipoVehiculo: toTipoVehiculo(tipoVehiculo),
      combustible:  toComb(combustible),
      fecha: fechaStr,
      grupoIds: toGrupoIds(grupoIds ?? grupos ?? grupo),
    });

    if (/LoginForm\[username\]|Acceso al Sistema/i.test(html))
      return res.status(401).json({ ok:false, error:'Sesión no válida tras login' });

    const data = parseAutoCompara(html);
    res.json({ ok:true, ...data });
  } catch (e) {
    res.status(500).json({ ok:false, error: e.message || String(e) });
  }
}

async function autoComparaHTML(req, res) {
  const user = (req.body?.user || UPPER_USER || '').trim();
  const pass = (req.body?.pass || UPPER_PASS || '').trim();
  const {
    fecha, from, to,
    tipoVehiculo, combustible,
    grupos, grupo, grupoIds,
    regionId = 1, ubicacionId = 6,
  } = req.body || {};

  if (!user || !pass) return res.status(400).send('Falta user/pass');

  const { client, jar } = makeClient();
  try {
    const lg = await login(client, jar, { user, pass });
    if (!lg.ok) return res.status(401).send('Login falló');

    const fechaStr = makeFechaStr({ fecha, from, to });
    const html = await getAutoComparaHTML(client, {
      regionId,
      ubicacionId,
      tipoVehiculo: toTipoVehiculo(tipoVehiculo),
      combustible:  toComb(combustible),
      fecha: fechaStr,
      grupoIds: toGrupoIds(grupoIds ?? grupos ?? grupo),
    });

    res.type('text/html').send(html);
  } catch (e) {
    res.status(500).send(e.message || String(e));
  }
}

module.exports = { autoComparaJSON, autoComparaHTML };

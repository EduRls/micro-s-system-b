const { makeClient } = require('../../lib/httpClient');
const { login } = require('../../lib/auth');
const { makeFechaStr } = require('../../lib/dates');
const { getVentasRubroHTML } = require('./service');
const { parseVentasRubro } = require('./parser');
const { UPPER_USER, UPPER_PASS } = require('../../config/env');

async function ventasRubroJSON(req, res) {
  const user = (req.body?.user || UPPER_USER || '').trim();
  const pass = (req.body?.pass || UPPER_PASS || '').trim();
  const { fecha, from, to } = req.body || {};

  // Solo 1 grupo por consulta; default 15 (03A)
  const idGrupo = Number(req.body?.idGrupo ?? req.body?.grupoId ?? 15);
  // Producto default 2 (A)
  const producto = Number(req.body?.producto ?? 2);

  if (!user || !pass) return res.status(400).json({ ok: false, error: 'Falta user/pass' });
  if (![15, 16].includes(idGrupo)) return res.status(400).json({ ok: false, error: 'idGrupo inválido (15|16)' });
  if (![1, 2, 3, 4].includes(producto)) return res.status(400).json({ ok: false, error: 'producto inválido (1..4)' });

  const { client, jar } = makeClient();
  try {
    const lg = await login(client, jar, { user, pass });
    if (!lg.ok) return res.status(401).json({ ok: false, error: 'Login falló' });

    const fechaStr = makeFechaStr({ fecha, from, to }); // "DD-MM-YYYY - DD-MM-YYYY"
    const html = await getVentasRubroHTML(client, { fecha: fechaStr, idGrupo, producto });

    if (/LoginForm\[username\]|Acceso al Sistema/i.test(html)) {
      return res.status(401).json({ ok: false, error: 'Sesión no válida tras login' });
    }

    const data = parseVentasRubro(html);
    return res.json({ ok: true, ...data });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || String(e) });
  }
}

async function ventasRubroHTML(req, res) {
  const user = (req.body?.user || UPPER_USER || '').trim();
  const pass = (req.body?.pass || UPPER_PASS || '').trim();
  const { fecha, from, to } = req.body || {};
  const idGrupo = Number(req.body?.idGrupo ?? req.body?.grupoId ?? 15);
  const producto = Number(req.body?.producto ?? 2);

  if (!user || !pass) return res.status(400).send('Falta user/pass');
  if (![15, 16].includes(idGrupo)) return res.status(400).send('idGrupo inválido (15|16)');
  if (![1, 2, 3, 4].includes(producto)) return res.status(400).send('producto inválido (1..4)');

  const { client, jar } = makeClient();
  try {
    const lg = await login(client, jar, { user, pass });
    if (!lg.ok) return res.status(401).send('Login falló');

    const fechaStr = makeFechaStr({ fecha, from, to });
    const html = await getVentasRubroHTML(client, { fecha: fechaStr, idGrupo, producto });
    res.type('text/html').send(html);
  } catch (e) {
    res.status(500).send(e.message || String(e));
  }
}

module.exports = { ventasRubroJSON, ventasRubroHTML };

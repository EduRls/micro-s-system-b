// src/modules/pago-diferencia/service.js
const { UPPER_BASE_URL } = require('../../config/env');

async function getPagoDifHTML(client, { regionId, fecha }) {
  const PATH = '/butano/reportesM/rDepositosR';
  const headers = { Referer: `${UPPER_BASE_URL}${PATH}` };

  // Pre-GET
  await client.get(PATH, { headers });

  if (!fecha) {
    const r0 = await client.get(PATH, { headers });
    return r0.data;
  }

  const form = new URLSearchParams();
  form.set('VentasH[idRegion]', String(regionId));
  form.set('VentasH[Fecha]', fecha);
  form.set('yt1', 'Consultar');

  const r = await client.post(PATH, form.toString(), {
    headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (r.status === 302) {
    const loc = r.headers.location || PATH;
    let url = loc;
    if (loc.startsWith('http')) {
      const u = new URL(loc);
      url = u.pathname + (u.search || '');
    }
    const g = await client.get(url || PATH, { headers });
    return g.data;
  }

  return r.data;
}

module.exports = { getPagoDifHTML };

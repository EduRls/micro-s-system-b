const { UPPER_BASE_URL } = require('../../config/env');

async function getMovimientosHTML(client, { fecha } = {}) {
  const headers = { Referer: `${UPPER_BASE_URL}/butano/reportesM/rMovimientosR` };
  const path = '/butano/reportesM/rMovimientosR';

  // Pre-GET para tokens/estado
  await client.get(path, { headers });

  if (!fecha) {
    const r0 = await client.get(path, { headers });
    return r0.data;
  }

  const form = new URLSearchParams();
  form.set('VentasH[Fecha]', fecha);
  form.set('yt1', 'Consultar');

  const r = await client.post(path, form.toString(), {
    headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (r.status === 302) {
    const loc = r.headers.location || path;
    let url = loc;
    if (loc.startsWith('http')) {
      const u = new URL(loc);
      url = u.pathname + (u.search || '');
    }
    const g = await client.get(url || path, { headers });
    return g.data;
  }

  return r.data;
}

module.exports = { getMovimientosHTML };

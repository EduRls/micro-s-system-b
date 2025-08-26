// src/modules/depositos/service.js
const { UPPER_BASE_URL } = require('../../config/env');

/**
 * Depósitos por ubicación (rDepositosU)
 * Payload fijo: model=VentasH, idRegion=1, idUbicacion=6, VentasH[Fecha], yt1
 */
async function getDepositosHTML(client, { fecha }) {
  const PATH = '/butano/reportesM/rDepositosU';
  const headers = { Referer: `${UPPER_BASE_URL}${PATH}` };

  // Pre-GET (siembra estado)
  await client.get(PATH, { headers });

  // Si no hay fecha, regresa vista por defecto (hoy-hoy)
  if (!fecha) {
    const r0 = await client.get(PATH, { headers });
    return r0.data;
  }

  const form = new URLSearchParams();
  form.set('model', 'VentasH');
  form.set('VentasH[idRegion]', '1');     // fijo
  form.set('VentasH[idUbicacion]', '6');  // fijo
  form.set('VentasH[Fecha]', fecha);      // "DD-MM-YYYY - DD-MM-YYYY"
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

module.exports = { getDepositosHTML };

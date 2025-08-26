// src/modules/ventas-menos-f/service.js
const { UPPER_BASE_URL } = require('../../config/env');

/**
 * Hace POST a /butano/reportes/rVentasFM (Ventas -F)
 * Params esperados por el backend legacy:
 *  - model = VentasH
 *  - VentasH[idRegion], VentasH[idUbicacion]
 *  - VentasH[idGrupo]    (single select)
 *  - VentasH[Fecha]      ("DD-MM-YYYY - DD-MM-YYYY")
 */
async function getVentasFMHTML(client, {
  regionId = 1,
  ubicacionId = 6,
  grupoId = 15,        // 03A por defecto
  fecha,               // "DD-MM-YYYY - DD-MM-YYYY"
}) {
  const PATH = '/butano/reportes/rVentasFM';
  const headers = { Referer: `${UPPER_BASE_URL}${PATH}` };

  // Pre-GET para calentar la sesión/cookies
  await client.get(PATH, { headers });

  const form = new URLSearchParams();
  form.set('model', 'VentasH');
  form.set('VentasH[idRegion]', String(regionId));
  form.set('VentasH[idUbicacion]', String(ubicacionId));
  form.set('VentasH[idGrupo]', String(grupoId));
  if (fecha) form.set('VentasH[Fecha]', fecha);
  form.set('yt1', 'Consultar');

  const r = await client.post(PATH, form.toString(), {
    headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
    maxRedirects: 0,
    validateStatus: (s) => s >= 200 && s < 400, // permitimos 302
  });

  // Si hubo redirect, seguimos una vez
  if (r.status === 302 && r.headers?.location) {
    const loc = r.headers.location;
    const url = loc.startsWith('http')
      ? new URL(loc).pathname + (new URL(loc).search || '')
      : loc;
    const g = await client.get(url, { headers });
    return g.data;
  }

  return r.data;
}

module.exports = { getVentasFMHTML };

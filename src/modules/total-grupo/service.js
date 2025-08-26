// src/modules/total-grupo/service.js
const { UPPER_BASE_URL } = require('../../config/env');

/**
 * Trae el HTML de "Total por Grupo".
 * Payload:
 *  - VentasH[Region]  (número)
 *  - VentasH[Fecha]   "DD-MM-YYYY - DD-MM-YYYY"
 *  - yt1 = Consultar
 */
async function getTotalGrupoHTML(client, { regionId, fecha } = {}) {
  const PATH = '/butano/reportesM/rTotalG';
  const headers = { Referer: `${UPPER_BASE_URL}${PATH}` };

  // Pre-GET para estado/tokens
  await client.get(PATH, { headers });

  // Si no hay fecha, el backend muestra la vista (normalmente hoy–hoy)
  if (!fecha) {
    const r0 = await client.get(PATH, { headers });
    return r0.data;
  }

  const form = new URLSearchParams();
  form.set('VentasH[Region]', String(regionId));
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

module.exports = { getTotalGrupoHTML };

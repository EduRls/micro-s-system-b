// src/modules/movimientos-ubicacion/service.js
const { UPPER_BASE_URL } = require('../../config/env');

/**
 * Trae el HTML de "Movimientos por Ubicación".
 * - Pre-GET para sembrar estado
 * - Si hay fecha, hacemos POST con el form (model/region/ubicación fijos)
 * - Follow 302 si el back redirige
 */
async function getMovimientosUbicacionHTML(client, { fecha } = {}) {
  const PATH = '/butano/reportesM/rMovimientosU';
  const headers = { Referer: `${UPPER_BASE_URL}${PATH}` };

  // Pre-GET (tokens/cookies)
  await client.get(PATH, { headers });

  // Si no llega fecha, regresa la vista por defecto (normalmente hoy-hoy)
  if (!fecha) {
    const r0 = await client.get(PATH, { headers });
    return r0.data;
  }

  const form = new URLSearchParams();
  form.set('model', 'VentasH');            // fijo
  form.set('VentasH[idRegion]', '1');      // fijo
  form.set('VentasH[idUbicacion]', '6');   // fijo
  form.set('VentasH[Fecha]', fecha);       // "DD-MM-YYYY - DD-MM-YYYY"
  form.set('yt1', 'Consultar');            // botón submit

  const r = await client.post(PATH, form.toString(), {
    headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  // Follow PRG si responde 302
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

module.exports = { getMovimientosUbicacionHTML };

// src/modules/autoconsumo/service.js
const { UPPER_BASE_URL } = require('../../config/env');

/**
 * Reporte de Autoconsumo (rAuto)
 * Payload base:
 *   model=SalidasH
 *   SalidasH[idRegion], SalidasH[idUbicacion]
 *   SalidasH[idTipoVehiculo], SalidasH[gasdiesel]
 *   SalidasH[Fecha]  -> "DD-MM-YYYY - DD-MM-YYYY"
 *   SalidasH[idGrupo][] (multi)
 *   yt1=Consultar
 */
async function getAutoconsumoHTML(
  client,
  { fecha, idRegion = 1, idUbicacion = 6, idTipoVehiculo = 1, gasdiesel = 1, grupoIds = [15] }
) {
  const PATH = '/butano/reportes/rAuto';
  const headers = { Referer: `${UPPER_BASE_URL}${PATH}` };

  // Pre-GET para sembrar estado/cookies
  await client.get(PATH, { headers });

  // Sin fecha: regresa la vista por defecto
  if (!fecha) {
    const r0 = await client.get(PATH, { headers });
    return r0.data;
  }

  const form = new URLSearchParams();
  form.set('model', 'SalidasH');
  form.set('SalidasH[idRegion]', String(idRegion));
  form.set('SalidasH[idUbicacion]', String(idUbicacion));
  form.set('SalidasH[idTipoVehiculo]', String(idTipoVehiculo));
  form.set('SalidasH[gasdiesel]', String(gasdiesel));
  form.set('SalidasH[Fecha]', fecha);

  (Array.isArray(grupoIds) ? grupoIds : [grupoIds]).forEach((g) =>
    form.append('SalidasH[idGrupo][]', String(g))
  );

  form.set('yt1', 'Consultar');

  const r = await client.post(PATH, form.toString(), {
    headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
    maxRedirects: 0,
    validateStatus: (s) => (s >= 200 && s < 400) || s === 302,
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

module.exports = { getAutoconsumoHTML };

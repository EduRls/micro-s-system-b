// src/modules/ventas-detallado/service.js
const { UPPER_BASE_URL } = require('../../config/env');

async function getVentasDetHTML(client, {
  regionId = 1,
  ubicacionId = 6,
  idGrupo,      // 15/16
  producto,     // 2=A, 1=C, 4=D, 3=E
  fecha,        // "DD-MM-YYYY - DD-MM-YYYY"
}) {
  const PATH = '/butano/reportes/rVentas';
  const headers = { Referer: `${UPPER_BASE_URL}${PATH}` };

  // pre-GET para establecer cookies
  await client.get(PATH, { headers });

  const form = new URLSearchParams();
  form.set('model', 'VentasH');
  form.set('VentasH[idRegion]', String(regionId));
  form.set('VentasH[idUbicacion]', String(ubicacionId));
  if (idGrupo)  form.set('VentasH[idGrupo]', String(idGrupo));
  if (producto) form.set('VentasH[producto]', String(producto));
  if (fecha)    form.set('VentasH[Fecha]', String(fecha));
  // botón "Consultar"
  form.set('yt1', 'Consultar');

  const r = await client.post(PATH, form.toString(), {
    headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
    maxRedirects: 0,
    validateStatus: (s) => s >= 200 && s < 400,
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

module.exports = { getVentasDetHTML };

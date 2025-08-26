// src/modules/auto-compara/service.js
const { UPPER_BASE_URL } = require('../../config/env');

async function getAutoComparaHTML(client, {
  regionId = 1,
  ubicacionId = 6,
  tipoVehiculo,   // 1=V, 2=T, 3=U
  combustible,    // 1=Gas, 2=Diesel, 3=Gasolina
  fecha,          // "DD-MM-YYYY - DD-MM-YYYY"
  grupoIds = [],  // [15] o [15,16]
}) {
  const PATH = '/butano/reportesM/rAutoCompara';
  const headers = { Referer: `${UPPER_BASE_URL}${PATH}` };

  // pre-GET para setear cookies/sesión
  await client.get(PATH, { headers });

  const form = new URLSearchParams();
  form.set('model', 'SalidasH');
  form.set('SalidasH[idRegion]', String(regionId));
  form.set('SalidasH[idUbicacion]', String(ubicacionId));
  if (tipoVehiculo) form.set('SalidasH[idTipoVehiculo]', String(tipoVehiculo));
  if (combustible)  form.set('SalidasH[gasdiesel]', String(combustible));
  if (fecha)        form.set('SalidasH[Fecha]', fecha);

  // grupos multi-select
  const gids = Array.isArray(grupoIds) ? grupoIds : [grupoIds];
  gids.filter(Boolean).forEach(g => form.append('SalidasH[idGrupo][]', String(g)));

  form.set('yt1', 'Consultar');

  const r = await client.post(PATH, form.toString(), {
    headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  // si redirige (poco común aquí), seguimos el Location
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

module.exports = { getAutoComparaHTML };

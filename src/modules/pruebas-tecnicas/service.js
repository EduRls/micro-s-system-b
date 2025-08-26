// src/modules/pruebas-tecnicas/service.js
const { UPPER_BASE_URL } = require('../../config/env');

const PATH = '/butano/reportes/rPruebas';
const HEADERS = { Referer: `${UPPER_BASE_URL}${PATH}` };

// Mapa grupo -> idGrupo backend
const MAPA_GRUPO = { '03A': 15, '04A': 16 };

/**
 * Flujo estándar: pre-GET (semilla) -> POST form -> (posible) GET por PRG (302).
 * @param {AxiosInstance} client
 * @param {{fecha:string, idRegion?:number, idUbicacion?:number, grupo?:'03A'|'04A', idGrupo?:number}} params
 * @returns {Promise<string>} HTML
 */
async function getPruebasTecnicasHTML(
  client,
  { fecha, idRegion = 1, idUbicacion = 6, grupo = '03A', idGrupo }
) {
  const grupoId = Number.isFinite(idGrupo) ? idGrupo : (MAPA_GRUPO[grupo] ?? 15);

  // 1) Pre-GET para sembrar tokens/estado
  await client.get(PATH, { headers: HEADERS });

  // Si no mandan fecha: regresa la vista por defecto
  if (!fecha) {
    const r0 = await client.get(PATH, { headers: HEADERS });
    return r0.data;
  }

  // 2) POST real con form-urlencoded
  const form = new URLSearchParams();
  form.set('model', 'PruebasTecnicasH');
  form.set('PruebasTecnicasH[idRegion]', String(idRegion));
  form.set('PruebasTecnicasH[idUbicacion]', String(idUbicacion));
  form.set('PruebasTecnicasH[idGrupo]', String(grupoId)); // 03A=15, 04A=16
  form.set('PruebasTecnicasH[Fecha]', fecha);
  form.set('yt1', 'Consultar');

  const r = await client.post(PATH, form.toString(), {
    headers: { ...HEADERS, 'Content-Type': 'application/x-www-form-urlencoded' },
    maxRedirects: 0,
    validateStatus: (s) => (s >= 200 && s < 300) || s === 302,
  });

  // 3) Si hay PRG (302), seguir la Location
  if (r.status === 302) {
    const loc = r.headers.location || PATH;
    const url = loc.startsWith('http')
      ? new URL(loc).pathname + (new URL(loc).search || '')
      : loc;
    const g = await client.get(url || PATH, { headers: HEADERS });
    return g.data;
  }

  return r.data;
}

module.exports = { getPruebasTecnicasHTML, MAPA_GRUPO };

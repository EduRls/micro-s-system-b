// src/modules/inventario-corte/service.js
const { UPPER_BASE_URL } = require('../../config/env');

const PATH = '/butano/ProductosAlmacenH/index';

async function getInventarioCorteHTML(client, { fecha, idGrupo, idAlmacen, idProducto, page = 1 }) {
  const headers = { Referer: `${UPPER_BASE_URL}${PATH}` };

  // Pre-GET para preparar sesión/cookies
  await client.get(PATH, { headers });

  // Construimos QS con nombres "anidados"
  const qs = new URLSearchParams();
  if (fecha) qs.set('ProductosAlmacenH[Fecha]', fecha);
  if (idGrupo != null && idGrupo !== '') qs.set('ProductosAlmacenH[idGrupo]', String(idGrupo));
  if (idAlmacen != null && idAlmacen !== '') qs.set('ProductosAlmacenH[idAlmacen]', String(idAlmacen));
  if (idProducto != null && idProducto !== '') qs.set('ProductosAlmacenH[idProducto]', String(idProducto));
  qs.set('ProductosAlmacenH_page', String(page || 1));
  qs.set('ajax', 'productos-almacen-h-grid');

  const url = `${PATH}?${qs.toString()}`;
  const r = await client.get(url, { headers });
  return r.data;
}

module.exports = { getInventarioCorteHTML };

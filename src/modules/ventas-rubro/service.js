const { UPPER_BASE_URL } = require('../../config/env');

/**
 * Ventas por Rubro (rVentasRubro)
 * Campos fijos: model=VentasH, idRegion=1, idUbicacion=6
 * Variables: idGrupo (15|16), producto (1..4), Fecha ("DD-MM-YYYY - DD-MM-YYYY")
 */
async function getVentasRubroHTML(client, { fecha, idGrupo, producto }) {
  const PATH = '/butano/reportes/rVentasRubro';
  const headers = { Referer: `${UPPER_BASE_URL}${PATH}` };

  // Pre-GET para sembrar estado/cookies
  await client.get(PATH, { headers });

  // Si no hay fecha, el sistema pone "hoy - hoy", pero preferimos enviarla si viene
  const form = new URLSearchParams();
  form.set('model', 'VentasH');
  form.set('VentasH[idRegion]', '1');     // fijo
  form.set('VentasH[idUbicacion]', '6');  // fijo
  form.set('VentasH[idGrupo]', String(idGrupo));   // 15 | 16
  form.set('VentasH[producto]', String(producto)); // 1..4
  if (fecha) form.set('VentasH[Fecha]', fecha);
  form.set('yt1', 'Consultar');

  const r = await client.post(PATH, form.toString(), {
    headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
    maxRedirects: 0, // seguimos manual si responde 302
    validateStatus: (s) => (s >= 200 && s < 400), // permitir 302
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

module.exports = { getVentasRubroHTML };

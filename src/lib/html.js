const cheerio = require('cheerio');

/**
 * Toma la primera tabla con thead/tbody (o la primera tabla) y regresa JSON
 */
function parseFirstTable(html) {
  const $ = cheerio.load(html);
  let $table = $('table:has(thead):has(tbody)').first();
  if ($table.length === 0) $table = $('table').first();

  const headers = $table.find('thead th').map((_, th) => $(th).text().trim()).get();
  const rows = [];

  $table.find('tbody tr').each((_, tr) => {
    const tds = $(tr).find('td').map((i, td) =>
      $(td).text().replace(/\s+/g, ' ').trim()
    ).get();
    if (!tds.length) return;

    const cols = headers.length ? headers : tds.map((_, i) => `col_${i}`);
    const obj = {};
    cols.forEach((h, i) => {
      const key = String(h).toLowerCase().replace(/[^\w]+/g, '_').replace(/^_+|_+$/g, '') || `col_${i}`;
      obj[key] = tds[i] ?? '';
    });
    rows.push(obj);
  });

  return { columns: headers, count: rows.length, rows };
}

module.exports = { parseFirstTable };

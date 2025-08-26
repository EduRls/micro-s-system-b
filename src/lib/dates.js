function makeFechaStr({ fecha, from, to }) {
  let out = (fecha || '').trim();
  if (!out && from && to) out = `${from} - ${to}`;

  if (!out) {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    out = `${dd}-${mm}-${yyyy} - ${dd}-${mm}-${yyyy}`;
  }
  return out;
}

module.exports = { makeFechaStr };

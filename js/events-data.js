// events-data.js
// Helpers i constants compartides (extretes de Events.jsx)

const ESTAT_COLORS = {
  publicat:  "var(--yellow)",
  esborrany: "var(--blue)",
  arxivat:   "var(--pink)",
};

function fmtDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d) ? raw : d.toLocaleDateString("ca-ES", { day: "numeric", month: "short", year: "numeric" });
}
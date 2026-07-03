// projectes-data.js
// Helpers i constants compartides (extretes de Projectes.jsx)

const ESTAT_COLORS = {
  actiu:      "var(--yellow)",
  finalitzat: "var(--blue)",
  pendent:    "var(--pink)",
};

function fmtDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d) ? raw : d.toLocaleDateString("ca-ES", { day: "numeric", month: "short", year: "numeric" });
}
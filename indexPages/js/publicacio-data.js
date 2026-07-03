// publicacio-data.js
// Helpers i constants compartides (extretes de PublicacioDetall.jsx)

function fmtDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d) ? raw : d.toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" });
}

function tempsRelatiu(raw) {
  if (!raw) return null;
  const diff = Date.now() - new Date(raw).getTime();
  const min = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (min < 1) return "ara mateix";
  if (min < 60) return `fa ${min} min`;
  if (h < 24) return `fa ${h}h`;
  if (d < 7) return `fa ${d} dia${d > 1 ? "s" : ""}`;
  return fmtDate(raw);
}

const ESTAT_META = {
  publicat:  { color: "var(--yellow)", label: "Publicat" },
  esborrany: { color: "var(--blue)",   label: "Esborrany" },
  arxivat:   { color: "var(--pink)",   label: "Arxivat" },
};

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || null;
}
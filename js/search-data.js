// ============================================================
// search-data.js — Dades estàtiques usades per l'overlay de cerca
// ============================================================

const pagines = [
  { nom: "Home", url: "/home", imatge: "/images/home.png", tipusLabel: "Pàgina", categoria: "General" },
  { nom: "About", url: "/qui-som", imatge: "/images/quisom.png", tipusLabel: "Pàgina", categoria: "Informació" },
  { nom: "Contact", url: "/contacte", imatge: "/images/contacte.png", tipusLabel: "Pàgina", categoria: "Contacte" },
  { nom: "Agenda", url: "/agenda", imatge: "/images/agenda.png", tipusLabel: "Agenda", categoria: "Activitat familiar" },
  { nom: "Projectes", url: "/projectes", imatge: "/images/projectes.png", tipusLabel: "Projecte", categoria: "Tradicional" },
  { nom: "Publicacions", url: "/publicacions", imatge: "/images/publicacions.png", tipusLabel: "Publicació", categoria: "Exposicions i +" },
  { nom: "Events", url: "/events", imatge: "/images/events.png", tipusLabel: "Event", categoria: "Música" },
];

const ambits = [
  "Activitat familiar",
  "Música",
  "Espectacle",
  "Tradicional",
  "Exposicions i +",
  "Festes i tradicions",
  "Cinema",
];

const ubicacions = [
  "Plaça de Santa Anna",
  "Ajuntament de Mataró",
  "M|A|C Presó",
  "Teatre Monumental",
  "Espai Firal del Nou Parc Central",
  "Passeig del Callao",
  "Llar Cabanellas",
];

const ambitClassMap = {
  "Activitat familiar": "ambit--familiar",
  "Música": "ambit--musica",
  "Espectacle": "ambit--espectacle",
  "Tradicional": "ambit--tradicional",
  "Exposicions i +": "ambit--exposicions",
  "Festes i tradicions": "ambit--festes",
  "Cinema": "ambit--cinema",
};

function getAmbitClass(ambit) {
  return ambitClassMap[ambit] || "ambit--tradicional";
}

function formatHora(item) {
  if (item.hora) return item.hora;
  if (item.data_publicacio || item.data) {
    const d = new Date(item.data_publicacio || item.data);
    if (!isNaN(d)) {
      return d.toLocaleTimeString("ca-ES", { hour: "2-digit", minute: "2-digit" });
    }
  }
  return null;
}

function formatDate(item) {
  const raw = item.data_publicacio || item.data;
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d)) return null;
  return d.toLocaleDateString("ca-ES", { day: "numeric", month: "short", year: "numeric" });
}
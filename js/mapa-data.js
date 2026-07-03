// mapa-data.js
// Configuració estàtica i funcions pures del mapa (extretes de Mapa.jsx)

const MATARO = [41.5372, 2.4451];

const CATEGORIES = {
  "festa major":        { icon: "images/cat-festa.png",      color: "#ffd25a", label: "Festa Major"  },
  "concerts":           { icon: "images/cat-music.png",      color: "#5aa6ff", label: "Concerts"     },
  "espectacle":         { icon: "images/cat-espectacle.png", color: "#ffd25a", label: "Espectacle"   },
  "tradicions":         { icon: "images/cat-tradicio.png",   color: "#ff5a2e", label: "Tradicions"   },
  "activitat familiar": { icon: "images/cat-familia.png",    color: "#ff7fc0", label: "Família"      },
  "nadal":              { icon: "images/cat-nadal.png",      color: "#ff7fc0", label: "Nadal"        },
  "cinema":              { icon: "images/cat-cinema.png",    color: "#ff7fc0", label: "Cinema"       },
  "exposicions i +":    { icon: "images/cat-expo.png",       color: "#5aa6ff", label: "Exposicions"  },
  "default":             { icon: "images/cat-default.png",   color: "#ffd25a", label: "Esdeveniment" },
};

const VIEW_MODES = [
  { id: "list",    icon: "ti-list",        label: "Llista"   },
  { id: "grid",    icon: "ti-layout-grid", label: "Graella"  },
  { id: "compact", icon: "ti-menu-2",      label: "Compacte" },
];

const SORT_OPTIONS = [
  { id: "data",     label: "Per data"  },
  { id: "titol",    label: "Per nom"   },
  { id: "destacat", label: "Destacats" },
];

const TILE_STYLES = {
  dark:   "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  blue:   "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
  street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
};

function getCat(ambit) {
  if (!ambit) return CATEGORIES["default"];
  return CATEGORIES[ambit.toLowerCase()] ?? CATEGORIES["default"];
}

function makeCatIcon(ambit, selected = false) {
  const cat  = getCat(ambit);
  const size = selected ? 52 : 42;
  return L.divIcon({
    className: "",
    html: `
      <div class="map-pin${selected ? " selected" : ""}" style="--pin-color:${cat.color}">
        <div class="map-pin-bg">
          <img src="${cat.icon}" class="map-pin-icon" alt="${cat.label}"
               onerror="this.style.display='none';this.parentElement.innerHTML='<span class=map-pin-fallback>${cat.label[0]}</span>'" />
        </div>
        <div class="map-pin-needle"></div>
        <div class="map-pin-pulse"></div>
      </div>`,
    iconSize:    [size, size + 10],
    iconAnchor:  [size / 2, size + 10],
    popupAnchor: [0, -(size + 12)],
  });
}

function normalizeEvent(e) {
  return {
    id:            e.id ?? e._id,
    titol:         e.titol ?? e.title ?? e.nom ?? "Sense títol",
    descripcio:    e.descripcio ?? e.resum ?? e.description ?? "",
    ambit:         e.ambit ?? e.categoria ?? e.category ?? "",
    ubicacio:      e.ubicacio ?? e.lloc ?? e.location ?? "",
    imatge:        e.imatge ?? e.img ?? e.galeria_imatges?.[0]?.url ?? null,
    data:          e.data ?? e.data_inici ?? e.date ?? null,
    data_fi:       e.data_fi ?? null,
    hora:          e.hora ?? null,
    lat:           parseFloat(e.lat ?? e.latitud ?? e.latitude ?? NaN),
    lng:           parseFloat(e.lng ?? e.longitud ?? e.longitude ?? NaN),
    destacat:      e.destacat ?? false,
    tags:          e.tags ?? [],
    organitzador:  e.organitzador ?? null,
  };
}

function fmtDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d) ? raw : d.toLocaleDateString("ca-ES", { day: "numeric", month: "short", year: "numeric" });
}
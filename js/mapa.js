// mapa.js
// Equivalent vanilla del component Mapa.jsx: manté un objecte d'estat global
// (com si fossin els useState de React) i re-renderitza el DOM + els markers
// de Leaflet cada vegada que l'estat canvia.

/* ===========================================================
   ESTAT GLOBAL (equivalent als useState)
=========================================================== */

const state = {
  events: [],
  loading: true,
  error: null,
  selectedId: null,
  flyCoords: null,
  search: "",
  activeAmbit: "Tots",
  viewMode: "list",
  sortBy: "data",
  showRadius: false,
  radius: 500,
  mapStyle: "dark",
  sidebarOpen: true,
  highlightDate: "",
};

let map = null;
let tileLayer = null;
let radiusCircle = null;
const markersRef = {}; // id -> L.Marker

/* ===========================================================
   INICIALITZACIÓ
=========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  buildToolbarStatic();
  wireStaticControls();
  fetchEvents();
});

function initMap() {
  map = L.map("leaflet-map", { zoomControl: false }).setView(MATARO, 14);

  tileLayer = L.tileLayer(TILE_STYLES[state.mapStyle], {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  }).addTo(map);
}

async function fetchEvents() {
  state.loading = true;
  render();

  try {
    const res = await fetch("http://localhost:5000/events");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const raw = Array.isArray(data) ? data : (data.events ?? data.publicacions ?? []);
    state.events = raw.map(normalizeEvent).filter((e) => !isNaN(e.lat) && !isNaN(e.lng));
  } catch (err) {
    state.error = err.message;
  } finally {
    state.loading = false;
    render();
  }
}

/* ===========================================================
   CONSTRUCCIÓ ESTÀTICA DE LA TOOLBAR (SORT, VIEW MODES, STYLES)
=========================================================== */

function buildToolbarStatic() {
  // Sort select
  const sortSelect = document.getElementById("mapa-sort-select-input");
  SORT_OPTIONS.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.label;
    sortSelect.appendChild(opt);
  });

  // View mode buttons
  const viewBtnsWrap = document.getElementById("mapa-view-btns");
  VIEW_MODES.forEach((v) => {
    const btn = document.createElement("button");
    btn.className = "mapa-view-btn";
    btn.dataset.view = v.id;
    btn.title = v.label;
    btn.innerHTML = `<i class="ti ${v.icon}"></i>`;
    btn.addEventListener("click", () => {
      state.viewMode = v.id;
      render();
    });
    viewBtnsWrap.appendChild(btn);
  });

  // Map style buttons
  const styleBtnsWrap = document.getElementById("mapa-style-btns");
  Object.keys(TILE_STYLES).forEach((s) => {
    const btn = document.createElement("button");
    btn.className = "mapa-style-btn";
    btn.dataset.style = s;
    btn.textContent = s;
    btn.addEventListener("click", () => {
      state.mapStyle = s;
      tileLayer.setUrl(TILE_STYLES[s]);
      render();
    });
    styleBtnsWrap.appendChild(btn);
  });
}

/* ===========================================================
   CONTROLS ESTÀTICS (BOTONS FIXOS DE LA TOOLBAR I EL MAPA)
=========================================================== */

function wireStaticControls() {
  // Sidebar toggle
  document.getElementById("mapa-sidebar-toggle").addEventListener("click", () => {
    state.sidebarOpen = !state.sidebarOpen;
    render();
  });

  // Sort select
  document.getElementById("mapa-sort-select-input").addEventListener("change", (e) => {
    state.sortBy = e.target.value;
    render();
  });

  // Date filter
  document.getElementById("mapa-date-filter").addEventListener("change", (e) => {
    state.highlightDate = e.target.value;
    render();
  });

  // Reset filters
  document.getElementById("mapa-reset-btn").addEventListener("click", resetFilters);

  // Radius toggle
  document.getElementById("mapa-radius-toggle").addEventListener("click", () => {
    state.showRadius = !state.showRadius;
    render();
  });

  // Radius range
  document.getElementById("mapa-radius-range").addEventListener("input", (e) => {
    state.radius = Number(e.target.value);
    render();
  });

  // Locate me
  document.getElementById("mapa-locate-btn").addEventListener("click", () => {
    map.locate({ setView: true, maxZoom: 16 });
  });

  // Search box
  const searchInput = document.getElementById("mapa-search-input");
  searchInput.addEventListener("input", (e) => {
    state.search = e.target.value;
    render();
  });
  document.getElementById("mapa-search-clear").addEventListener("click", () => {
    state.search = "";
    searchInput.value = "";
    render();
  });

  // Zoom controls
  document.getElementById("mapa-zoom-in").addEventListener("click", () => map.zoomIn());
  document.getElementById("mapa-zoom-out").addEventListener("click", () => map.zoomOut());
  document.getElementById("mapa-home-btn").addEventListener("click", () => {
    map.flyTo(MATARO, 14, { duration: 1 });
  });

  // Selected panel close
  document.getElementById("mapa-selected-close").addEventListener("click", () => {
    state.selectedId = null;
    render();
  });

  // "Tots" category button
  document.getElementById("mapa-cat-tots").addEventListener("click", () => {
    state.activeAmbit = "Tots";
    render();
  });
}

function resetFilters() {
  state.search = "";
  state.activeAmbit = "Tots";
  state.highlightDate = "";
  state.sortBy = "data";
  state.selectedId = null;
  document.getElementById("mapa-search-input").value = "";
  document.getElementById("mapa-date-filter").value = "";
  document.getElementById("mapa-sort-select-input").value = "data";
  map.flyTo(MATARO, 14, { duration: 1 });
  render();
}

/* ===========================================================
   SELECCIÓ D'ESDEVENIMENT
=========================================================== */

function selectEvent(ev) {
  state.selectedId = ev.id;
  state.flyCoords = [ev.lat, ev.lng];
  map.flyTo(state.flyCoords, 16, { duration: 1.2, easeLinearity: 0.25 });

  render();

  setTimeout(() => {
    const el = document.getElementById(`card-${ev.id}`);
    const sidebar = document.getElementById("mapa-sidebar");
    if (el && sidebar) {
      sidebar.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
    }
    const m = markersRef[ev.id];
    if (m) m.openPopup();
  }, 900);
}

/* ===========================================================
   DERIVED DATA
=========================================================== */

function getAmbits() {
  return ["Tots", ...new Set(state.events.map((e) => e.ambit).filter(Boolean))];
}

function getFiltered() {
  const q = state.search.toLowerCase();
  return state.events
    .filter((e) => {
      const matchSearch =
        !q ||
        e.titol.toLowerCase().includes(q) ||
        e.ubicacio.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q));
      const matchAmbit = state.activeAmbit === "Tots" || e.ambit === state.activeAmbit;
      const matchDate = !state.highlightDate || (e.data && e.data.startsWith(state.highlightDate));
      return matchSearch && matchAmbit && matchDate;
    })
    .sort((a, b) => {
      if (state.sortBy === "data") return new Date(a.data) - new Date(b.data);
      if (state.sortBy === "titol") return a.titol.localeCompare(b.titol);
      if (state.sortBy === "destacat") return (b.destacat ? 1 : 0) - (a.destacat ? 1 : 0);
      return 0;
    });
}

/* ===========================================================
   RENDER PRINCIPAL
=========================================================== */

function render() {
  const filtered = getFiltered();

  renderHero(filtered);
  renderToolbarState();
  renderCategoryFilter();
  renderCount(filtered);
  renderEventList(filtered);
  renderMarkers(filtered);
  renderRadiusCircle();
  renderSelectedPanel();
  renderBadge(filtered);
  renderLayout();
}

/* ── HERO ── */
function renderHero(filtered) {
  const subtitle = document.getElementById("mapa-subtitle");
  subtitle.textContent = state.loading
    ? "Carregant..."
    : `${state.events.length} esdeveniments a Mataró`;

  const statsWrap = document.getElementById("mapa-hero-stats");
  statsWrap.innerHTML = "";

  if (state.loading) return;

  const counts = state.events.reduce((acc, e) => {
    const key = e.ambit || "Altres";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  Object.entries(counts)
    .slice(0, 4)
    .forEach(([cat, count]) => {
      const info = getCat(cat);
      const el = document.createElement("div");
      el.className = "mapa-hero-stat";
      el.innerHTML = `
        <img src="${info.icon}" alt="${cat}" class="mapa-hero-stat-icon" onerror="this.style.display='none'" />
        <span class="mapa-hero-stat-count" style="color:${info.color}">${count}</span>
        <span class="mapa-hero-stat-label">${info.label}</span>
      `;
      statsWrap.appendChild(el);
    });
}

/* ── TOOLBAR STATE (active classes, visibility) ── */
function renderToolbarState() {
  document
    .getElementById("mapa-sidebar-toggle")
    .classList.toggle("active", state.sidebarOpen);

  document.getElementById("mapa-reset-btn").style.display =
    state.search || state.activeAmbit !== "Tots" || state.highlightDate ? "inline-flex" : "none";

  document.getElementById("mapa-search-clear").style.display = state.search ? "flex" : "none";

  document.querySelectorAll("#mapa-view-btns .mapa-view-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === state.viewMode);
  });

  document.querySelectorAll("#mapa-style-btns .mapa-style-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.style === state.mapStyle);
  });

  document
    .getElementById("mapa-radius-toggle")
    .classList.toggle("active", state.showRadius);

  const radiusControl = document.getElementById("mapa-radius-control");
  radiusControl.style.display = state.showRadius ? "flex" : "none";
  document.getElementById("mapa-radius-label").textContent = `${state.radius}m`;
  document.getElementById("mapa-radius-range").value = state.radius;
}

/* ── CATEGORY FILTER ── */
function renderCategoryFilter() {
  document
    .getElementById("mapa-cat-tots")
    .classList.toggle("active", state.activeAmbit === "Tots");

  const wrap = document.getElementById("mapa-cat-list");
  wrap.innerHTML = "";

  getAmbits()
    .filter((a) => a !== "Tots")
    .forEach((a) => {
      const cat = getCat(a);
      const isActive = state.activeAmbit === a;
      const count = state.events.filter((ev) => ev.ambit === a).length;

      const btn = document.createElement("button");
      btn.className = `mapa-cat-btn ${isActive ? "active" : ""}`;
      if (isActive) {
        btn.style.borderColor = cat.color;
        btn.style.color = cat.color;
      }
      btn.innerHTML = `
        <span class="mapa-cat-icon-wrap">
          <img src="${cat.icon}" alt="${cat.label}" class="mapa-cat-icon" onerror="this.style.display='none'" />
        </span>
        <span>${cat.label}</span>
        <span class="mapa-cat-count" style="${isActive ? `background:${cat.color};color:#0a0a0a` : ""}">${count}</span>
      `;
      btn.addEventListener("click", () => {
        state.activeAmbit = isActive ? "Tots" : a;
        render();
      });
      wrap.appendChild(btn);
    });
}

/* ── COUNT ── */
function renderCount(filtered) {
  document.getElementById("mapa-count-filtered").textContent = filtered.length;
  document.getElementById("mapa-count-total").textContent = state.events.length;
}

/* ── EVENT LIST ── */
function renderEventList(filtered) {
  const list = document.getElementById("mapa-event-list");
  list.className = `mapa-event-list view-${state.viewMode}`;
  list.innerHTML = "";

  if (state.loading) {
    list.innerHTML = `
      <div class="mapa-state">
        <div class="mapa-spinner"></div>
        <p>Carregant...</p>
      </div>`;
    return;
  }

  if (state.error) {
    list.innerHTML = `<div class="mapa-state error"><p>Error: ${state.error}</p></div>`;
    return;
  }

  if (filtered.length === 0) {
    const el = document.createElement("div");
    el.className = "mapa-state";
    el.innerHTML = `
      <i class="ti ti-map-off" style="font-size:2rem;opacity:0.3;"></i>
      <p>Cap resultat trobat.</p>
      <button class="mapa-reset-btn" style="display:inline-flex;">Netejar filtres</button>
    `;
    el.querySelector("button").addEventListener("click", resetFilters);
    list.appendChild(el);
    return;
  }

  filtered.forEach((ev) => {
    const cat = getCat(ev.ambit);
    const isSelected = state.selectedId === ev.id;

    const card = document.createElement("div");
    card.id = `card-${ev.id}`;
    card.className = `mapa-event-card ${isSelected ? "selected" : ""} ${ev.destacat ? "destacat" : ""}`;
    if (isSelected) card.style.borderLeftColor = cat.color;

    card.innerHTML = `
      ${ev.destacat ? '<span class="mapa-card-badge">Destacat</span>' : ""}
      <div class="mapa-card-cat-icon" style="background:${cat.color}22;border-color:${cat.color}55">
        <img src="${cat.icon}" alt="${cat.label}" />
      </div>
      <div class="mapa-card-body">
        ${ev.imatge && state.viewMode !== "compact" ? `
        <div class="mapa-card-img">
          <img src="${ev.imatge}" alt="${ev.titol}" />
        </div>` : ""}
        <div class="mapa-card-info">
          ${ev.ambit ? `<span class="mapa-card-ambit" style="color:${cat.color}">${ev.ambit}</span>` : ""}
          <h3 class="mapa-card-title">${ev.titol}</h3>
          ${ev.ubicacio ? `<p class="mapa-card-location"><i class="ti ti-map-pin"></i> ${ev.ubicacio}</p>` : ""}
          ${ev.data ? `
          <p class="mapa-card-date">
            <i class="ti ti-calendar"></i> ${fmtDate(ev.data)}
            ${ev.data_fi && ev.data_fi !== ev.data ? ` → ${fmtDate(ev.data_fi)}` : ""}
          </p>` : ""}
          ${ev.hora ? `<span class="mapa-card-hora" style="background:${cat.color};color:#0a0a0a">${ev.hora}</span>` : ""}
          ${ev.tags.length > 0 && state.viewMode !== "compact" ? `
          <div class="mapa-card-tags">
            ${ev.tags.slice(0, 3).map((t) => `<span class="mapa-card-tag">${t}</span>`).join("")}
          </div>` : ""}
        </div>
      </div>
    `;

    const iconImg = card.querySelector(".mapa-card-cat-icon img");
    iconImg.addEventListener("error", () => {
      iconImg.style.display = "none";
      iconImg.parentElement.innerHTML = `<span style="color:${cat.color};font-weight:700;font-size:1rem">${cat.label[0]}</span>`;
    });

    card.addEventListener("click", () => selectEvent(ev));
    list.appendChild(card);
  });
}

/* ── MARKERS ── */
function renderMarkers(filtered) {
  // Elimina els marcadors que ja no han de sortir
  Object.keys(markersRef).forEach((id) => {
    if (!filtered.find((e) => String(e.id) === String(id))) {
      map.removeLayer(markersRef[id]);
      delete markersRef[id];
    }
  });

  filtered.forEach((ev) => {
    const isSelected = state.selectedId === ev.id;
    const icon = makeCatIcon(ev.ambit, isSelected);

    if (markersRef[ev.id]) {
      markersRef[ev.id].setIcon(icon);
      markersRef[ev.id].setPopupContent(buildPopupHtml(ev));
      return;
    }

    const marker = L.marker([ev.lat, ev.lng], { icon }).addTo(map);
    marker.bindPopup(buildPopupHtml(ev), { className: "mapa-popup", maxWidth: 280 });
    marker.on("click", () => selectEvent(ev));
    markersRef[ev.id] = marker;
  });
}

function buildPopupHtml(ev) {
  const cat = getCat(ev.ambit);
  return `
    <div class="popup-inner">
      ${ev.imatge ? `<img src="${ev.imatge}" alt="${ev.titol}" class="popup-img" />` : ""}
      <div class="popup-body">
        <div class="popup-cat" style="color:${cat.color}">
          <img src="${cat.icon}" alt="${ev.ambit}" class="popup-cat-icon" onerror="this.style.display='none'" />
          ${ev.ambit}
        </div>
        <h3 class="popup-title">${ev.titol}</h3>
        ${ev.descripcio ? `<p class="popup-desc">${ev.descripcio.slice(0, 120)}…</p>` : ""}
        ${ev.ubicacio ? `<p class="popup-location"><i class="ti ti-map-pin"></i> ${ev.ubicacio}</p>` : ""}
        ${ev.data ? `
        <p class="popup-date" style="color:${cat.color}">
          <i class="ti ti-calendar"></i> ${fmtDate(ev.data)}${ev.hora ? ` · ${ev.hora}` : ""}
        </p>` : ""}
        ${ev.organitzador ? `<p class="popup-org"><i class="ti ti-building"></i> ${ev.organitzador}</p>` : ""}
        ${ev.tags.length > 0 ? `
        <div class="popup-tags">
          ${ev.tags.map((t) => `<span class="popup-tag">${t}</span>`).join("")}
        </div>` : ""}
      </div>
    </div>
  `;
}

/* ── RADIUS CIRCLE ── */
function renderRadiusCircle() {
  if (radiusCircle) {
    map.removeLayer(radiusCircle);
    radiusCircle = null;
  }

  const selectedEvent = state.events.find((e) => e.id === state.selectedId);
  if (state.showRadius && selectedEvent) {
    radiusCircle = L.circle([selectedEvent.lat, selectedEvent.lng], {
      radius: state.radius,
      color: "#ffd25a",
      fillColor: "#ffd25a",
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: "6 4",
    }).addTo(map);
  }
}

/* ── SELECTED PANEL ── */
function renderSelectedPanel() {
  const panel = document.getElementById("mapa-selected-panel");
  const selectedEvent = state.events.find((e) => e.id === state.selectedId);

  if (!selectedEvent) {
    panel.style.display = "none";
    return;
  }

  const cat = getCat(selectedEvent.ambit);
  panel.style.display = "flex";
  panel.querySelector(".mapa-selected-cat").style.background = cat.color;
  panel.querySelector(".mapa-selected-cat img").src = cat.icon;
  panel.querySelector(".mapa-selected-cat img").alt = selectedEvent.ambit;
  const ambitEl = panel.querySelector(".mapa-selected-ambit");
  ambitEl.textContent = selectedEvent.ambit;
  ambitEl.style.color = cat.color;
  panel.querySelector(".mapa-selected-title").textContent = selectedEvent.titol;
  const dateEl = panel.querySelector(".mapa-selected-date");
  dateEl.textContent = selectedEvent.data ? fmtDate(selectedEvent.data) : "";
  dateEl.style.display = selectedEvent.data ? "block" : "none";
}

/* ── BADGE ── */
function renderBadge(filtered) {
  document.getElementById("mapa-badge-count").textContent = filtered.length;
}

/* ── LAYOUT (sidebar visible/amagat) ── */
function renderLayout() {
  document
    .getElementById("mapa-layout")
    .classList.toggle("sidebar-hidden", !state.sidebarOpen);
}
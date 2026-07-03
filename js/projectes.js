// projectes.js
// Equivalent vanilla del component Projectes.jsx: estat de pàgina, filtres
// (cerca, categoria via URL, estat) i renderitzat de la graella.

const state = {
  projectes: [],
  loading: true,
  error: null,
  cerca: "",
  estat: "tots",
};

document.addEventListener("DOMContentLoaded", () => {
  wireFilters();
  fetchProjectes();
});

/* ===========================================================
   URL PARAM "categoria" (equivalent a useSearchParams)
=========================================================== */

function getCategoriaURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("categoria") || "tots";
}

function setCategoriaURL(val) {
  const params = new URLSearchParams(window.location.search);
  if (val === "tots") params.delete("categoria");
  else params.set("categoria", val);

  const newSearch = params.toString();
  const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "");
  window.history.replaceState({}, "", newUrl);
  render();
}

/* ===========================================================
   FETCH
=========================================================== */

async function fetchProjectes() {
  state.loading = true;
  render();

  try {
    const res = await fetch("http://localhost:5000/projectes");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    state.projectes = Array.isArray(data) ? data : data.projectes ?? [];
  } catch (err) {
    console.error(err);
    state.error = err.message;
  } finally {
    state.loading = false;
    render();
  }
}

/* ===========================================================
   DERIVED DATA
=========================================================== */

function getCategories() {
  const set = new Set(state.projectes.map((p) => p.categoria).filter(Boolean));
  return ["tots", ...set];
}

function getFiltrats() {
  const q = state.cerca.toLowerCase();
  const categoriaURL = getCategoriaURL();

  return state.projectes.filter((p) => {
    const matchCerca =
      !q || p.titol?.toLowerCase().includes(q) || p.resum?.toLowerCase().includes(q);
    const matchCategoria = categoriaURL === "tots" || p.categoria === categoriaURL;
    const matchEstat = state.estat === "tots" || p.estat === state.estat;
    return matchCerca && matchCategoria && matchEstat;
  });
}

function hiHaFiltres() {
  return state.cerca || state.estat !== "tots" || getCategoriaURL() !== "tots";
}

function resetFiltres() {
  state.cerca = "";
  state.estat = "tots";
  document.getElementById("pf-search-input").value = "";
  document.getElementById("pf-estat-select").value = "tots";
  setCategoriaURL("tots");
}

/* ===========================================================
   WIRING DE FILTRES ESTÀTICS
=========================================================== */

function wireFilters() {
  const searchInput = document.getElementById("pf-search-input");
  searchInput.addEventListener("input", (e) => {
    state.cerca = e.target.value;
    render();
  });

  document.getElementById("pf-search-clear").addEventListener("click", () => {
    state.cerca = "";
    searchInput.value = "";
    render();
  });

  document.getElementById("pf-estat-select").addEventListener("change", (e) => {
    state.estat = e.target.value;
    render();
  });

  document.getElementById("pf-reset-btn").addEventListener("click", resetFiltres);
}

/* ===========================================================
   RENDER PRINCIPAL
=========================================================== */

function render() {
  renderHero();
  renderCatPills();
  renderFilterState();
  renderGrid();
}

/* ── HERO ── */
function renderHero() {
  const statsWrap = document.getElementById("projectes-hero-stats");

  if (state.loading) {
    statsWrap.style.display = "none";
    return;
  }

  statsWrap.style.display = "flex";
  const categories = getCategories();

  document.getElementById("stat-total").textContent = state.projectes.length;
  document.getElementById("stat-actius").textContent = state.projectes.filter(
    (p) => p.estat === "actiu"
  ).length;
  document.getElementById("stat-categories").textContent = categories.length - 1;
}

/* ── CATEGORY PILLS ── */
function renderCatPills() {
  const wrap = document.getElementById("projecte-cat-pills");
  wrap.innerHTML = "";
  const categoriaURL = getCategoriaURL();

  getCategories().forEach((c) => {
    const btn = document.createElement("button");
    btn.className = `projecte-cat-pill ${categoriaURL === c ? "active" : ""}`;
    const count = c === "tots" ? state.projectes.length : state.projectes.filter((p) => p.categoria === c).length;
    btn.innerHTML = `
      ${c === "tots" ? "Tots" : c}
      <span class="projecte-cat-pill-count">${count}</span>
    `;
    btn.addEventListener("click", () => setCategoriaURL(c));
    wrap.appendChild(btn);
  });
}

/* ── ESTAT DE FILTRES (mostrar/amagar botons, comptador) ── */
function renderFilterState() {
  document.getElementById("pf-search-clear").style.display = state.cerca ? "flex" : "none";
  document.getElementById("pf-reset-btn").style.display = hiHaFiltres() ? "inline-flex" : "none";

  const filtrats = getFiltrats();
  document.getElementById("pf-count-filtered").textContent = filtrats.length;
  document.getElementById("pf-count-total").textContent = state.projectes.length;
}

/* ── GRID ── */
function renderGrid() {
  const section = document.getElementById("projectes-grid-section");
  section.innerHTML = "";

  if (state.loading) {
    section.innerHTML = `
      <div class="projectes-state">
        <div class="projectes-spinner"></div>
        <p>Carregant projectes...</p>
      </div>`;
    return;
  }

  if (state.error) {
    section.innerHTML = `
      <div class="projectes-state error">
        <i class="ti ti-alert-circle" style="font-size:2rem;"></i>
        <p>Error: ${state.error}</p>
      </div>`;
    return;
  }

  const filtrats = getFiltrats();

  if (filtrats.length === 0) {
    const div = document.createElement("div");
    div.className = "projectes-state";
    div.innerHTML = `
      <i class="ti ti-zoom-cancel" style="font-size:2rem;opacity:0.3;"></i>
      <p>Cap projecte trobat.</p>
      <button class="pf-reset-btn" style="display:inline-flex;">Netejar filtres</button>
    `;
    div.querySelector("button").addEventListener("click", resetFiltres);
    section.appendChild(div);
    return;
  }

  const grid = document.createElement("div");
  grid.className = "projectes-grid";

  filtrats.forEach((p, idx) => {
    const img = p.galeria_imatges?.[0]?.url || p.imatge || null;
    const estatColor = ESTAT_COLORS[p.estat] ?? "var(--text-muted)";

    const card = document.createElement("article");
    card.className = "proj-card";

    card.innerHTML = `
      <div class="proj-card-img">
        ${img ? `<img src="${img}" alt="${p.titol}" />` : `<div class="proj-card-img-placeholder"></div>`}
        <div class="proj-card-img-overlay"></div>
        ${p.estat ? `<span class="proj-card-estat" style="background:${estatColor};color:#0a0a0a">${p.estat}</span>` : ""}
      </div>

      <div class="proj-card-body">
        ${p.categoria ? `<span class="proj-card-cat">${p.categoria}</span>` : ""}
        <h3 class="proj-card-title">${p.titol ?? ""}</h3>
        ${p.resum ? `<p class="proj-card-resum">${p.resum}</p>` : ""}

        <div class="proj-card-meta">
          ${p.lloc ? `<span class="proj-card-meta-item"><i class="ti ti-map-pin"></i> ${p.lloc}</span>` : ""}
          ${p.data_publicacio ? `<span class="proj-card-meta-item"><i class="ti ti-calendar"></i> ${fmtDate(p.data_publicacio)}</span>` : ""}
        </div>

        <button class="proj-card-btn">Veure projecte <i class="ti ti-arrow-right"></i></button>
      </div>
    `;

    card.querySelector(".proj-card-btn").addEventListener("click", () => {
      window.location.href = `projecte.html?id=${p.id}`;
    });

    grid.appendChild(card);
  });

  section.appendChild(grid);
}
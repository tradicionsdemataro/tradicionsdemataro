// publicacions.js
// Equivalent vanilla del component Publicacions.jsx: estat de pàgina,
// filtres (cerca, categoria via URL, estat) i renderitzat de la graella.

const state = {
  publicacions: [],
  loading: true,
  error: null,
  cerca: "",
  estat: "tots",
};

document.addEventListener("DOMContentLoaded", () => {
  state.cerca = "";
  wireFilters();
  fetchPublicacions();
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

async function fetchPublicacions() {
  state.loading = true;
  render();

  try {
    const res = await fetch("https://backend-tradicions.onrender.com/publi");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    state.publicacions = Array.isArray(data) ? data : data.publicacions ?? [];
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
  const set = new Set(state.publicacions.map((p) => p.categoria).filter(Boolean));
  return ["tots", ...set];
}

function getFiltrades() {
  const q = state.cerca.toLowerCase();
  const categoriaURL = getCategoriaURL();

  return state.publicacions.filter((p) => {
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
  const statsWrap = document.getElementById("publicacions-hero-stats");

  if (state.loading) {
    statsWrap.style.display = "none";
    return;
  }

  statsWrap.style.display = "flex";
  const categories = getCategories();

  document.getElementById("stat-total").textContent = state.publicacions.length;
  document.getElementById("stat-publicades").textContent = state.publicacions.filter(
    (p) => p.estat === "publicat"
  ).length;
  document.getElementById("stat-categories").textContent = categories.length - 1;
}

/* ── CATEGORY PILLS ── */
function renderCatPills() {
  const wrap = document.getElementById("pf-cat-pills");
  wrap.innerHTML = "";
  const categoriaURL = getCategoriaURL();

  getCategories().forEach((c) => {
    const btn = document.createElement("button");
    btn.className = `pf-cat-pill ${categoriaURL === c ? "active" : ""}`;
    const count = c === "tots" ? state.publicacions.length : state.publicacions.filter((p) => p.categoria === c).length;
    btn.innerHTML = `
      ${c === "tots" ? "Totes" : c}
      <span class="pf-cat-pill-count">${count}</span>
    `;
    btn.addEventListener("click", () => setCategoriaURL(c));
    wrap.appendChild(btn);
  });
}

/* ── ESTAT DE FILTRES (mostrar/amagar botons, comptador) ── */
function renderFilterState() {
  document.getElementById("pf-search-clear").style.display = state.cerca ? "flex" : "none";
  document.getElementById("pf-reset-btn").style.display = hiHaFiltres() ? "inline-flex" : "none";

  const filtrades = getFiltrades();
  document.getElementById("pf-count-filtered").textContent = filtrades.length;
  document.getElementById("pf-count-total").textContent = state.publicacions.length;
}

/* ── GRID ── */
function renderGrid() {
  const section = document.getElementById("publicacions-grid-section");
  section.innerHTML = "";

  if (state.loading) {
    section.innerHTML = `
      <div class="publicacions-state">
        <div class="publicacions-spinner"></div>
        <p>Carregant publicacions...</p>
      </div>`;
    return;
  }

  if (state.error) {
    section.innerHTML = `
      <div class="publicacions-state error">
        <i class="ti ti-alert-circle" style="font-size:2rem;"></i>
        <p>Error: ${state.error}</p>
      </div>`;
    return;
  }

  const filtrades = getFiltrades();

  if (filtrades.length === 0) {
    const div = document.createElement("div");
    div.className = "publicacions-state";
    div.innerHTML = `
      <i class="ti ti-zoom-cancel" style="font-size:2rem;opacity:0.3;"></i>
      <p>Cap publicació trobada.</p>
      <button class="pf-reset-btn" style="display:inline-flex;">Netejar filtres</button>
    `;
    div.querySelector("button").addEventListener("click", resetFiltres);
    section.appendChild(div);
    return;
  }

  const grid = document.createElement("div");
  grid.className = "publicacions-grid";

  filtrades.forEach((p, idx) => {
    const img = p.galeria_imatges?.[0]?.url || p.imatge || null;
    const estatColor = ESTAT_COLORS[p.estat] ?? "var(--text-muted)";

    const card = document.createElement("article");
    card.className = "pub-card";

    card.innerHTML = `
      <div class="pub-card-img">
        ${img ? `<img src="${img}" alt="${p.titol}" />` : `<div class="pub-card-img-placeholder"></div>`}
        <div class="pub-card-img-overlay"></div>
        ${p.estat ? `<span class="pub-card-estat" style="background:${estatColor};color:#0a0a0a">${p.estat}</span>` : ""}
      </div>

      <div class="pub-card-body">
        ${p.categoria ? `<span class="pub-card-cat">${p.categoria}</span>` : ""}
        <h3 class="pub-card-title">${p.titol ?? ""}</h3>
        ${p.resum ? `<p class="pub-card-resum">${p.resum}</p>` : ""}

        <div class="pub-card-meta">
          ${p.autor ? `<span class="pub-card-meta-item"><i class="ti ti-user"></i> ${p.autor}</span>` : ""}
          ${(p.data_publicacio ?? p.data) ? `<span class="pub-card-meta-item"><i class="ti ti-calendar"></i> ${fmtDate(p.data_publicacio ?? p.data)}</span>` : ""}
        </div>

        <button class="pub-card-btn">Llegir més <i class="ti ti-arrow-right"></i></button>
      </div>
    `;

    card.querySelector(".pub-card-btn").addEventListener("click", () => {
    window.location.href = `https://tradicionsdemataro.github.io/tradicionsdemataro/indexPages/publicacio.html?id=${p.id}`;
  });

    // ── Ressenyes (component independent per targeta) ──
    card.appendChild(buildResenyesCard(p._id ?? p.id ?? idx));

    grid.appendChild(card);
  });

  section.appendChild(grid);
}
// links.js
// Equivalent vanilla del component Links.jsx: cerca + filtre de categoria
// (useState → variables globals) i renderitzat del directori de links.

const state = {
  search: "",
  activeCat: "all",
};

document.addEventListener("DOMContentLoaded", () => {
  renderHeroStats();
  renderFilterPills();
  wireSearch();
  render();
});

/* ===========================================================
   HELPERS
=========================================================== */

// Equivalent a <Highlight text={...} query={...} />
function highlight(text, query) {
  if (!query) return escapeHtml(text);
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return escapeHtml(text);
  const before = escapeHtml(text.slice(0, idx));
  const match = escapeHtml(text.slice(idx, idx + query.length));
  const after = escapeHtml(text.slice(idx + query.length));
  return `${before}<mark class="lk-hl">${match}</mark>${after}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Equivalent al useMemo `filtered`
function getFiltered() {
  const q = state.search.trim().toLowerCase();
  return categories
    .filter((cat) => state.activeCat === "all" || cat.id === state.activeCat)
    .map((cat) => ({
      ...cat,
      links: cat.links.filter(
        (l) =>
          !q ||
          l.nom.toLowerCase().includes(q) ||
          netloc(l.url).toLowerCase().includes(q)
      ),
    }))
    .filter((cat) => cat.links.length > 0);
}

/* ===========================================================
   HERO (elements estàtics que depenen només de `categories`)
=========================================================== */

function renderHeroStats() {
  document.getElementById("lh-count-categories").textContent = categories.length;
  document.getElementById("lh-count-links").textContent = totalLinks;
}

/* ===========================================================
   CERCA
=========================================================== */

function wireSearch() {
  const input = document.getElementById("lk-search-input");
  const clearBtn = document.getElementById("lk-search-clear");

  input.addEventListener("input", (e) => {
    state.search = e.target.value;
    render();
  });

  clearBtn.addEventListener("click", () => {
    state.search = "";
    input.value = "";
    render();
  });
}

/* ===========================================================
   PILLS DE FILTRE PER CATEGORIA
=========================================================== */

function renderFilterPills() {
  const wrap = document.getElementById("lk-filter-pills");
  wrap.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.className = "lk-fpill";
  allBtn.dataset.cat = "all";
  allBtn.innerHTML = `Tots<span class="lk-fpill-count">${totalLinks}</span>`;
  allBtn.addEventListener("click", () => {
    state.activeCat = "all";
    render();
  });
  wrap.appendChild(allBtn);

  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "lk-fpill";
    btn.dataset.cat = cat.id;
    btn.innerHTML = `${cat.icon} ${cat.nom}<span class="lk-fpill-count">${cat.links.length}</span>`;
    btn.addEventListener("click", () => {
      state.activeCat = state.activeCat === cat.id ? "all" : cat.id;
      render();
    });
    wrap.appendChild(btn);
  });
}

function updateFilterPillsState() {
  document.querySelectorAll("#lk-filter-pills .lk-fpill").forEach((btn) => {
    const isActive = btn.dataset.cat === state.activeCat;
    btn.classList.toggle("active", isActive);

    if (isActive && btn.dataset.cat !== "all") {
      const cat = categories.find((c) => c.id === btn.dataset.cat);
      btn.style.setProperty("--fpill-accent", cat.accentColor);
    } else {
      btn.style.removeProperty("--fpill-accent");
    }
  });
}

/* ===========================================================
   RENDER PRINCIPAL
=========================================================== */

function render() {
  document.getElementById("lk-search-clear").style.display = state.search ? "flex" : "none";
  updateFilterPillsState();
  renderResultsCount();
  renderBody();
}

function renderResultsCount() {
  const wrap = document.getElementById("lk-results-count");
  const filtered = getFiltered();
  const filteredTotal = filtered.reduce((a, c) => a + c.links.length, 0);

  if (state.search || state.activeCat !== "all") {
    const catName = categories.find((c) => c.id === state.activeCat)?.nom;
    wrap.innerHTML = `
      <span>
        <strong>${filteredTotal}</strong> resultat${filteredTotal !== 1 ? "s" : ""}
        ${state.search ? ` per "<em>${escapeHtml(state.search)}</em>"` : ""}
        ${state.activeCat !== "all" ? ` · ${catName}` : ""}
      </span>
    `;
  } else {
    wrap.innerHTML = `<span><strong>${totalLinks}</strong> recursos en total</span>`;
  }
}

function renderBody() {
  const body = document.getElementById("links-body");
  const filtered = getFiltered();

  body.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "lk-empty";
    empty.innerHTML = `
      <i class="ti ti-search-off"></i>
      <p>Cap resultat per "<strong>${escapeHtml(state.search)}</strong>"</p>
      <button class="lk-empty-reset">Netejar filtres</button>
    `;
    empty.querySelector(".lk-empty-reset").addEventListener("click", () => {
      state.search = "";
      state.activeCat = "all";
      document.getElementById("lk-search-input").value = "";
      render();
    });
    body.appendChild(empty);
    return;
  }

  filtered.forEach((cat) => {
    const catEl = document.createElement("div");
    catEl.className = `lk-cat ${cat.className}`;

    const label = document.createElement("div");
    label.className = "lk-cat-label";
    label.innerHTML = `
      <span class="lk-cat-icon">${cat.icon}</span>
      <span class="lk-cat-name">${cat.nom}</span>
      <span class="lk-cat-count">${cat.links.length} recurs${cat.links.length !== 1 ? "os" : ""}</span>
      <div class="lk-cat-accent-line" style="background:${cat.accentColor}"></div>
    `;
    catEl.appendChild(label);

    const grid = document.createElement("div");
    grid.className = "lk-grid";

    cat.links.forEach((link) => {
      const a = document.createElement("a");
      a.href = link.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "lk-card";
      a.innerHTML = `
        <div class="lk-card-text">
          <span class="lk-card-name">${highlight(link.nom, state.search)}</span>
          <span class="lk-card-url">${highlight(netloc(link.url), state.search)}</span>
        </div>
        <i class="ti ti-arrow-up-right lk-card-arrow"></i>
      `;
      grid.appendChild(a);
    });

    catEl.appendChild(grid);
    body.appendChild(catEl);
  });
}
// ============================================================
// search-content.js — Equivalent a SearchContent.jsx
// Depèn de search-data.js. Exposa window.renderSearchContent(container)
//
// IMPORTANT: a diferència de la primera versió, aquí l'estructura
// es crea NOMÉS UNA VEGADA. Els canvis d'estat (escriure, marcar
// checkboxes, obrir/tancar filtres) actualitzen únicament els trossos
// de DOM que cal canviar — mai es torna a fer innerHTML dels inputs,
// perquè això feia perdre el focus i reiniciava les animacions CSS
// (l'efecte de "tot gris / opcions que parpellegen i desapareixen").
// ============================================================

function renderSearchContent(container, onCloseCallback) {

  const sc = {
    filtersOpen: false,
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    selectedAmbits: [],
    selectedUbicacions: [],
    searchQuery: "",
    events: [],
    publicacions: [],
    projectes: [],
    loading: false,
  };

  function activeFilterCount() {
    return sc.selectedAmbits.length +
      sc.selectedUbicacions.length +
      (sc.startDate ? 1 : 0) +
      (sc.endDate ? 1 : 0) +
      (sc.startTime ? 1 : 0) +
      (sc.endTime ? 1 : 0);
  }

  function getResults() {
    const results = [
      ...pagines.map(p => ({
        type: "page", titol: p.nom, url: p.url, imatge: p.imatge,
        tipusLabel: p.tipusLabel, categoria: p.categoria,
      })),
      ...sc.events.map(e => ({ ...e, type: "event", tipusLabel: "Event", url: `/events/${e.id || e._id}` })),
      ...sc.publicacions.map(p => ({ ...p, type: "publicacio", tipusLabel: "Publicació", url: `/publicacions/${p.id || p._id}` })),
      ...sc.projectes.map(p => ({ ...p, type: "projecte", tipusLabel: "Projecte", url: `/projectes/${p.id || p._id}` })),
    ];
    return results.filter(item => (item.titol || "").toLowerCase().includes(sc.searchQuery.toLowerCase()));
  }

  function handleClick(item) {
    if (item.url) {
      window.location.href = item.url;
      if (onCloseCallback) onCloseCallback();
    }
  }

  // ── 1) Estructura estàtica — es crea UNA sola vegada ────────────────
  container.innerHTML = `
    <div class="search-content">
      <div class="mobile-topbar">
        <div class="mobile-search-wrap">
          <svg class="mobile-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" class="mobile-search-input" placeholder="Cerca..." autofocus />
          <button class="mobile-clear-btn" aria-label="Esborrar" style="display:none;">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="2" y1="2" x2="14" y2="14"></line><line x1="14" y1="2" x2="2" y2="14"></line>
            </svg>
          </button>
        </div>

        <button class="mobile-filter-toggle" data-action="toggle-filters" aria-expanded="false" aria-label="Filtres">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
            <line x1="11" y1="18" x2="13" y2="18"></line>
          </svg>
          <span class="filter-badge" style="display:none;"></span>
        </button>

        <button class="mobile-search-close" data-action="close-search-content" aria-label="Tancar cerca">✕</button>
      </div>

      <aside class="filters-sidebar">
        <div class="filters-sidebar-inner">
          <div class="filters-header-row">
            <h2 class="filters-title">Filtres</h2>
            <button class="filters-close-btn" data-action="close-filters" aria-label="Tancar filtres">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="2" y1="2" x2="14" y2="14"></line><line x1="14" y1="2" x2="2" y2="14"></line>
              </svg>
            </button>
          </div>
          <div class="filters-divider"></div>

          <div class="filter-section">
            <h3 class="filter-heading">Dates</h3>
            <div class="date-range-container">
              <label>Des de:<input type="date" data-field="startDate" /></label>
              <label>Fins a:<input type="date" data-field="endDate" /></label>
            </div>
          </div>

          <div class="filter-section">
            <h3 class="filter-heading">Hora</h3>
            <div class="time-range-container">
              <label>Des de:<input type="time" data-field="startTime" /></label>
              <label>Fins a:<input type="time" data-field="endTime" /></label>
            </div>
          </div>

          <div class="filter-section">
            <h3 class="filter-heading">Àmbits</h3>
            <div class="checkbox-container">
              ${ambits.map((item, index) => `
                <div class="checkbox-item">
                  <input type="checkbox" id="ambit-${index}" data-ambit="${item}" />
                  <label for="ambit-${index}">
                    <span class="img-box"></span>
                    <span class="text-box">${item}</span>
                  </label>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="filter-section">
            <h3 class="filter-heading">Ubicació</h3>
            <div class="checkbox-container">
              ${ubicacions.map((item, index) => `
                <div class="checkbox-item">
                  <input type="checkbox" id="ubicacio-${index}" data-ubicacio="${item}" />
                  <label for="ubicacio-${index}">
                    <span class="img-box"></span>
                    <span class="text-box">${item}</span>
                  </label>
                </div>
              `).join("")}
            </div>
          </div>

          <button class="filters-apply-btn" data-action="close-filters" style="display:none;"></button>
        </div>
      </aside>

      <div class="filters-backdrop" data-action="close-filters" style="display:none;"></div>

      <div class="results-area">
        <div class="results-search desktop-only">
          <input type="text" placeholder="Cerca resultats..." data-field="searchQueryDesktop" />
        </div>

        <div class="results-grid"></div>
      </div>
    </div>
  `;

  // ── 2) Referències als nodes que NO es tornaran a crear ─────────────
  const mobileSearchInput   = container.querySelector(".mobile-search-input");
  const desktopSearchInput  = container.querySelector('[data-field="searchQueryDesktop"]');
  const clearBtn            = container.querySelector(".mobile-clear-btn");
  const filterToggleBtn     = container.querySelector('[data-action="toggle-filters"]');
  const filterBadge         = filterToggleBtn.querySelector(".filter-badge");
  const filtersSidebar      = container.querySelector(".filters-sidebar");
  const filtersBackdrop     = container.querySelector(".filters-backdrop");
  const applyBtn            = container.querySelector(".filters-apply-btn");
  const resultsGrid         = container.querySelector(".results-grid");
  const startDateInput      = container.querySelector('[data-field="startDate"]');
  const endDateInput        = container.querySelector('[data-field="endDate"]');
  const startTimeInput      = container.querySelector('[data-field="startTime"]');
  const endTimeInput        = container.querySelector('[data-field="endTime"]');

  // ── 3) Updates puntuals (mai toquen els inputs de text) ─────────────
  function syncSearchInputs(source) {
    if (source !== mobileSearchInput) mobileSearchInput.value = sc.searchQuery;
    if (source !== desktopSearchInput) desktopSearchInput.value = sc.searchQuery;
    clearBtn.style.display = sc.searchQuery ? "" : "none";
  }

  function updateFilterUI() {
    const count = activeFilterCount();
    filtersSidebar.classList.toggle("filters-open", sc.filtersOpen);
    filtersBackdrop.style.display = sc.filtersOpen ? "" : "none";
    filterToggleBtn.classList.toggle("active", sc.filtersOpen);
    filterToggleBtn.setAttribute("aria-expanded", String(sc.filtersOpen));
    filterBadge.style.display = count > 0 ? "" : "none";
    filterBadge.textContent = count > 0 ? String(count) : "";
    applyBtn.style.display = count > 0 ? "" : "none";
  }

  function updateResults() {
    const filteredResults = getResults();

    applyBtn.textContent = `Veure ${filteredResults.length} resultats`;

    if (sc.loading) {
      resultsGrid.innerHTML = `<p class="loading">Carregant...</p>`;
      return;
    }
    if (filteredResults.length === 0) {
      resultsGrid.innerHTML = `<p class="no-results">No hi ha resultats</p>`;
      return;
    }

    resultsGrid.innerHTML = filteredResults.map((item, i) => {
      const hora = formatHora(item);
      const data = formatDate(item);
      const ambit = item.ambit || item.categoria;
      const tipus = item.tipusLabel;
      return `
        <div class="card" data-result-index="${i}">
          <div class="card-image">
            <img src="${item.imatge || item.img || "/images/placeholder.jpg"}" alt="${item.titol || ""}" />
            <div class="badges">
              ${tipus ? `<span class="badge-audiencia badge-tipus">${tipus}</span>` : ""}
              ${hora ? `<span class="badge-hora">${hora}</span>` : ""}
              ${ambit ? `<span class="badge-audiencia ${getAmbitClass(ambit)}">${ambit}</span>` : ""}
            </div>
            <span class="card-title">${item.titol || ""}</span>
          </div>
          <div class="card-info">
            ${data ? `<span class="card-date">${data}</span>` : ""}
            <p>${item.descripcio || ""}</p>
            ${item.ubicacio ? `<span class="card-location">${item.ubicacio}</span>` : ""}
            ${item.type === "page" ? `<p>Pàgina del sistema</p>` : ""}
            <button class="btn-detall">Mes detall</button>
          </div>
        </div>
      `;
    }).join("");

    resultsGrid.querySelectorAll(".card").forEach(card => {
      const idx = Number(card.dataset.resultIndex);
      card.addEventListener("click", () => handleClick(filteredResults[idx]));
    });
  }

  // ── 4) Listeners — s'enganxen UNA vegada, els nodes no es recreen ───
  mobileSearchInput.addEventListener("input", (e) => {
    sc.searchQuery = e.target.value;
    syncSearchInputs(mobileSearchInput);
    updateResults();
    updateFilterUI();
  });
  desktopSearchInput.addEventListener("input", (e) => {
    sc.searchQuery = e.target.value;
    syncSearchInputs(desktopSearchInput);
    updateResults();
    updateFilterUI();
  });
  clearBtn.addEventListener("click", () => {
    sc.searchQuery = "";
    syncSearchInputs(null);
    updateResults();
    updateFilterUI();
  });

  filterToggleBtn.addEventListener("click", () => {
    sc.filtersOpen = !sc.filtersOpen;
    updateFilterUI();
  });

  container.querySelector('[data-action="close-search-content"]')?.addEventListener("click", () => {
    if (onCloseCallback) onCloseCallback();
  });
  container.querySelectorAll('[data-action="close-filters"]').forEach(el => {
    el.addEventListener("click", () => {
      sc.filtersOpen = false;
      updateFilterUI();
    });
  });

  startDateInput.addEventListener("change", e => { sc.startDate = e.target.value; updateFilterUI(); updateResults(); });
  endDateInput.addEventListener("change", e => { sc.endDate = e.target.value; updateFilterUI(); updateResults(); });
  startTimeInput.addEventListener("change", e => { sc.startTime = e.target.value; updateFilterUI(); updateResults(); });
  endTimeInput.addEventListener("change", e => { sc.endTime = e.target.value; updateFilterUI(); updateResults(); });

  container.querySelectorAll('[data-ambit]').forEach(cb => {
    cb.addEventListener("change", () => {
      const value = cb.dataset.ambit;
      const idx = sc.selectedAmbits.indexOf(value);
      if (cb.checked && idx === -1) sc.selectedAmbits.push(value);
      if (!cb.checked && idx > -1) sc.selectedAmbits.splice(idx, 1);
      updateFilterUI();
      updateResults();
    });
  });
  container.querySelectorAll('[data-ubicacio]').forEach(cb => {
    cb.addEventListener("change", () => {
      const value = cb.dataset.ubicacio;
      const idx = sc.selectedUbicacions.indexOf(value);
      if (cb.checked && idx === -1) sc.selectedUbicacions.push(value);
      if (!cb.checked && idx > -1) sc.selectedUbicacions.splice(idx, 1);
      updateFilterUI();
      updateResults();
    });
  });

  // ── 5) Fetch inicial ─────────────────────────────────────────────
  async function fetchData() {
    sc.loading = true;
    updateResults();
    try {
      const [eventsRes, pubRes, projRes] = await Promise.all([
        fetch("https://backend-tradicions.onrender.com/events"),
        fetch("https://backend-tradicions.onrender.com/publi"),
        fetch("https://backend-tradicions.onrender.com/projectes"),
      ]);
      const eventsData = await eventsRes.json();
      const pubData = await pubRes.json();
      const projData = await projRes.json();
      sc.events = eventsData.events || [];
      sc.publicacions = pubData.publicacions || [];
      sc.projectes = projData.projectes || [];
    } catch (err) {
      console.error("Error carregant dades:", err);
    } finally {
      sc.loading = false;
      updateResults();
    }
  }

  updateFilterUI();
  updateResults();
  fetchData();
}
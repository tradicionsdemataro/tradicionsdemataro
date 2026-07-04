// ============================================================
// admin-sections.js — Totes les seccions del AdminPanel.jsx
// Depèn de admin-core.js. Cada init*(container, ...) munta
// la secció corresponent dins el contenidor donat.
// ============================================================

// ════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════
function initDashboard(container, onNav) {
  container.innerHTML = `<div class="adm-loading"><div class="adm-spin"></div><span>Carregant estadístiques…</span></div>`;
  Promise.allSettled([apiFetch("/admin/stats"), apiFetch("/admin/visits")]).then(([s, v]) => {
    const stats = s.status === "fulfilled" ? s.value : null;
    let visits = [];
    if (v.status === "fulfilled") { const d = v.value; visits = Array.isArray(d) ? d : (d.visits ?? d.visites ?? []); }
    renderDashboard(container, stats, visits, onNav);
  });
}

function renderDashboard(container, stats, visits, onNav) {
  const statCard = (icon, label, value, accent, navId) => `
    <div class="adm-stat${navId ? " adm-stat--clickable" : ""}" style="--accent:${accent}" data-nav="${navId ?? ""}">
      <div class="adm-stat__icon"><i class="ti ${icon}"></i></div>
      <div class="adm-stat__body">
        <span class="adm-stat__val">${value ?? "—"}</span>
        <span class="adm-stat__lbl">${label}</span>
      </div>
      ${navId ? `<i class="ti ti-chevron-right adm-stat__arrow"></i>` : ""}
    </div>
  `;

  const max = Math.max(...(visits.length ? visits.map(d => d.count) : [1]), 1);
  const chartHtml = !visits.length
    ? `<div class="adm-chart-empty"><i class="ti ti-chart-bar-off"></i><span>Sense dades de visites disponibles</span></div>`
    : `<div class="adm-chart">
        ${visits.map(d => `
          <div class="adm-chart__col">
            <div class="adm-chart__bar-wrap">
              <div class="adm-chart__bar" style="height:${(d.count / max) * 100}%" title="${d.count} visites">
                <span class="adm-chart__val">${d.count}</span>
              </div>
            </div>
            <span class="adm-chart__lbl">${d.label ?? d.date ?? d.dia}</span>
          </div>
        `).join("")}
      </div>`;

  container.innerHTML = `
    <div class="adm-sec">
      <div class="adm-sec__head"><h2 class="adm-sec__title"><i class="ti ti-layout-dashboard"></i>Dashboard</h2></div>
      <div class="adm-stats-grid">
        ${statCard("ti-eye", "Visites totals", stats?.totalVisits, "var(--blue)")}
        ${statCard("ti-calendar-event", "Esdeveniments", stats?.totalEvents, "var(--yellow)", "events")}
        ${statCard("ti-folder", "Projectes", stats?.totalProjectes, "var(--pink)", "projectes")}
        ${statCard("ti-file-text", "Publicacions", stats?.totalPubli, "var(--blue)", "publicacions")}
        ${statCard("ti-message-star", "Ressenyes", stats?.totalRessenyes, "var(--yellow)", "ressenyes")}
        ${statCard("ti-users", "Sol·licituds", stats?.totalSolicituds, "var(--pink)", "solicituds")}
        ${statCard("ti-users-group", "Usuaris", stats?.totalUsers, "var(--blue)", "usuaris")}
      </div>
      <div class="adm-card adm-card--chart">
        <div class="adm-card__head">
          <span class="adm-card__title"><i class="ti ti-chart-bar"></i>Visites per dia</span>
          <span class="adm-card__sub">Últims 30 dies</span>
        </div>
        ${chartHtml}
      </div>
    </div>
  `;

  container.querySelectorAll("[data-nav]").forEach(el => {
    if (el.dataset.nav) {
      el.addEventListener("click", () => onNav(el.dataset.nav));
      el.style.cursor = "pointer";
    }
  });
}

// ════════════════════════════════════════════════════════════
// ESDEVENIMENTS
// ════════════════════════════════════════════════════════════
const BUIT_EVENT = { titol: "", descripcio: "", data_inici: "", data_fi: "", lloc: "", categoria: "", latitud: "", longitud: "", imatge: "" };

function initEvents(container) {
  const state = { rows: [], loading: true, search: "", images: [] };

  function buildShell() {
    container.innerHTML = `
      <div class="adm-sec">
        <div class="adm-sec__head">
          <h2 class="adm-sec__title"><i class="ti ti-calendar-event"></i>Esdeveniments<span class="adm-sec__count" data-role="count"></span></h2>
          <div class="adm-sec__actions">
            <div class="adm-search-wrap"><i class="ti ti-search adm-search-icon"></i><input class="${inpCls} adm-search-inp" data-role="search" placeholder="Cerca per títol…" /></div>
            <button class="adm-btn adm-btn--primary" data-action="create"><i class="ti ti-plus"></i>Nou Esdeveniment</button>
          </div>
        </div>
        <div data-role="table-mount"></div>
      </div>
    `;
    container.querySelector('[data-role="search"]').addEventListener("input", e => { state.search = e.target.value; renderTable(); });
    container.querySelector('[data-action="create"]').addEventListener("click", openCreate);
  }

  function load() {
    state.loading = true;
    renderTable();
    apiFetch("/admin/events")
      .then(d => { state.rows = Array.isArray(d) ? d : (d.events ?? []); })
      .catch(() => adminToast("Error carregant esdeveniments", "err"))
      .finally(() => { state.loading = false; renderTable(); });
  }

  function getFiltered() {
    return state.rows.filter(r => (r.titol ?? "").toLowerCase().includes(state.search.toLowerCase()));
  }

  function renderTable() {
    const countEl = container.querySelector('[data-role="count"]');
    if (countEl) countEl.textContent = state.rows.length;
    const mount = container.querySelector('[data-role="table-mount"]');
    if (!mount) return;

    if (state.loading) { mount.innerHTML = `<div class="adm-loading"><div class="adm-spin"></div><span>Carregant…</span></div>`; return; }

    const filtered = getFiltered();
    if (filtered.length === 0) {
      mount.innerHTML = emptyStateHtml("ti-calendar-off", state.search ? "Sense resultats" : "Sense esdeveniments", !state.search ? "Nou Esdeveniment" : null);
      mount.querySelector('[data-action="empty-cta"]')?.addEventListener("click", openCreate);
      return;
    }

    mount.innerHTML = `
      <div class="adm-table-wrap">
        <table class="adm-table">
          <thead><tr>
            <th><i class="ti ti-text-size"></i>Títol</th>
            <th><i class="ti ti-tag"></i>Categoria</th>
            <th><i class="ti ti-calendar"></i>Data inici</th>
            <th><i class="ti ti-map-pin"></i>Lloc</th>
            <th class="adm-th-actions">Accions</th>
          </tr></thead>
          <tbody>
            ${filtered.map((r, i) => `
              <tr data-idx="${i}">
                <td>
                  <div class="adm-td-main">
                    ${r.imatge ? `<img src="${r.imatge.startsWith("http") ? r.imatge : `${API}${r.imatge}`}" alt="" class="adm-td-img" />` : ""}
                    <div>
                      <span class="adm-td-title">${r.titol ?? ""}</span>
                      ${r.descripcio ? `<span class="adm-td-sub">${r.descripcio.slice(0, 60)}${r.descripcio.length > 60 ? "…" : ""}</span>` : ""}
                    </div>
                  </div>
                </td>
                <td>${r.categoria ? `<span class="adm-badge">${r.categoria}</span>` : `<span class="adm-dash">—</span>`}</td>
                <td><div class="adm-td-date"><i class="ti ti-calendar"></i><span>${(r.data_inici ?? r.data) ? new Date(r.data_inici ?? r.data).toLocaleDateString("ca-ES") : "—"}</span></div></td>
                <td>${r.lloc ? `<div class="adm-td-loc"><i class="ti ti-map-pin"></i><span>${r.lloc}</span></div>` : `<span class="adm-dash">—</span>`}</td>
                <td>${rowActionsHtml({ edit: true, del: true })}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;

    mount.querySelectorAll("tr[data-idx]").forEach(tr => {
      const r = filtered[Number(tr.dataset.idx)];
      tr.querySelector('[data-row-action="edit"]')?.addEventListener("click", () => openEdit(r));
      tr.querySelector('[data-row-action="delete"]')?.addEventListener("click", () => showConfirm(`Vols eliminar "${r.titol}"?`, () => del(r._id ?? r.id)));
    });
  }

  async function del(id) {
    try { await apiFetch(`/admin/events/${id}`, { method: "DELETE" }); adminToast("Eliminat ✓", "ok"); load(); }
    catch { adminToast("Error eliminant", "err"); }
  }

  function openCreate() { openForm({ mode: "create" }, { ...BUIT_EVENT }); }
  function openEdit(r) { openForm({ mode: "edit", id: r._id ?? r.id }, { ...BUIT_EVENT, ...r }); }

  function openForm(modalInfo, form) {
    const { body, close } = openModal({
      title: modalInfo.mode === "create" ? "Nou Esdeveniment" : "Editar Esdeveniment",
      icon: modalInfo.mode === "create" ? "ti-calendar-plus" : "ti-calendar-event",
    });

    body.innerHTML = `
      <div class="adm-form-grid">
        ${fieldHtml("Títol", `<input class="${inpCls}" data-f="titol" placeholder="Nom de l'esdeveniment" />`, { required: true })}
        ${fieldHtml("Categoria", `<input class="${inpCls}" data-f="categoria" placeholder="Festa, Cultura…" />`)}
        ${fieldHtml("Data inici", `<input type="datetime-local" class="${inpCls}" data-f="data_inici" />`)}
        ${fieldHtml("Data fi", `<input type="datetime-local" class="${inpCls}" data-f="data_fi" />`)}
        ${fieldHtml("Lloc", `<input class="${inpCls}" data-f="lloc" placeholder="Nom del lloc" />`)}
        ${fieldHtml("Latitud", `<input type="number" class="${inpCls}" data-f="latitud" placeholder="41.5389" />`)}
        ${fieldHtml("Longitud", `<input type="number" class="${inpCls}" data-f="longitud" placeholder="2.4450" />`)}
        ${fieldHtml("Descripció", `<textarea class="${texCls}" rows="3" data-f="descripcio" placeholder="Descripció de l'esdeveniment…"></textarea>`, { span: true })}
        <div data-role="imgpicker-mount"></div>
      </div>
      <div class="adm-modal__foot">
        <button class="adm-btn adm-btn--ghost" data-action="cancel"><i class="ti ti-x"></i>Cancel·lar</button>
        <button class="adm-btn adm-btn--primary" data-action="save"><i class="ti ti-device-floppy"></i>Desar canvis</button>
      </div>
    `;

    body.querySelectorAll("[data-f]").forEach(el => {
      el.value = form[el.dataset.f] ?? "";
      el.addEventListener("input", () => { form[el.dataset.f] = el.value; updateSaveState(); });
    });

    mountImagePicker(body.querySelector('[data-role="imgpicker-mount"]'), {
      label: "Imatge", value: form.imatge, span: true, images: state.images,
      onChange: v => { form.imatge = v; },
    });

    const saveBtn = body.querySelector('[data-action="save"]');
    function updateSaveState() { saveBtn.disabled = !form.titol; }
    updateSaveState();

    body.querySelector('[data-action="cancel"]').addEventListener("click", close);
    saveBtn.addEventListener("click", async () => {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<div class="adm-spin adm-spin--sm"></div>Desant…`;
      try {
        if (modalInfo.mode === "create") await apiFetch("/admin/events", { method: "POST", body: JSON.stringify(form) });
        else await apiFetch(`/admin/events/${modalInfo.id}`, { method: "PUT", body: JSON.stringify(form) });
        adminToast(modalInfo.mode === "create" ? "Esdeveniment creat ✓" : "Actualitzat ✓", "ok");
        close(); load();
      } catch {
        adminToast("Error desant", "err");
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<i class="ti ti-device-floppy"></i>Desar canvis`;
      }
    });
  }

  buildShell();
  loadMediaImages(imgs => { state.images = imgs; });
  load();
}

// ════════════════════════════════════════════════════════════
// PROJECTES
// ════════════════════════════════════════════════════════════
const BUIT_PROJ = { titol: "", descripcio: "", estat: "actiu", imatge: "", categoria: "", data_inici: "", data_fi: "", responsable: "" };
const ESTATS_PROJ = ["actiu", "finalitzat", "pendent", "cancel·lat"];

function initProjectes(container) {
  const state = { rows: [], loading: true, search: "", images: [] };

  function buildShell() {
    container.innerHTML = `
      <div class="adm-sec">
        <div class="adm-sec__head">
          <h2 class="adm-sec__title"><i class="ti ti-folder"></i>Projectes<span class="adm-sec__count" data-role="count"></span></h2>
          <div class="adm-sec__actions">
            <div class="adm-search-wrap"><i class="ti ti-search adm-search-icon"></i><input class="${inpCls} adm-search-inp" data-role="search" placeholder="Cerca per títol…" /></div>
            <button class="adm-btn adm-btn--primary" data-action="create"><i class="ti ti-folder-plus"></i>Nou Projecte</button>
          </div>
        </div>
        <div data-role="table-mount"></div>
      </div>
    `;
    container.querySelector('[data-role="search"]').addEventListener("input", e => { state.search = e.target.value; renderTable(); });
    container.querySelector('[data-action="create"]').addEventListener("click", openCreate);
  }

  function load() {
    state.loading = true; renderTable();
    apiFetch("/admin/projectes")
      .then(d => { state.rows = Array.isArray(d) ? d : (d.projectes ?? []); })
      .catch(() => adminToast("Error carregant projectes", "err"))
      .finally(() => { state.loading = false; renderTable(); });
  }

  function getFiltered() { return state.rows.filter(r => (r.titol ?? "").toLowerCase().includes(state.search.toLowerCase())); }

  function renderTable() {
    const countEl = container.querySelector('[data-role="count"]');
    if (countEl) countEl.textContent = state.rows.length;
    const mount = container.querySelector('[data-role="table-mount"]');
    if (!mount) return;
    if (state.loading) { mount.innerHTML = `<div class="adm-loading"><div class="adm-spin"></div><span>Carregant…</span></div>`; return; }

    const filtered = getFiltered();
    if (filtered.length === 0) {
      mount.innerHTML = emptyStateHtml("ti-folder-off", state.search ? "Sense resultats" : "Sense projectes", !state.search ? "Nou Projecte" : null);
      mount.querySelector('[data-action="empty-cta"]')?.addEventListener("click", openCreate);
      return;
    }

    mount.innerHTML = `
      <div class="adm-table-wrap">
        <table class="adm-table">
          <thead><tr>
            <th><i class="ti ti-text-size"></i>Títol</th>
            <th><i class="ti ti-tag"></i>Categoria</th>
            <th><i class="ti ti-activity"></i>Estat</th>
            <th><i class="ti ti-user"></i>Responsable</th>
            <th class="adm-th-actions">Accions</th>
          </tr></thead>
          <tbody>
            ${filtered.map((r, i) => `
              <tr data-idx="${i}">
                <td>
                  <div class="adm-td-main">
                    ${r.imatge ? `<img src="${r.imatge.startsWith("http") ? r.imatge : `${API}${r.imatge}`}" alt="" class="adm-td-img" />` : ""}
                    <div>
                      <span class="adm-td-title">${r.titol ?? ""}</span>
                      ${r.data_inici ? `<span class="adm-td-sub"><i class="ti ti-calendar"></i>${new Date(r.data_inici).toLocaleDateString("ca-ES")}</span>` : ""}
                    </div>
                  </div>
                </td>
                <td>${r.categoria ? `<span class="adm-badge">${r.categoria}</span>` : `<span class="adm-dash">—</span>`}</td>
                <td><span class="adm-badge adm-badge--estat adm-badge--${r.estat}"><span class="adm-badge-dot"></span>${r.estat ?? "—"}</span></td>
                <td>${r.responsable ? `<div class="adm-td-user"><div class="adm-td-avatar">${r.responsable.charAt(0).toUpperCase()}</div><span>${r.responsable}</span></div>` : `<span class="adm-dash">—</span>`}</td>
                <td>${rowActionsHtml({ edit: true, del: true })}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;

    mount.querySelectorAll("tr[data-idx]").forEach(tr => {
      const r = filtered[Number(tr.dataset.idx)];
      tr.querySelector('[data-row-action="edit"]')?.addEventListener("click", () => openEdit(r));
      tr.querySelector('[data-row-action="delete"]')?.addEventListener("click", () => showConfirm(`Vols eliminar "${r.titol}"?`, () => del(r._id ?? r.id)));
    });
  }

  async function del(id) {
    try { await apiFetch(`/admin/projectes/${id}`, { method: "DELETE" }); adminToast("Eliminat ✓", "ok"); load(); }
    catch { adminToast("Error eliminant", "err"); }
  }

  function openCreate() { openForm({ mode: "create" }, { ...BUIT_PROJ }); }
  function openEdit(r) { openForm({ mode: "edit", id: r._id ?? r.id }, { ...BUIT_PROJ, ...r }); }

  function openForm(modalInfo, form) {
    const { body, close } = openModal({
      title: modalInfo.mode === "create" ? "Nou Projecte" : "Editar Projecte",
      icon: modalInfo.mode === "create" ? "ti-folder-plus" : "ti-folder",
    });

    body.innerHTML = `
      <div class="adm-form-grid">
        ${fieldHtml("Títol", `<input class="${inpCls}" data-f="titol" placeholder="Nom del projecte" />`, { required: true })}
        ${fieldHtml("Categoria", `<input class="${inpCls}" data-f="categoria" placeholder="Tipus de projecte" />`)}
        ${fieldHtml("Estat", `<select class="${selCls}" data-f="estat">${ESTATS_PROJ.map(e => `<option value="${e}">${e.charAt(0).toUpperCase() + e.slice(1)}</option>`).join("")}</select>`)}
        ${fieldHtml("Responsable", `<input class="${inpCls}" data-f="responsable" placeholder="Nom del responsable" />`)}
        ${fieldHtml("Data inici", `<input type="date" class="${inpCls}" data-f="data_inici" />`)}
        ${fieldHtml("Data fi", `<input type="date" class="${inpCls}" data-f="data_fi" />`)}
        ${fieldHtml("Descripció", `<textarea class="${texCls}" rows="3" data-f="descripcio" placeholder="Descripció del projecte…"></textarea>`, { span: true })}
        <div data-role="imgpicker-mount"></div>
      </div>
      <div class="adm-modal__foot">
        <button class="adm-btn adm-btn--ghost" data-action="cancel"><i class="ti ti-x"></i>Cancel·lar</button>
        <button class="adm-btn adm-btn--primary" data-action="save"><i class="ti ti-device-floppy"></i>Desar canvis</button>
      </div>
    `;

    body.querySelectorAll("[data-f]").forEach(el => {
      el.value = form[el.dataset.f] ?? (el.tagName === "SELECT" ? ESTATS_PROJ[0] : "");
      el.addEventListener("input", () => { form[el.dataset.f] = el.value; updateSaveState(); });
    });

    mountImagePicker(body.querySelector('[data-role="imgpicker-mount"]'), {
      label: "Imatge", value: form.imatge, span: true, images: state.images,
      onChange: v => { form.imatge = v; },
    });

    const saveBtn = body.querySelector('[data-action="save"]');
    function updateSaveState() { saveBtn.disabled = !form.titol; }
    updateSaveState();

    body.querySelector('[data-action="cancel"]').addEventListener("click", close);
    saveBtn.addEventListener("click", async () => {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<div class="adm-spin adm-spin--sm"></div>Desant…`;
      try {
        if (modalInfo.mode === "create") await apiFetch("/admin/projectes", { method: "POST", body: JSON.stringify(form) });
        else await apiFetch(`/admin/projectes/${modalInfo.id}`, { method: "PUT", body: JSON.stringify(form) });
        adminToast("Projecte desat ✓", "ok");
        close(); load();
      } catch {
        adminToast("Error desant", "err");
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<i class="ti ti-device-floppy"></i>Desar canvis`;
      }
    });
  }

  buildShell();
  loadMediaImages(imgs => { state.images = imgs; });
  load();
}

// ════════════════════════════════════════════════════════════
// PUBLICACIONS
// ════════════════════════════════════════════════════════════
const BUIT_PUB = { titol: "", descripcio: "", contingut: "", categoria: "", estat: "esborrany", autor: "", imatge: "", tags: "", temps_lectura: "", data_publicacio: "", galeria_imatges: [] };
const ESTATS_PUB = ["esborrany", "publicat", "arxivat"];

function initPublicacions(container) {
  const state = { rows: [], loading: true, search: "", filterEstat: "", images: [] };

  function buildShell() {
    container.innerHTML = `
      <div class="adm-sec">
        <div class="adm-sec__head">
          <h2 class="adm-sec__title"><i class="ti ti-file-text"></i>Publicacions<span class="adm-sec__count" data-role="count"></span></h2>
          <div class="adm-sec__actions">
            <div class="adm-search-wrap"><i class="ti ti-search adm-search-icon"></i><input class="${inpCls} adm-search-inp" data-role="search" placeholder="Cerca per títol…" /></div>
            <select class="${selCls}" data-role="filter-estat">
              <option value="">Tots els estats</option>
              ${ESTATS_PUB.map(e => `<option value="${e}">${e.charAt(0).toUpperCase() + e.slice(1)}</option>`).join("")}
            </select>
            <button class="adm-btn adm-btn--primary" data-action="create"><i class="ti ti-file-plus"></i>Nova Publicació</button>
          </div>
        </div>
        <div data-role="table-mount"></div>
      </div>
    `;
    container.querySelector('[data-role="search"]').addEventListener("input", e => { state.search = e.target.value; renderTable(); });
    container.querySelector('[data-role="filter-estat"]').addEventListener("change", e => { state.filterEstat = e.target.value; renderTable(); });
    container.querySelector('[data-action="create"]').addEventListener("click", openCreate);
  }

  function load() {
    state.loading = true; renderTable();
    apiFetch("/publi")
      .then(d => { state.rows = Array.isArray(d) ? d : (d.publicacions ?? []); })
      .catch(() => adminToast("Error carregant publicacions", "err"))
      .finally(() => { state.loading = false; renderTable(); });
  }

  function getFiltered() {
    return state.rows
      .filter(r => !state.filterEstat || r.estat === state.filterEstat)
      .filter(r => (r.titol ?? "").toLowerCase().includes(state.search.toLowerCase()));
  }

  function renderTable() {
    const countEl = container.querySelector('[data-role="count"]');
    if (countEl) countEl.textContent = state.rows.length;
    const mount = container.querySelector('[data-role="table-mount"]');
    if (!mount) return;
    if (state.loading) { mount.innerHTML = `<div class="adm-loading"><div class="adm-spin"></div><span>Carregant…</span></div>`; return; }

    const filtered = getFiltered();
    if (filtered.length === 0) {
      mount.innerHTML = emptyStateHtml("ti-file-off", (state.search || state.filterEstat) ? "Sense resultats" : "Sense publicacions", (!state.search && !state.filterEstat) ? "Nova Publicació" : null);
      mount.querySelector('[data-action="empty-cta"]')?.addEventListener("click", openCreate);
      return;
    }

    mount.innerHTML = `
      <div class="adm-table-wrap">
        <table class="adm-table">
          <thead><tr>
            <th><i class="ti ti-text-size"></i>Títol</th>
            <th><i class="ti ti-tag"></i>Categoria</th>
            <th><i class="ti ti-activity"></i>Estat</th>
            <th><i class="ti ti-user"></i>Autor/a</th>
            <th><i class="ti ti-photo"></i>Imatges</th>
            <th><i class="ti ti-clock"></i>Lectura</th>
            <th class="adm-th-actions">Accions</th>
          </tr></thead>
          <tbody>
            ${filtered.map((r, i) => `
              <tr data-idx="${i}">
                <td>
                  <div class="adm-td-main">
                    ${r.imatge ? `<img src="${r.imatge.startsWith("http") ? r.imatge : `${API}${r.imatge}`}" alt="" class="adm-td-img" />` : ""}
                    <div>
                      <span class="adm-td-title">${r.titol ?? ""}</span>
                      ${r.descripcio ? `<span class="adm-td-sub">${r.descripcio.slice(0, 55)}${r.descripcio.length > 55 ? "…" : ""}</span>` : ""}
                    </div>
                  </div>
                </td>
                <td>${r.categoria ? `<span class="adm-badge">${r.categoria}</span>` : `<span class="adm-dash">—</span>`}</td>
                <td><span class="adm-badge adm-badge--estat adm-badge--${r.estat ?? "esborrany"}"><span class="adm-badge-dot"></span>${r.estat ?? "esborrany"}</span></td>
                <td>${r.autor ? `<div class="adm-td-user"><div class="adm-td-avatar">${r.autor.charAt(0).toUpperCase()}</div><span>${r.autor}</span></div>` : `<span class="adm-dash">—</span>`}</td>
                <td>${Array.isArray(r.galeria_imatges) && r.galeria_imatges.length > 0
                  ? `<div class="adm-td-galeria-mini">${r.galeria_imatges.slice(0, 3).map(img => `<img src="${(img.url || "").startsWith("http") ? img.url : `${API}${img.url}`}" alt="${img.alt || ""}" />`).join("")}${r.galeria_imatges.length > 3 ? `<span class="adm-td-galeria-more">+${r.galeria_imatges.length - 3}</span>` : ""}</div>`
                  : `<span class="adm-dash">—</span>`}</td>
                <td>${r.temps_lectura ? `<div class="adm-td-date"><i class="ti ti-clock"></i><span>${r.temps_lectura} min</span></div>` : `<span class="adm-dash">—</span>`}</td>
                <td>${rowActionsHtml({ edit: true, del: true })}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;

    mount.querySelectorAll("tr[data-idx]").forEach(tr => {
      const r = filtered[Number(tr.dataset.idx)];
      tr.querySelector('[data-row-action="edit"]')?.addEventListener("click", () => openEdit(r));
      tr.querySelector('[data-row-action="delete"]')?.addEventListener("click", () => showConfirm(`Vols eliminar "${r.titol}"?`, () => del(r._id ?? r.id)));
    });
  }

  async function del(id) {
    try { await apiFetch(`/admin/publi/${id}`, { method: "DELETE" }); adminToast("Eliminada ✓", "ok"); load(); }
    catch { adminToast("Error eliminant", "err"); }
  }

  function openCreate() { openForm({ mode: "create" }, { ...BUIT_PUB }); }
  function openEdit(r) {
    openForm({ mode: "edit", id: r._id ?? r.id }, {
      ...BUIT_PUB, ...r,
      tags: Array.isArray(r.tags) ? r.tags.join(", ") : (r.tags ?? ""),
      galeria_imatges: Array.isArray(r.galeria_imatges) ? [...r.galeria_imatges] : [],
      data_publicacio: r.data_publicacio ? String(r.data_publicacio).slice(0, 10) : "",
    });
  }

  function openForm(modalInfo, form) {
    const { body, close } = openModal({
      title: modalInfo.mode === "create" ? "Nova Publicació" : "Editar Publicació",
      icon: modalInfo.mode === "create" ? "ti-file-plus" : "ti-file-text",
      wide: true,
    });

    body.innerHTML = `
      <div class="adm-form-grid">
        ${fieldHtml("Títol", `<input class="${inpCls}" data-f="titol" placeholder="Títol de la publicació" />`, { required: true })}
        ${fieldHtml("Autor/a", `<input class="${inpCls}" data-f="autor" placeholder="Nom de l'autor/a" />`)}
        ${fieldHtml("Categoria", `<input class="${inpCls}" data-f="categoria" placeholder="Cultura, Tradicions…" />`)}
        ${fieldHtml("Data de publicació", `<input type="date" class="${inpCls}" data-f="data_publicacio" />`)}
        ${fieldHtml("Descripció", `<textarea class="${texCls}" rows="2" data-f="descripcio" placeholder="Breu descripció…"></textarea>`, { span: true })}
        ${fieldHtml("Estat", `<select class="${selCls}" data-f="estat">${ESTATS_PUB.map(e => `<option value="${e}">${e.charAt(0).toUpperCase() + e.slice(1)}</option>`).join("")}</select>`)}
        ${fieldHtml("Temps de lectura (min)", `<input type="number" min="1" class="${inpCls}" data-f="temps_lectura" placeholder="5" />`)}
        ${fieldHtml("Tags (separats per comes)", `<input class="${inpCls}" data-f="tags" placeholder="tradicio, festa, cultura" />`, { span: true })}
        <div data-role="imgpicker-mount"></div>
        <div data-role="galeria-mount"></div>
        ${fieldHtml("Contingut (HTML)", `<textarea class="${texCls}" rows="8" data-f="contingut" placeholder="<p>Contingut HTML…</p>"></textarea>`, { span: true })}
      </div>
      <div class="adm-modal__foot">
        <button class="adm-btn adm-btn--ghost" data-action="cancel"><i class="ti ti-x"></i>Cancel·lar</button>
        <button class="adm-btn adm-btn--primary" data-action="save"><i class="ti ti-device-floppy"></i>Desar canvis</button>
      </div>
    `;

    body.querySelectorAll("[data-f]").forEach(el => {
      el.value = form[el.dataset.f] ?? (el.tagName === "SELECT" ? ESTATS_PUB[0] : "");
      el.addEventListener("input", () => { form[el.dataset.f] = el.value; updateSaveState(); });
    });

    mountImagePicker(body.querySelector('[data-role="imgpicker-mount"]'), {
      label: "Imatge principal", value: form.imatge, span: true, images: state.images,
      onChange: v => { form.imatge = v; },
    });
    mountGaleriaPicker(body.querySelector('[data-role="galeria-mount"]'), {
      images: state.images, value: form.galeria_imatges,
      onChange: v => { form.galeria_imatges = v; },
    });

    const saveBtn = body.querySelector('[data-action="save"]');
    function updateSaveState() { saveBtn.disabled = !form.titol; }
    updateSaveState();

    body.querySelector('[data-action="cancel"]').addEventListener("click", close);
    saveBtn.addEventListener("click", async () => {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<div class="adm-spin adm-spin--sm"></div>Desant…`;
      const payload = {
        ...form,
        tags: typeof form.tags === "string" ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        galeria_imatges: form.galeria_imatges ?? [],
      };
      try {
        await apiFetch(modalInfo.mode === "create" ? "/admin/publi" : `/admin/publi/${modalInfo.id}`, {
          method: modalInfo.mode === "create" ? "POST" : "PUT", body: JSON.stringify(payload),
        });
        adminToast("Publicació desada ✓", "ok");
        close(); load();
      } catch {
        adminToast("Error desant", "err");
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<i class="ti ti-device-floppy"></i>Desar canvis`;
      }
    });
  }

  buildShell();
  loadMediaImages(imgs => { state.images = imgs; });
  load();
}

// ════════════════════════════════════════════════════════════
// RESSENYES
// ════════════════════════════════════════════════════════════
function initRessenyes(container) {
  const state = { rows: [], loading: true, search: "", filterStar: 0 };

  function buildShell() {
    container.innerHTML = `
      <div class="adm-sec">
        <div class="adm-sec__head">
          <h2 class="adm-sec__title"><i class="ti ti-message-star"></i>Ressenyes<span class="adm-sec__count" data-role="count"></span><span class="adm-sec__avg" data-role="avg" style="display:none;"></span></h2>
          <div class="adm-sec__actions">
            <div class="adm-search-wrap"><i class="ti ti-search adm-search-icon"></i><input class="${inpCls} adm-search-inp" data-role="search" placeholder="Cerca per autor o text…" /></div>
            <select class="${selCls}" data-role="filter-star">
              <option value="0">Totes les estrelles</option>
              ${[5, 4, 3, 2, 1].map(n => `<option value="${n}">${"★".repeat(n)} (${n} estrella${n > 1 ? "es" : ""})</option>`).join("")}
            </select>
          </div>
        </div>
        <div data-role="table-mount"></div>
      </div>
    `;
    container.querySelector('[data-role="search"]').addEventListener("input", e => { state.search = e.target.value; renderTable(); });
    container.querySelector('[data-role="filter-star"]').addEventListener("change", e => { state.filterStar = Number(e.target.value); renderTable(); });
  }

  function load() {
    state.loading = true; renderTable();
    apiFetch("/resenas")
      .then(data => { state.rows = Array.isArray(data) ? data : (data.resenas ?? data["reseñas"] ?? []); })
      .catch(() => adminToast("Error carregant ressenyes", "err"))
      .finally(() => { state.loading = false; renderTable(); });
  }

  function getFiltered() {
    return state.rows
      .filter(r => state.filterStar === 0 || r.rating === state.filterStar)
      .filter(r => [(r.text ?? ""), (r.autor ?? ""), (r.username ?? "")].join(" ").toLowerCase().includes(state.search.toLowerCase()));
  }

  function renderTable() {
    const countEl = container.querySelector('[data-role="count"]');
    if (countEl) countEl.textContent = state.rows.length;
    const avgEl = container.querySelector('[data-role="avg"]');
    if (avgEl) {
      if (state.rows.length) {
        const avg = (state.rows.reduce((a, r) => a + (r.rating || 0), 0) / state.rows.length).toFixed(1);
        avgEl.style.display = ""; avgEl.innerHTML = `<i class="ti ti-star-filled"></i>${avg} avg`;
      } else avgEl.style.display = "none";
    }
    const mount = container.querySelector('[data-role="table-mount"]');
    if (!mount) return;
    if (state.loading) { mount.innerHTML = `<div class="adm-loading"><div class="adm-spin"></div><span>Carregant…</span></div>`; return; }

    const filtered = getFiltered();
    if (filtered.length === 0) {
      mount.innerHTML = emptyStateHtml("ti-message-off", (state.search || state.filterStar) ? "Sense resultats" : "Sense ressenyes");
      return;
    }

    mount.innerHTML = `
      <div class="adm-table-wrap">
        <table class="adm-table">
          <thead><tr>
            <th><i class="ti ti-user"></i>Autor/a</th>
            <th><i class="ti ti-star"></i>Valoració</th>
            <th><i class="ti ti-message"></i>Text</th>
            <th><i class="ti ti-calendar"></i>Data</th>
            <th class="adm-th-actions">Accions</th>
          </tr></thead>
          <tbody>
            ${filtered.map((r, i) => `
              <tr data-idx="${i}">
                <td>
                  <div class="adm-td-user">
                    <div class="adm-td-avatar">${(r.autor ?? r.username ?? "U").charAt(0).toUpperCase()}</div>
                    <div>
                      <span class="adm-td-title">${r.autor ?? r.username ?? "—"}</span>
                      ${(r.publicacio_id ?? r.publicacioId) ? `<span class="adm-td-sub"><i class="ti ti-file-text"></i>Pub. #${r.publicacio_id ?? r.publicacioId}</span>` : ""}
                    </div>
                  </div>
                </td>
                <td>${starsHtml(r.rating)}</td>
                <td class="adm-td-trunc adm-td-muted">${r.text ?? ""}</td>
                <td><div class="adm-td-date"><i class="ti ti-calendar"></i><span>${(r.data_creacio ?? r.data ?? r.createdAt) ? new Date(r.data_creacio ?? r.data ?? r.createdAt).toLocaleDateString("ca-ES") : "—"}</span></div></td>
                <td>${rowActionsHtml({ view: true, del: true })}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;

    mount.querySelectorAll("tr[data-idx]").forEach(tr => {
      const r = filtered[Number(tr.dataset.idx)];
      tr.querySelector('[data-row-action="view"]')?.addEventListener("click", () => openDetail(r));
      tr.querySelector('[data-row-action="delete"]')?.addEventListener("click", () =>
        showConfirm(`Vols eliminar la ressenya de ${r.autor ?? r.username ?? "usuari"}?`, () => del(r._id ?? r.id)));
    });
  }

  async function del(id) {
    try { await apiFetch(`/admin/resenas/${id}`, { method: "DELETE" }); adminToast("Ressenya eliminada ✓", "ok"); load(); }
    catch { adminToast("Error eliminant", "err"); }
  }

  function openDetail(r) {
    const { body, close } = openModal({ title: "Detall de la ressenya", icon: "ti-message-star" });
    body.innerHTML = `
      <div class="adm-detail-block">
        <div class="adm-detail-row"><span class="adm-detail-lbl">Autor/a</span><div class="adm-td-user"><div class="adm-td-avatar">${(r.autor ?? r.username ?? "U").charAt(0).toUpperCase()}</div><strong>${r.autor ?? r.username ?? "—"}</strong></div></div>
        <div class="adm-detail-row"><span class="adm-detail-lbl">Valoració</span><div>${starsHtml(r.rating, true)}<span class="adm-td-sub">${r.rating}/5 estrelles</span></div></div>
        <div class="adm-detail-row"><span class="adm-detail-lbl">Publicació</span><strong>#${r.publicacio_id ?? r.publicacioId ?? "—"}</strong></div>
        <div class="adm-detail-row"><span class="adm-detail-lbl">Data</span><strong>${(r.data ?? r.data_creacio ?? r.createdAt) ? new Date(r.data ?? r.data_creacio ?? r.createdAt).toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" }) : "—"}</strong></div>
        ${r.text ? `<div class="adm-detail-row adm-detail-row--full"><span class="adm-detail-lbl">Text</span><p class="adm-detail-text">"${r.text}"</p></div>` : ""}
      </div>
      <div class="adm-modal__foot">
        <button class="adm-btn adm-btn--ghost" data-action="close"><i class="ti ti-x"></i>Tancar</button>
        <button class="adm-btn adm-btn--danger" data-action="delete"><i class="ti ti-trash"></i>Eliminar ressenya</button>
      </div>
    `;
    body.querySelector('[data-action="close"]').addEventListener("click", close);
    body.querySelector('[data-action="delete"]').addEventListener("click", () => {
      close();
      showConfirm(`Vols eliminar la ressenya de ${r.autor ?? r.username ?? "usuari"}?`, () => del(r._id ?? r.id));
    });
  }

  buildShell();
  load();
}

// ════════════════════════════════════════════════════════════
// SOL·LICITUDS
// ════════════════════════════════════════════════════════════
const ESTATS_SOL = ["pendent", "acceptat", "rebutjat"];
const ESTAT_ICON = { pendent: "ti-clock", acceptat: "ti-circle-check", rebutjat: "ti-circle-x" };

function initSolicituds(container) {
  const state = { rows: [], loading: true, search: "", filterEstat: "" };

  function buildShell() {
    container.innerHTML = `
      <div class="adm-sec">
        <div class="adm-sec__head">
          <h2 class="adm-sec__title"><i class="ti ti-users"></i>Sol·licituds<span class="adm-sec__count" data-role="count"></span></h2>
          <div class="adm-sec__actions">
            <div class="adm-search-wrap"><i class="ti ti-search adm-search-icon"></i><input class="${inpCls} adm-search-inp" data-role="search" placeholder="Cerca per nom o email…" /></div>
            <select class="${selCls}" data-role="filter-estat">
              <option value="">Tots</option>
              ${ESTATS_SOL.map(e => `<option value="${e}">${e.charAt(0).toUpperCase() + e.slice(1)}</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="adm-sol-stats" data-role="stats"></div>
        <div data-role="table-mount"></div>
      </div>
    `;
    container.querySelector('[data-role="search"]').addEventListener("input", e => { state.search = e.target.value; renderTable(); });
    container.querySelector('[data-role="filter-estat"]').addEventListener("change", e => { state.filterEstat = e.target.value; renderTable(); });
  }

  function load() {
    state.loading = true; renderTable();
    apiFetch("/solicituds")
      .then(d => { state.rows = Array.isArray(d) ? d : (d.solicituts ?? d.solicituds ?? []); })
      .catch(() => adminToast("Error carregant sol·licituds", "err"))
      .finally(() => { state.loading = false; renderTable(); });
  }

  function getFiltered() {
    return state.rows
      .filter(r => (!state.filterEstat || (r.estat ?? "pendent") === state.filterEstat))
      .filter(r => [(r.nom ?? ""), (r.email ?? ""), (r.telefon ?? "")].join(" ").toLowerCase().includes(state.search.toLowerCase()));
  }

  async function updateEstat(id, estat) {
    try { await apiFetch(`/admin/solicituds/${id}`, { method: "PATCH", body: JSON.stringify({ estat }) }); adminToast(`Estat canviat a "${estat}" ✓`, "ok"); load(); }
    catch { adminToast("Error actualitzant estat", "err"); }
  }

  async function del(id) {
    try { await apiFetch(`/admin/solicituds/${id}`, { method: "DELETE" }); adminToast("Sol·licitud eliminada ✓", "ok"); load(); }
    catch { adminToast("Error eliminant", "err"); }
  }

  function renderTable() {
    const countEl = container.querySelector('[data-role="count"]');
    if (countEl) countEl.textContent = state.rows.length;

    const counts = ESTATS_SOL.reduce((acc, e) => ({ ...acc, [e]: state.rows.filter(r => (r.estat ?? "pendent") === e).length }), {});
    const statsEl = container.querySelector('[data-role="stats"]');
    if (statsEl) {
      statsEl.innerHTML = ESTATS_SOL.map(e => `
        <button class="adm-sol-stat adm-sol-stat--${e}${state.filterEstat === e ? " adm-sol-stat--active" : ""}" data-stat="${e}">
          <i class="ti ${ESTAT_ICON[e]}"></i><span class="adm-sol-stat__num">${counts[e] ?? 0}</span>
          <span class="adm-sol-stat__lbl">${e.charAt(0).toUpperCase() + e.slice(1)}</span>
        </button>
      `).join("");
      statsEl.querySelectorAll("[data-stat]").forEach(btn => {
        btn.addEventListener("click", () => {
          state.filterEstat = state.filterEstat === btn.dataset.stat ? "" : btn.dataset.stat;
          container.querySelector('[data-role="filter-estat"]').value = state.filterEstat;
          renderTable();
        });
      });
    }

    const mount = container.querySelector('[data-role="table-mount"]');
    if (!mount) return;
    if (state.loading) { mount.innerHTML = `<div class="adm-loading"><div class="adm-spin"></div><span>Carregant…</span></div>`; return; }

    const filtered = getFiltered();
    if (filtered.length === 0) {
      mount.innerHTML = emptyStateHtml("ti-user-off", (state.search || state.filterEstat) ? "Sense resultats per al filtre" : "Sense sol·licituds");
      return;
    }

    mount.innerHTML = `
      <div class="adm-table-wrap">
        <table class="adm-table">
          <thead><tr>
            <th><i class="ti ti-user"></i>Persona</th>
            <th><i class="ti ti-mail"></i>Email</th>
            <th><i class="ti ti-phone"></i>Telèfon</th>
            <th><i class="ti ti-activity"></i>Estat</th>
            <th><i class="ti ti-calendar"></i>Data</th>
            <th class="adm-th-actions">Accions</th>
          </tr></thead>
          <tbody>
            ${filtered.map((r, i) => `
              <tr data-idx="${i}">
                <td><div class="adm-td-user"><div class="adm-td-avatar">${(r.nom ?? r.name ?? "?").charAt(0).toUpperCase()}</div><span class="adm-td-title">${r.nom ?? r.name ?? "—"}</span></div></td>
                <td>${r.email ? `<a href="mailto:${r.email}" class="adm-td-link"><i class="ti ti-mail"></i>${r.email}</a>` : `<span class="adm-dash">—</span>`}</td>
                <td class="adm-td-muted">${r.telefon ?? r.phone ?? "—"}</td>
                <td><select class="adm-sel adm-sel--inline adm-sel--${r.estat ?? "pendent"}" data-role="estat-select">${ESTATS_SOL.map(e => `<option value="${e}" ${(r.estat ?? "pendent") === e ? "selected" : ""}>${e.charAt(0).toUpperCase() + e.slice(1)}</option>`).join("")}</select></td>
                <td><div class="adm-td-date"><i class="ti ti-calendar"></i><span>${(r.data_creacio ?? r.createdAt) ? new Date(r.data_creacio ?? r.createdAt).toLocaleDateString("ca-ES") : "—"}</span></div></td>
                <td>${rowActionsHtml({ view: true, del: true })}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;

    mount.querySelectorAll("tr[data-idx]").forEach(tr => {
      const r = filtered[Number(tr.dataset.idx)];
      const id = r._id ?? r.id;
      tr.querySelector('[data-role="estat-select"]').addEventListener("change", e => updateEstat(id, e.target.value));
      tr.querySelector('[data-row-action="view"]')?.addEventListener("click", () => openDetail(r));
      tr.querySelector('[data-row-action="delete"]')?.addEventListener("click", () => showConfirm(`Vols eliminar la sol·licitud de "${r.nom ?? r.name ?? "usuari"}"?`, () => del(id)));
    });
  }

  function openDetail(r) {
    const { body, close } = openModal({ title: "Detall sol·licitud", icon: "ti-user-check" });
    const rows = [
      ["Nom", r.nom ?? r.name], ["Email", r.email], ["Telèfon", r.telefon ?? r.phone],
      ["Assumpte", r.assumpte], ["Estat", r.estat ?? "pendent"],
      ["Data", (r.data_creacio ?? r.createdAt) ? new Date(r.data_creacio ?? r.createdAt).toLocaleDateString("ca-ES") : null],
    ].filter(([, v]) => v);

    body.innerHTML = `
      <div class="adm-detail-block">
        ${rows.map(([k, v]) => `
          <div class="adm-detail-row">
            <span class="adm-detail-lbl">${k}</span>
            <strong class="${k === "Estat" ? `adm-estat-text adm-estat-text--${v}` : ""}">${v}</strong>
          </div>
        `).join("")}
        ${(r.missatge ?? r.motivacio ?? r.message) ? `
          <div class="adm-detail-row adm-detail-row--full">
            <span class="adm-detail-lbl">Missatge</span>
            <p class="adm-detail-text">"${r.missatge ?? r.motivacio ?? r.message}"</p>
          </div>` : ""}
      </div>
      <div class="adm-modal__foot">
        <button class="adm-btn adm-btn--ghost" data-action="close"><i class="ti ti-x"></i>Tancar</button>
        ${r.email ? `<a href="mailto:${r.email}" class="adm-btn adm-btn--ghost"><i class="ti ti-mail"></i>Contactar</a>` : ""}
      </div>
    `;
    body.querySelector('[data-action="close"]').addEventListener("click", close);
  }

  buildShell();
  load();
}

// ════════════════════════════════════════════════════════════
// USUARIS
// ════════════════════════════════════════════════════════════
const ROLS_USER = ["usuario", "admin"];
const BUIT_USER = { nom: "", username: "", email: "", password: "", descripcion: "", avatar: "", banner: "", telefono: "", ubicacion: "", fechaNacimiento: "", rol: "usuario", verificado: false, activo: true };

function initUsuaris(container) {
  const state = { rows: [], loading: true, search: "", filterRol: "", filterActiu: "" };

  function buildShell() {
    container.innerHTML = `
      <div class="adm-sec">
        <div class="adm-sec__head">
          <h2 class="adm-sec__title"><i class="ti ti-users-group"></i>Usuaris<span class="adm-sec__count" data-role="count"></span><span class="adm-sec__avg" data-role="avg" style="display:none;"></span></h2>
          <div class="adm-sec__actions">
            <div class="adm-search-wrap"><i class="ti ti-search adm-search-icon"></i><input class="${inpCls} adm-search-inp" data-role="search" placeholder="Cerca per nom, username o email…" /></div>
            <select class="${selCls}" data-role="filter-rol">
              <option value="">Tots els rols</option>
              ${ROLS_USER.map(r => `<option value="${r}">${r.charAt(0).toUpperCase() + r.slice(1)}</option>`).join("")}
            </select>
            <select class="${selCls}" data-role="filter-actiu">
              <option value="">Tots</option><option value="true">Actius</option><option value="false">Inactius</option>
            </select>
            <button class="adm-btn adm-btn--primary" data-action="create"><i class="ti ti-user-plus"></i>Nou Usuari</button>
          </div>
        </div>
        <div class="adm-sol-stats" data-role="stats"></div>
        <div data-role="table-mount"></div>
      </div>
    `;
    container.querySelector('[data-role="search"]').addEventListener("input", e => { state.search = e.target.value; renderTable(); });
    container.querySelector('[data-role="filter-rol"]').addEventListener("change", e => { state.filterRol = e.target.value; renderTable(); });
    container.querySelector('[data-role="filter-actiu"]').addEventListener("change", e => { state.filterActiu = e.target.value; renderTable(); });
    container.querySelector('[data-action="create"]').addEventListener("click", openCreate);
  }

  function load() {
    state.loading = true; renderTable();
    apiFetch("/admin/users")
      .then(d => { state.rows = Array.isArray(d) ? d : (d.users ?? []); })
      .catch(() => adminToast("Error carregant usuaris", "err"))
      .finally(() => { state.loading = false; renderTable(); });
  }

  function getFiltered() {
    return state.rows
      .filter(r => !state.filterRol || r.rol === state.filterRol)
      .filter(r => state.filterActiu === "" || String(r.activo) === state.filterActiu)
      .filter(r => [r.nom ?? "", r.email ?? "", r.username ?? ""].join(" ").toLowerCase().includes(state.search.toLowerCase()));
  }

  const rolIcon = r => r === "admin" ? "ti-shield-check" : "ti-user";
  const rolClass = r => `adm-badge adm-badge--rol-${r ?? "usuario"}`;

  function renderTable() {
    const countEl = container.querySelector('[data-role="count"]');
    if (countEl) countEl.textContent = state.rows.length;

    const totalAdmins = state.rows.filter(r => r.rol === "admin").length;
    const totalActius = state.rows.filter(r => r.activo).length;
    const totalVerif = state.rows.filter(r => r.verificado).length;

    const avgEl = container.querySelector('[data-role="avg"]');
    if (avgEl) { avgEl.style.display = totalAdmins > 0 ? "" : "none"; avgEl.innerHTML = `<i class="ti ti-shield-check"></i>${totalAdmins} admin`; }

    const statsEl = container.querySelector('[data-role="stats"]');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="adm-sol-stat adm-sol-stat--acceptat"><i class="ti ti-user-check"></i><span class="adm-sol-stat__num">${totalActius}</span><span class="adm-sol-stat__lbl">Actius</span></div>
        <div class="adm-sol-stat adm-sol-stat--rebutjat"><i class="ti ti-user-off"></i><span class="adm-sol-stat__num">${state.rows.length - totalActius}</span><span class="adm-sol-stat__lbl">Inactius</span></div>
        <div class="adm-sol-stat adm-sol-stat--pendent"><i class="ti ti-shield-check"></i><span class="adm-sol-stat__num">${totalAdmins}</span><span class="adm-sol-stat__lbl">Administradors</span></div>
        <div class="adm-sol-stat adm-sol-stat--pendent"><i class="ti ti-circle-check"></i><span class="adm-sol-stat__num">${totalVerif}</span><span class="adm-sol-stat__lbl">Verificats</span></div>
      `;
    }

    const mount = container.querySelector('[data-role="table-mount"]');
    if (!mount) return;
    if (state.loading) { mount.innerHTML = `<div class="adm-loading"><div class="adm-spin"></div><span>Carregant…</span></div>`; return; }

    const filtered = getFiltered();
    if (filtered.length === 0) {
      mount.innerHTML = emptyStateHtml(
        (state.search || state.filterRol || state.filterActiu) ? "ti-user-search" : "ti-users",
        (state.search || state.filterRol || state.filterActiu) ? "Sense resultats per al filtre" : "Sense usuaris",
        (!state.search && !state.filterRol && state.filterActiu === "") ? "Nou Usuari" : null
      );
      mount.querySelector('[data-action="empty-cta"]')?.addEventListener("click", openCreate);
      return;
    }

    mount.innerHTML = `
      <div class="adm-table-wrap">
        <table class="adm-table">
          <thead><tr>
            <th><i class="ti ti-user"></i>Usuari</th>
            <th><i class="ti ti-at"></i>Username</th>
            <th><i class="ti ti-mail"></i>Email</th>
            <th><i class="ti ti-shield"></i>Rol</th>
            <th><i class="ti ti-activity"></i>Estat</th>
            <th><i class="ti ti-circle-check"></i>Verificat</th>
            <th><i class="ti ti-calendar"></i>Registre</th>
            <th class="adm-th-actions">Accions</th>
          </tr></thead>
          <tbody>
            ${filtered.map((r, i) => {
              const inicial = (r.nom ?? r.email ?? "?").charAt(0).toUpperCase();
              return `
                <tr data-idx="${i}">
                  <td>
                    <div class="adm-td-user">
                      ${r.avatar && !r.avatar.includes("default") ? `<img src="${r.avatar}" alt="${r.nom}" class="adm-td-avatar-img" />` : `<div class="adm-td-avatar">${inicial}</div>`}
                      <div><span class="adm-td-title">${r.nom ?? "—"}</span>${r.ubicacion ? `<span class="adm-td-sub"><i class="ti ti-map-pin"></i>${r.ubicacion}</span>` : ""}</div>
                    </div>
                  </td>
                  <td>${r.username ? `<span class="adm-td-username">@${r.username}</span>` : `<span class="adm-dash">—</span>`}</td>
                  <td>${r.email ? `<a href="mailto:${r.email}" class="adm-td-link"><i class="ti ti-mail"></i>${r.email}</a>` : `<span class="adm-dash">—</span>`}</td>
                  <td><span class="${rolClass(r.rol)}"><i class="ti ${rolIcon(r.rol)}"></i>${r.rol ?? "usuario"}</span></td>
                  <td><span class="adm-status-dot adm-status-dot--${r.activo ? "actiu" : "inactiu"}">${r.activo ? "Actiu" : "Inactiu"}</span></td>
                  <td>${r.verificado ? `<span class="adm-verif adm-verif--ok"><i class="ti ti-circle-check"></i>Sí</span>` : `<span class="adm-verif adm-verif--no"><i class="ti ti-circle-x"></i>No</span>`}</td>
                  <td><div class="adm-td-date"><i class="ti ti-calendar"></i><span>${r.createdAt ? new Date(r.createdAt).toLocaleDateString("ca-ES") : "—"}</span></div></td>
                  <td>${rowActionsHtml({ view: true, edit: true, del: true })}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;

    mount.querySelectorAll("tr[data-idx]").forEach(tr => {
      const r = filtered[Number(tr.dataset.idx)];
      tr.querySelector('[data-row-action="view"]')?.addEventListener("click", () => openDetail(r));
      tr.querySelector('[data-row-action="edit"]')?.addEventListener("click", () => openEdit(r));
      tr.querySelector('[data-row-action="delete"]')?.addEventListener("click", () => showConfirm(`Vols eliminar l'usuari "${r.nom ?? r.email}"?`, () => del(r._id ?? r.id)));
    });
  }

  async function del(id) {
    try { await apiFetch(`/admin/users/${id}`, { method: "DELETE" }); adminToast("Usuari eliminat ✓", "ok"); load(); }
    catch { adminToast("Error eliminant", "err"); }
  }

  function openCreate() { openForm({ mode: "create" }, { ...BUIT_USER }); }
  function openEdit(r) { openForm({ mode: "edit", id: r._id ?? r.id }, { ...BUIT_USER, ...r, password: "", fechaNacimiento: r.fechaNacimiento ? String(r.fechaNacimiento).slice(0, 10) : "" }); }

  function openForm(modalInfo, form) {
    const { body, close } = openModal({
      title: modalInfo.mode === "create" ? "Nou Usuari" : "Editar Usuari",
      icon: modalInfo.mode === "create" ? "ti-user-plus" : "ti-user-edit",
      wide: true,
    });

    let tab = "basic";
    let showPwd = false;

    body.innerHTML = `
      <div class="adm-modal-tabs" data-role="tabs">
        <button type="button" class="adm-modal-tab" data-tab="basic"><i class="ti ti-user"></i>Dades bàsiques</button>
        <button type="button" class="adm-modal-tab" data-tab="profile"><i class="ti ti-id-badge"></i>Perfil</button>
        <button type="button" class="adm-modal-tab" data-tab="perms"><i class="ti ti-shield"></i>Permisos</button>
      </div>
      <div class="adm-form-grid" data-role="tab-content" style="margin-top:16px;"></div>
      <div class="adm-modal__foot">
        <button class="adm-btn adm-btn--ghost" data-action="cancel"><i class="ti ti-x"></i>Cancel·lar</button>
        <button class="adm-btn adm-btn--primary" data-action="save"><i class="ti ti-device-floppy"></i>Desar canvis</button>
      </div>
    `;

    const tabContent = body.querySelector('[data-role="tab-content"]');
    const saveBtn = body.querySelector('[data-action="save"]');

    function renderTabButtons() {
      body.querySelectorAll("[data-tab]").forEach(btn => btn.classList.toggle("adm-modal-tab--active", btn.dataset.tab === tab));
    }
    body.querySelectorAll("[data-tab]").forEach(btn => btn.addEventListener("click", () => { tab = btn.dataset.tab; renderTabButtons(); renderTab(); }));

    function renderTab() {
      if (tab === "basic") {
        tabContent.innerHTML = `
          ${fieldHtml("Nom complet", `<input class="${inpCls}" data-f="nom" placeholder="Maria Garcia" />`, { required: true })}
          ${fieldHtml("Username", `<input class="${inpCls}" data-f="username" placeholder="mariagarcia" />`)}
          ${fieldHtml("Email", `<input type="email" class="${inpCls}" data-f="email" placeholder="maria@exemple.cat" />`, { required: true })}
          ${fieldHtml(modalInfo.mode === "create" ? "Contrasenya *" : "Nova contrasenya (opcional)", `
            <div class="adm-pwd-wrap">
              <input type="${showPwd ? "text" : "password"}" class="${inpCls}" data-f="password" placeholder="${modalInfo.mode === "edit" ? "Deixa buit per no canviar…" : "Mínim 6 caràcters"}" autocomplete="new-password" />
              <button type="button" class="adm-pwd-toggle" data-action="toggle-pwd"><i class="ti ${showPwd ? "ti-eye-off" : "ti-eye"}"></i></button>
            </div>
          `)}
          ${fieldHtml("Telèfon", `<input class="${inpCls}" data-f="telefono" placeholder="+34 600 000 000" />`)}
          ${fieldHtml("Ubicació", `<input class="${inpCls}" data-f="ubicacion" placeholder="Mataró, Catalunya" />`)}
          ${fieldHtml("Data de naixement", `<input type="date" class="${inpCls}" data-f="fechaNacimiento" />`)}
        `;
        tabContent.querySelector('[data-action="toggle-pwd"]')?.addEventListener("click", () => { showPwd = !showPwd; renderTab(); });
      } else if (tab === "profile") {
        tabContent.innerHTML = `
          ${fieldHtml("Descripció", `<textarea class="${texCls}" rows="3" maxlength="300" data-f="descripcion" placeholder="Descripció de l'usuari…"></textarea>`, { span: true })}
          ${fieldHtml("Avatar (URL)", `
            <input class="${inpCls}" data-f="avatar" placeholder="https://…/avatar.jpg" />
            ${form.avatar && !form.avatar.includes("default") ? `<div class="adm-user-avatar-preview"><img src="${form.avatar}" alt="avatar preview" /></div>` : ""}
          `, { span: true })}
          ${fieldHtml("Banner (URL)", `
            <input class="${inpCls}" data-f="banner" placeholder="https://…/banner.jpg" />
            ${form.banner && !form.banner.includes("default") ? `<div class="adm-user-banner-preview"><img src="${form.banner}" alt="banner preview" /></div>` : ""}
          `, { span: true })}
        `;
      } else if (tab === "perms") {
        tabContent.innerHTML = `
          ${fieldHtml("Rol", `<select class="${selCls}" data-f="rol">${ROLS_USER.map(r => `<option value="${r}">${r.charAt(0).toUpperCase() + r.slice(1)}</option>`).join("")}</select>`)}
          ${fieldHtml("Estat", `<select class="${selCls}" data-f="activo"><option value="true">Actiu</option><option value="false">Inactiu</option></select>`)}
          ${fieldHtml("Verificat", `
            <div class="adm-toggle-row">
              <label class="adm-toggle">
                <input type="checkbox" data-f="verificado" ${form.verificado ? "checked" : ""} />
                <span class="adm-toggle__track"></span>
                <span class="adm-toggle__lbl">${form.verificado ? "Compte verificat" : "Compte no verificat"}</span>
              </label>
            </div>
          `, { span: true })}
          <div class="adm-field adm-field--span">
            <div class="adm-notice"><i class="ti ti-info-circle"></i><div><strong>Rols disponibles:</strong> <code>usuario</code> per a usuaris normals, <code>admin</code> per a administradors amb accés al panell.</div></div>
          </div>
        `;
      }

      tabContent.querySelectorAll("[data-f]").forEach(el => {
        if (el.type === "checkbox") {
          el.checked = !!form[el.dataset.f];
          el.addEventListener("change", () => {
            form[el.dataset.f] = el.checked;
            const lbl = el.closest(".adm-toggle")?.querySelector(".adm-toggle__lbl");
            if (lbl) lbl.textContent = el.checked ? "Compte verificat" : "Compte no verificat";
          });
        } else {
          el.value = form[el.dataset.f] ?? (el.dataset.f === "activo" ? "true" : "");
          el.addEventListener("input", () => { form[el.dataset.f] = el.value; updateSaveState(); });
        }
      });
    }

    function updateSaveState() { saveBtn.disabled = !form.nom?.trim() || !form.email?.trim(); }

    renderTabButtons();
    renderTab();
    updateSaveState();

    body.querySelector('[data-action="cancel"]').addEventListener("click", close);
    saveBtn.addEventListener("click", async () => {
      if (!form.nom?.trim() || !form.email?.trim()) { adminToast("Nom i email són obligatoris", "err"); return; }
      if (modalInfo.mode === "create" && !form.password?.trim()) { adminToast("La contrasenya és obligatòria", "err"); return; }
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<div class="adm-spin adm-spin--sm"></div>Desant…`;
      const payload = { ...form, activo: form.activo === true || form.activo === "true" };
      if (modalInfo.mode === "edit" && !payload.password) delete payload.password;
      try {
        if (modalInfo.mode === "create") await apiFetch("/admin/users", { method: "POST", body: JSON.stringify(payload) });
        else await apiFetch(`/admin/users/${modalInfo.id}`, { method: "PUT", body: JSON.stringify(payload) });
        adminToast(modalInfo.mode === "create" ? "Usuari creat ✓" : "Usuari actualitzat ✓", "ok");
        close(); load();
      } catch (err) {
        adminToast(err?.message ?? "Error desant", "err");
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<i class="ti ti-device-floppy"></i>Desar canvis`;
      }
    });
  }

  function openDetail(r) {
    const { body, close } = openModal({ title: "Perfil d'usuari", icon: "ti-user", wide: true });
    body.innerHTML = `
      <div class="adm-user-detail-head">
        ${r.banner && !r.banner.includes("default") ? `<div class="adm-user-detail-banner"><img src="${r.banner}" alt="banner" /></div>` : ""}
        <div class="adm-user-detail-meta">
          ${r.avatar && !r.avatar.includes("default") ? `<img src="${r.avatar}" alt="${r.nom}" class="adm-user-detail-avatar" />` : `<div class="adm-user-avatar-lg">${(r.nom ?? r.email ?? "?").charAt(0).toUpperCase()}</div>`}
          <div class="adm-user-detail-info">
            <div class="adm-user-detail-name">${r.nom ?? "—"}</div>
            ${r.username ? `<div class="adm-user-detail-username">@${r.username}</div>` : ""}
            <div class="adm-user-detail-badges">
              <span class="${rolClass(r.rol)}"><i class="ti ${rolIcon(r.rol)}"></i>${r.rol ?? "usuario"}</span>
              <span class="adm-status-dot adm-status-dot--${r.activo ? "actiu" : "inactiu"}">${r.activo ? "Actiu" : "Inactiu"}</span>
              ${r.verificado ? `<span class="adm-verif adm-verif--ok"><i class="ti ti-circle-check"></i>Verificat</span>` : ""}
            </div>
          </div>
        </div>
      </div>
      <div class="adm-detail-block" style="margin-top:16px;">
        <div class="adm-detail-row"><span class="adm-detail-lbl">Email</span><a href="mailto:${r.email}" class="adm-td-link"><i class="ti ti-mail"></i>${r.email ?? "—"}</a></div>
        <div class="adm-detail-row"><span class="adm-detail-lbl">Telèfon</span><strong>${r.telefono || "—"}</strong></div>
        <div class="adm-detail-row"><span class="adm-detail-lbl">Ubicació</span><strong>${r.ubicacion || "—"}</strong></div>
        <div class="adm-detail-row"><span class="adm-detail-lbl">Data naixement</span><strong>${r.fechaNacimiento ? new Date(r.fechaNacimiento).toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" }) : "—"}</strong></div>
        <div class="adm-detail-row"><span class="adm-detail-lbl">Registre</span><strong>${r.createdAt ? new Date(r.createdAt).toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" }) : "—"}</strong></div>
        <div class="adm-detail-row"><span class="adm-detail-lbl">Última actualització</span><strong>${r.updatedAt ? new Date(r.updatedAt).toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" }) : "—"}</strong></div>
        ${r.descripcion ? `<div class="adm-detail-row adm-detail-row--full"><span class="adm-detail-lbl">Descripció</span><p class="adm-detail-text">"${r.descripcion}"</p></div>` : ""}
      </div>
      <div class="adm-modal__foot">
        <button class="adm-btn adm-btn--ghost" data-action="close"><i class="ti ti-x"></i>Tancar</button>
        <button class="adm-btn adm-btn--ghost" data-action="edit"><i class="ti ti-pencil"></i>Editar</button>
        <button class="adm-btn adm-btn--danger" data-action="delete"><i class="ti ti-trash"></i>Eliminar</button>
      </div>
    `;
    body.querySelector('[data-action="close"]').addEventListener("click", close);
    body.querySelector('[data-action="edit"]').addEventListener("click", () => { close(); openEdit(r); });
    body.querySelector('[data-action="delete"]').addEventListener("click", () => { close(); showConfirm(`Vols eliminar l'usuari "${r.nom ?? r.email}"?`, () => del(r._id ?? r.id)); });
  }

  buildShell();
  load();
}

// ════════════════════════════════════════════════════════════
// MULTIMEDIA
// ════════════════════════════════════════════════════════════
function initMultimedia(container) {
  const state = { images: [], loading: true, uploading: false, search: "", copied: null, dragOver: false };
  let fileInput;

  function buildShell() {
    container.innerHTML = `
      <div class="adm-sec">
        <div class="adm-sec__head">
          <h2 class="adm-sec__title"><i class="ti ti-photo"></i>Multimedia<span class="adm-sec__count" data-role="count"></span><span class="adm-sec__avg" data-role="size" style="display:none;"></span></h2>
          <div class="adm-sec__actions">
            <div class="adm-search-wrap"><i class="ti ti-search adm-search-icon"></i><input class="${inpCls} adm-search-inp" data-role="search" placeholder="Cerca per nom…" /></div>
            <button class="adm-btn adm-btn--primary" data-action="upload-btn"><i class="ti ti-upload"></i><span data-role="upload-label">Pujar imatges</span></button>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" multiple style="display:none;" data-role="file-input" />
          </div>
        </div>
        <div class="adm-dropzone" data-role="dropzone">
          <i class="ti ti-cloud-upload"></i>
          <span>Arrossega imatges aquí o <strong>fes clic per seleccionar</strong></span>
          <span class="adm-dropzone__sub">JPG · PNG · WebP · GIF · SVG · màx. 8 MB per fitxer</span>
        </div>
        <div data-role="grid-mount"></div>
      </div>
    `;

    fileInput = container.querySelector('[data-role="file-input"]');
    const dropzone = container.querySelector('[data-role="dropzone"]');

    container.querySelector('[data-role="search"]').addEventListener("input", e => { state.search = e.target.value; renderGrid(); });
    container.querySelector('[data-action="upload-btn"]').addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", e => handleUpload(e.target.files));

    dropzone.addEventListener("click", () => fileInput.click());
    dropzone.addEventListener("dragover", e => { e.preventDefault(); dropzone.classList.add("adm-dropzone--over"); });
    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("adm-dropzone--over"));
    dropzone.addEventListener("drop", e => { e.preventDefault(); dropzone.classList.remove("adm-dropzone--over"); handleUpload(e.dataTransfer.files); });
  }

  function load() {
    state.loading = true; renderGrid();
    apiFetch("/admin/multimedia")
      .then(d => { state.images = Array.isArray(d) ? d : (d.images ?? []); })
      .catch(() => adminToast("Error carregant imatges", "err"))
      .finally(() => { state.loading = false; renderGrid(); });
  }

  async function handleUpload(files) {
    if (!files?.length) return;
    state.uploading = true; updateUploadBtn();
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append("files", f));
    try {
      await apiFetchRaw("/admin/multimedia", { method: "POST", body: fd });
      adminToast(`${files.length} imatge${files.length > 1 ? "s pujades" : " pujada"} ✓`, "ok");
      load();
    } catch { adminToast("Error pujant imatges", "err"); }
    finally { state.uploading = false; updateUploadBtn(); if (fileInput) fileInput.value = ""; }
  }

  function updateUploadBtn() {
    const btn = container.querySelector('[data-action="upload-btn"]');
    const lbl = container.querySelector('[data-role="upload-label"]');
    if (!btn) return;
    btn.disabled = state.uploading;
    btn.innerHTML = state.uploading ? `<div class="adm-spin adm-spin--sm"></div>Pujant…` : `<i class="ti ti-upload"></i><span data-role="upload-label">Pujar imatges</span>`;
  }

  async function del(filename) {
    try { await apiFetchRaw(`/admin/multimedia/${encodeURIComponent(filename)}`, { method: "DELETE" }); adminToast("Imatge eliminada ✓", "ok"); load(); }
    catch { adminToast("Error eliminant", "err"); }
  }

  function copyUrl(img) {
    navigator.clipboard.writeText(`${API}${img.url}`).then(() => {
      state.copied = img.filename;
      renderGrid();
      setTimeout(() => { state.copied = null; renderGrid(); }, 2000);
    });
  }

  function getFiltered() { return state.images.filter(img => img.filename.toLowerCase().includes(state.search.toLowerCase())); }

  function renderGrid() {
    const countEl = container.querySelector('[data-role="count"]');
    if (countEl) countEl.textContent = state.images.length;
    const sizeEl = container.querySelector('[data-role="size"]');
    if (sizeEl) {
      const total = state.images.reduce((a, i) => a + (i.size || 0), 0);
      sizeEl.style.display = state.images.length ? "" : "none";
      sizeEl.innerHTML = `<i class="ti ti-database"></i>${fmtBytes(total)}`;
    }

    const mount = container.querySelector('[data-role="grid-mount"]');
    if (!mount) return;
    if (state.loading) { mount.innerHTML = `<div class="adm-loading"><div class="adm-spin"></div><span>Carregant…</span></div>`; return; }

    const filtered = getFiltered();
    if (filtered.length === 0) {
      mount.innerHTML = emptyStateHtml(state.search ? "ti-photo-search" : "ti-photo-off", state.search ? "Sense resultats" : "Encara no hi ha imatges pujades", !state.search ? "Pujar primera imatge" : null);
      mount.querySelector('[data-action="empty-cta"]')?.addEventListener("click", () => fileInput.click());
      return;
    }

    mount.innerHTML = `
      <div class="adm-media-grid">
        ${filtered.map((img, i) => `
          <div class="adm-media-card" data-idx="${i}">
            <div class="adm-media-thumb" data-action="preview" title="Veure en gran">
              <img src="${API}${img.url}" alt="${img.filename}" loading="lazy" />
              <div class="adm-media-thumb__overlay"><i class="ti ti-eye"></i></div>
            </div>
            <div class="adm-media-info">
              <span class="adm-media-name" title="${img.filename}">${img.filename}</span>
              <div class="adm-media-meta"><span>${fmtBytes(img.size)}</span>${img.uploadedAt ? `<span>${new Date(img.uploadedAt).toLocaleDateString("ca-ES")}</span>` : ""}</div>
            </div>
            <div class="adm-media-actions">
              <button class="adm-icon-btn${state.copied === img.filename ? " adm-icon-btn--copied" : " adm-icon-btn--view"}" title="Copiar URL" data-action="copy"><i class="ti ${state.copied === img.filename ? "ti-check" : "ti-link"}"></i></button>
              <a href="${API}${img.url}" target="_blank" rel="noopener noreferrer" class="adm-icon-btn adm-icon-btn--edit" title="Obrir en nova pestanya"><i class="ti ti-external-link"></i></a>
              <button class="adm-icon-btn adm-icon-btn--delete" title="Eliminar" data-action="delete"><i class="ti ti-trash"></i></button>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    mount.querySelectorAll(".adm-media-card").forEach(card => {
      const img = filtered[Number(card.dataset.idx)];
      card.querySelector('[data-action="preview"]').addEventListener("click", () => openPreview(img));
      card.querySelector('[data-action="copy"]').addEventListener("click", () => copyUrl(img));
      card.querySelector('[data-action="delete"]').addEventListener("click", () => showConfirm(`Vols eliminar "${img.filename}"?`, () => del(img.filename)));
    });
  }

  function openPreview(img) {
    const root = document.createElement("div");
    document.body.appendChild(root);
    function close() { root.remove(); }
    root.innerHTML = `
      <div class="adm-lightbox" data-action="backdrop">
        <div class="adm-lightbox__box" data-action="stop">
          <div class="adm-lightbox__head">
            <span class="adm-lightbox__name"><i class="ti ti-photo"></i>${img.filename}</span>
            <div class="adm-lightbox__head-actions">
              <button class="adm-icon-btn adm-icon-btn--view" title="Copiar URL" data-action="copy"><i class="ti ti-link"></i></button>
              <a href="${API}${img.url}" download="${img.filename}" class="adm-icon-btn adm-icon-btn--edit" title="Descarregar"><i class="ti ti-download"></i></a>
              <button class="adm-icon-btn adm-icon-btn--delete" title="Eliminar" data-action="delete"><i class="ti ti-trash"></i></button>
              <button class="adm-icon-btn adm-icon-btn--view" title="Tancar" data-action="close"><i class="ti ti-x"></i></button>
            </div>
          </div>
          <div class="adm-lightbox__img-wrap"><img src="${API}${img.url}" alt="${img.filename}" /></div>
          <div class="adm-lightbox__foot">
            <span><i class="ti ti-database"></i>${fmtBytes(img.size)}</span>
            ${img.uploadedAt ? `<span><i class="ti ti-calendar"></i>${new Date(img.uploadedAt).toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" })}</span>` : ""}
            <span class="adm-lightbox__url" data-action="copy" title="Fes clic per copiar"><i class="ti ti-link"></i>${API}${img.url}</span>
          </div>
        </div>
      </div>
    `;
    root.querySelector('[data-action="backdrop"]').addEventListener("click", close);
    root.querySelector('[data-action="stop"]').addEventListener("click", e => e.stopPropagation());
    root.querySelector('[data-action="close"]').addEventListener("click", close);
    root.querySelectorAll('[data-action="copy"]').forEach(el => el.addEventListener("click", () => copyUrl(img)));
    root.querySelector('[data-action="delete"]').addEventListener("click", () => { close(); showConfirm(`Vols eliminar "${img.filename}"?`, () => del(img.filename)); });
  }

  buildShell();
  load();
}

// ════════════════════════════════════════════════════════════
// EDITOR JSON
// ════════════════════════════════════════════════════════════
const JSON_FILES = [
  { key: "events", label: "Esdeveniments", icon: "ti-calendar-event", route: "/admin/json/events" },
  { key: "projectes", label: "Projectes", icon: "ti-folder", route: "/admin/json/projectes" },
  { key: "publi", label: "Publicacions", icon: "ti-file-text", route: "/admin/json/publi" },
  { key: "resenas", label: "Ressenyes", icon: "ti-message-star", route: "/admin/json/resenas" },
  { key: "solicituds", label: "Sol·licituds", icon: "ti-users", route: "/admin/json/solicituds" },
];

function initEditorJSON(container) {
  const state = { selected: null, content: "", original: "", loading: false, saving: false };

  function validateJSON(str) { try { JSON.parse(str); return null; } catch (e) { return e.message; } }

  function buildShell() {
    container.innerHTML = `
      <div class="adm-sec">
        <div class="adm-sec__head">
          <h2 class="adm-sec__title"><i class="ti ti-code"></i>Editor JSON</h2>
          <span style="font-family:var(--font-mono);font-size:0.65rem;color:var(--text-muted);letter-spacing:1px;">Edita els fitxers de dades directament</span>
        </div>
        <div class="adm-json-layout">
          <div class="adm-json-sidebar">
            <div class="adm-json-sidebar__head">Fitxers de dades</div>
            ${JSON_FILES.map(f => `
              <button class="adm-json-file-btn" data-file="${f.key}">
                <i class="ti ${f.icon}"></i><span>${f.label}</span><span class="adm-json-file-badge">.json</span>
              </button>
            `).join("")}
          </div>
          <div class="adm-json-editor-wrap" data-role="editor-mount">
            <div class="adm-json-empty"><i class="ti ti-file-code"></i><span>Selecciona un fitxer per editar</span></div>
          </div>
        </div>
      </div>
    `;
    container.querySelectorAll("[data-file]").forEach(btn => btn.addEventListener("click", () => loadFile(btn.dataset.file)));
  }

  function markActiveFileBtn() {
    container.querySelectorAll("[data-file]").forEach(btn => btn.classList.toggle("adm-json-file-btn--active", btn.dataset.file === state.selected?.key));
  }

  async function loadFile(key) {
    const file = JSON_FILES.find(f => f.key === key);
    state.selected = file;
    state.loading = true;
    markActiveFileBtn();
    renderEditor();
    try {
      const data = await apiFetch(file.route);
      const str = JSON.stringify(data, null, 2);
      state.content = str; state.original = str;
    } catch {
      adminToast("Error carregant el fitxer JSON", "err");
      state.content = ""; state.original = "";
    } finally {
      state.loading = false;
      renderEditor();
    }
  }

  function renderEditor() {
    const mount = container.querySelector('[data-role="editor-mount"]');
    if (!mount) return;

    if (!state.selected) {
      mount.innerHTML = `<div class="adm-json-empty"><i class="ti ti-file-code"></i><span>Selecciona un fitxer per editar</span></div>`;
      return;
    }
    if (state.loading) {
      mount.innerHTML = `<div class="adm-loading" style="min-height:340px;"><div class="adm-spin"></div><span>Carregant JSON…</span></div>`;
      return;
    }

    mount.innerHTML = `
      <div class="adm-json-toolbar">
        <span class="adm-json-filename"><i class="ti ti-file-code"></i>${state.selected.label}.json</span>
        <span class="adm-json-status" data-role="status"></span>
        <button class="adm-btn adm-btn--ghost" data-action="copy"><i class="ti ti-copy"></i>Copiar</button>
        <button class="adm-btn adm-btn--ghost" data-action="format"><i class="ti ti-brackets"></i>Formatar</button>
        <button class="adm-btn adm-btn--ghost" data-action="discard" style="display:none;"><i class="ti ti-refresh"></i>Descartar</button>
        <button class="adm-btn adm-btn--primary" data-action="save"><i class="ti ti-device-floppy"></i>Desar</button>
      </div>
      <div class="adm-json-error-msg" data-role="error-msg" style="display:none;"><i class="ti ti-alert-circle"></i><span data-role="error-text"></span></div>
      <textarea class="adm-json-textarea" data-role="textarea" spellcheck="false" autocorrect="off" autocapitalize="off">${state.content}</textarea>
      <div class="adm-json-meta" data-role="meta"></div>
      <div class="adm-notice">
        <i class="ti ti-alert-triangle"></i>
        <div><strong>Atenció:</strong> editar el JSON directament pot corrompre les dades. Assegura't que el JSON sigui vàlid abans de desar.</div>
      </div>
    `;

    const textarea = mount.querySelector('[data-role="textarea"]');
    const statusEl = mount.querySelector('[data-role="status"]');
    const errorBox = mount.querySelector('[data-role="error-msg"]');
    const errorText = mount.querySelector('[data-role="error-text"]');
    const metaEl = mount.querySelector('[data-role="meta"]');
    const discardBtn = mount.querySelector('[data-action="discard"]');
    const formatBtn = mount.querySelector('[data-action="format"]');
    const saveBtn = mount.querySelector('[data-action="save"]');

    function updateStatus() {
      const errMsg = state.content ? validateJSON(state.content) : null;
      const isDirty = state.content !== state.original;

      textarea.classList.toggle("adm-json-textarea--error", !!errMsg);
      errorBox.style.display = errMsg ? "" : "none";
      if (errMsg) errorText.textContent = errMsg;

      const label = errMsg ? "Error JSON" : isDirty ? "Modificat" : "Sincronitzat";
      const cls = errMsg ? "adm-json-status--err" : isDirty ? "adm-json-status--mod" : "adm-json-status--ok";
      statusEl.className = `adm-json-status ${cls}`;
      statusEl.textContent = label;

      discardBtn.style.display = isDirty ? "" : "none";
      formatBtn.disabled = !!errMsg;
      saveBtn.disabled = !isDirty || !!errMsg || state.saving;

      metaEl.innerHTML = `
        <span><i class="ti ti-list-numbers"></i>${state.content.split("\n").length} línies</span>
        <span><i class="ti ti-text-size"></i>${state.content.length.toLocaleString()} caràcters</span>
        ${(!errMsg && state.content) ? (() => {
          try {
            const d = JSON.parse(state.content);
            return `<span><i class="ti ti-check"></i>${Array.isArray(d) ? `${d.length} elements` : `${Object.keys(d).length} claus`}</span>`;
          } catch { return ""; }
        })() : ""}
      `;

      return { errMsg, isDirty };
    }

    textarea.addEventListener("input", e => { state.content = e.target.value; updateStatus(); });

    mount.querySelector('[data-action="copy"]').addEventListener("click", () => {
      navigator.clipboard.writeText(state.content).then(() => adminToast("JSON copiat ✓", "ok"));
    });

    formatBtn.addEventListener("click", () => {
      try {
        state.content = JSON.stringify(JSON.parse(state.content), null, 2);
        textarea.value = state.content;
        updateStatus();
      } catch { adminToast("No es pot formatar: JSON invàlid", "err"); }
    });

    discardBtn.addEventListener("click", () => {
      state.content = state.original;
      textarea.value = state.content;
      updateStatus();
    });

    saveBtn.addEventListener("click", async () => {
      const { errMsg } = updateStatus();
      if (errMsg) { adminToast("El JSON té errors de sintaxi", "err"); return; }
      state.saving = true;
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<div class="adm-spin adm-spin--sm"></div>Desant…`;
      try {
        const parsed = JSON.parse(state.content);
        await apiFetch(state.selected.route, { method: "PUT", body: JSON.stringify(parsed) });
        state.original = state.content;
        adminToast("Fitxer desat correctament ✓", "ok");
      } catch { adminToast("Error desant el fitxer", "err"); }
      finally {
        state.saving = false;
        saveBtn.innerHTML = `<i class="ti ti-device-floppy"></i>Desar`;
        updateStatus();
      }
    });

    updateStatus();
  }

  buildShell();
}
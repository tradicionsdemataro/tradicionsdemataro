// ============================================================
// admin-core.js — Helpers compartits pel panell d'administració
// (equivalent a apiFetch, Toast, Confirm, Modal, Field, RowActions,
// EmptyState, Stars, ImagePicker, GaleriaPicker de AdminPanel.jsx)
// ============================================================

const API = "https://backend-tradicions.onrender.com";

function getAdminToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function apiFetch(path, opts = {}) {
  const token = getAdminToken();
  return fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers ?? {}) },
    ...opts,
  }).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); });
}

function apiFetchRaw(path, opts = {}) {
  const token = getAdminToken();
  return fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, ...(opts.headers ?? {}) },
    ...opts,
  }).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); });
}

function fmtBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Toast ──────────────────────────────────────────────────────────
const adminToast = (() => {
  let root = null;
  let timer = null;
  function ensureRoot() {
    if (!root) {
      root = document.createElement("div");
      root.id = "adm-toast-root";
      document.body.appendChild(root);
    }
  }
  return function showToast(msg, type = "ok") {
    ensureRoot();
    clearTimeout(timer);
    root.innerHTML = `
      <div class="adm-toast adm-toast--${type}">
        <i class="ti ${type === "ok" ? "ti-circle-check" : "ti-alert-circle"}"></i>
        <span>${msg}</span>
      </div>
    `;
    timer = setTimeout(() => { root.innerHTML = ""; }, 3500);
  };
})();

// ── Confirm ────────────────────────────────────────────────────────
function showConfirm(msg, onYes) {
  const root = document.createElement("div");
  document.body.appendChild(root);
  function close() { root.remove(); }
  root.innerHTML = `
    <div class="adm-overlay">
      <div class="adm-confirm">
        <div class="adm-confirm__icon-wrap"><i class="ti ti-trash-x"></i></div>
        <p class="adm-confirm__msg">${msg}</p>
        <p class="adm-confirm__sub">Aquesta acció no es pot desfer.</p>
        <div class="adm-confirm__btns">
          <button class="adm-btn adm-btn--ghost" data-action="no"><i class="ti ti-x"></i>Cancel·lar</button>
          <button class="adm-btn adm-btn--danger" data-action="yes"><i class="ti ti-trash"></i>Eliminar</button>
        </div>
      </div>
    </div>
  `;
  root.querySelector('[data-action="no"]').addEventListener("click", close);
  root.querySelector('[data-action="yes"]').addEventListener("click", () => { close(); onYes(); });
}

// ── Modal ──────────────────────────────────────────────────────────
function openModal({ title, icon, wide, onClose } = {}) {
  const root = document.createElement("div");
  document.body.appendChild(root);

  function escHandler(e) { if (e.key === "Escape") close(); }
  function close() {
    window.removeEventListener("keydown", escHandler);
    root.remove();
    onClose?.();
  }
  window.addEventListener("keydown", escHandler);

  root.innerHTML = `
    <div class="adm-overlay" data-action="backdrop">
      <div class="adm-modal${wide ? " adm-modal--wide" : ""}" data-action="stop">
        <div class="adm-modal__head">
          <div class="adm-modal__title-wrap">
            ${icon ? `<i class="ti ${icon} adm-modal__title-icon"></i>` : ""}
            <span class="adm-modal__title">${title ?? ""}</span>
          </div>
          <button class="adm-modal__close" data-action="close" title="Tancar (Esc)"><i class="ti ti-x"></i></button>
        </div>
        <div class="adm-modal__body" data-role="body"></div>
      </div>
    </div>
  `;
  root.querySelector('[data-action="backdrop"]').addEventListener("click", close);
  root.querySelector('[data-action="stop"]').addEventListener("click", e => e.stopPropagation());
  root.querySelector('[data-action="close"]').addEventListener("click", close);

  return { root, body: root.querySelector('[data-role="body"]'), close };
}

// ── Petits helpers de markup ──────────────────────────────────────
function fieldHtml(label, innerHtml, { required = false, span = false } = {}) {
  return `
    <div class="adm-field${span ? " adm-field--span" : ""}">
      ${label ? `<label class="adm-field__lbl">${label}${required ? `<span class="adm-field__req"> *</span>` : ""}</label>` : ""}
      ${innerHtml}
    </div>
  `;
}

const inpCls = "adm-inp";
const selCls = "adm-sel";
const texCls = "adm-tex";

function rowActionsHtml({ view, edit, del } = {}) {
  return `
    <div class="adm-row-actions">
      ${view ? `<button type="button" class="adm-icon-btn adm-icon-btn--view" data-row-action="view" title="Veure detall"><i class="ti ti-eye"></i></button>` : ""}
      ${edit ? `<button type="button" class="adm-icon-btn adm-icon-btn--edit" data-row-action="edit" title="Editar"><i class="ti ti-pencil"></i></button>` : ""}
      ${del ? `<button type="button" class="adm-icon-btn adm-icon-btn--delete" data-row-action="delete" title="Eliminar"><i class="ti ti-trash"></i></button>` : ""}
    </div>
  `;
}

function emptyStateHtml(icon, text, actionLabel) {
  return `
    <div class="adm-empty-state">
      <i class="ti ${icon}"></i><span>${text}</span>
      ${actionLabel ? `<button class="adm-btn adm-btn--primary" data-action="empty-cta"><i class="ti ti-plus"></i>${actionLabel}</button>` : ""}
    </div>
  `;
}

function starsHtml(rating, large) {
  return `
    <div class="adm-stars-row${large ? " adm-stars-row--lg" : ""}">
      ${[1, 2, 3, 4, 5].map(n => `<i class="ti ${n <= (rating || 0) ? "ti-star-filled adm-star--on" : "ti-star"} adm-star${large ? " adm-star--lg" : ""}"></i>`).join("")}
    </div>
  `;
}

// ── ImagePicker ────────────────────────────────────────────────────
// Munta un selector d'imatge (URL manual o de la mediateca) dins `container`.
function mountImagePicker(container, opts) {
  let { label, value, onChange, required, span, images } = opts;
  let open = false;
  let urlInput, clearBtn, previewBox, previewImg, dropdownMount;

  function buildShell() {
    container.innerHTML = `
      <div class="adm-field${span ? " adm-field--span" : ""}">
        ${label ? `<label class="adm-field__lbl">${label}${required ? `<span class="adm-field__req"> *</span>` : ""}</label>` : ""}
        <div class="adm-imgpick-row">
          <input class="adm-inp adm-imgpick-inp" data-role="url-input" placeholder="https://… o selecciona de multimedia" />
          <button type="button" class="adm-btn adm-btn--ghost adm-imgpick-btn" data-action="toggle" title="Seleccionar"><i class="ti ti-photo-search"></i></button>
          <button type="button" class="adm-btn adm-btn--ghost adm-imgpick-btn adm-imgpick-btn--clear" data-action="clear" title="Treure" style="display:none;"><i class="ti ti-x"></i></button>
        </div>
        <div class="adm-imgpick-preview" data-role="preview" style="display:none;"><img alt="preview" /></div>
        <div data-role="dropdown-mount"></div>
      </div>
    `;
    urlInput = container.querySelector('[data-role="url-input"]');
    clearBtn = container.querySelector('[data-action="clear"]');
    previewBox = container.querySelector('[data-role="preview"]');
    previewImg = previewBox.querySelector("img");
    dropdownMount = container.querySelector('[data-role="dropdown-mount"]');

    urlInput.value = value ?? "";
    updatePreview();
    updateClearBtn();

    urlInput.addEventListener("input", e => {
      value = e.target.value;
      onChange(value);
      updatePreview();
      updateClearBtn();
    });
    container.querySelector('[data-action="toggle"]').addEventListener("click", () => { open = !open; renderDropdown(); });
    clearBtn.addEventListener("click", () => {
      value = "";
      onChange("");
      urlInput.value = "";
      updatePreview();
      updateClearBtn();
    });

    renderDropdown();
  }

  function updatePreview() {
    if (value) {
      previewBox.style.display = "";
      previewImg.src = value.startsWith("http") ? value : `${API}${value}`;
    } else {
      previewBox.style.display = "none";
    }
  }
  function updateClearBtn() { clearBtn.style.display = value ? "" : "none"; }

  function renderDropdown() {
    if (!open) { dropdownMount.innerHTML = ""; return; }
    dropdownMount.innerHTML = `
      <div class="adm-imgpick-dropdown">
        <div class="adm-imgpick-search"><i class="ti ti-search"></i><input class="adm-inp" data-role="search-input" placeholder="Cerca imatge…" /></div>
        ${images.length === 0
          ? `<div class="adm-imgpick-empty"><i class="ti ti-photo-off"></i>Sense imatges</div>`
          : `<div class="adm-imgpick-grid">
              ${images.map(img => {
                const url = `${API}${img.url}`;
                const isSelected = value === url || value === img.url;
                return `
                  <button type="button" class="adm-imgpick-thumb${isSelected ? " adm-imgpick-thumb--active" : ""}" data-thumb="${img.filename}" title="${img.filename}">
                    <img src="${url}" alt="${img.filename}" loading="lazy" />
                    ${isSelected ? `<div class="adm-imgpick-thumb__check"><i class="ti ti-check"></i></div>` : ""}
                  </button>
                `;
              }).join("")}
            </div>`}
        <div class="adm-imgpick-foot">
          <button type="button" class="adm-btn adm-btn--ghost" data-action="close-drop"><i class="ti ti-x"></i>Tancar</button>
        </div>
      </div>
    `;
    dropdownMount.querySelector('[data-role="search-input"]').addEventListener("input", e => {
      const term = e.target.value.toLowerCase();
      dropdownMount.querySelectorAll("[data-thumb]").forEach(btn => {
        btn.style.display = btn.dataset.thumb.toLowerCase().includes(term) ? "" : "none";
      });
    });
    dropdownMount.querySelector('[data-action="close-drop"]').addEventListener("click", () => { open = false; renderDropdown(); });
    dropdownMount.querySelectorAll("[data-thumb]").forEach(btn => {
      btn.addEventListener("click", () => {
        const img = images.find(i => i.filename === btn.dataset.thumb);
        if (!img) return;
        value = `${API}${img.url}`;
        onChange(value);
        urlInput.value = value;
        updatePreview();
        updateClearBtn();
        open = false;
        renderDropdown();
      });
    });
  }

  buildShell();
  return { setImages(newImages) { images = newImages; renderDropdown(); } };
}

// ── GaleriaPicker ──────────────────────────────────────────────────
function mountGaleriaPicker(container, opts) {
  let { images, value = [], onChange } = opts;
  let open = false;
  let listMount, toggleLabel, dropdownMount;

  function buildShell() {
    container.innerHTML = `
      <div class="adm-field adm-field--span">
        <label class="adm-field__lbl">Galeria d'imatges</label>
        <div data-role="list-mount"></div>
        <button type="button" class="adm-btn adm-btn--ghost" data-action="toggle"><i class="ti ti-photo-plus"></i><span data-role="toggle-label"></span></button>
        <div data-role="dropdown-mount"></div>
      </div>
    `;
    listMount = container.querySelector('[data-role="list-mount"]');
    toggleLabel = container.querySelector('[data-role="toggle-label"]');
    dropdownMount = container.querySelector('[data-role="dropdown-mount"]');
    container.querySelector('[data-action="toggle"]').addEventListener("click", () => { open = !open; renderDropdown(); });
    renderList();
    renderDropdown();
  }

  function labelText() {
    return open ? "Tancar selector" : `Afegir imatge${value.length > 0 ? ` (${value.length} seleccionades)` : ""}`;
  }

  function renderList() {
    toggleLabel.textContent = labelText();
    if (value.length === 0) { listMount.innerHTML = ""; return; }
    listMount.innerHTML = `
      <div class="adm-galeria-list">
        ${value.map((item, idx) => {
          const src = item.url.startsWith("http") ? item.url : `${API}${item.url}`;
          return `
            <div class="adm-galeria-item">
              <img src="${src}" alt="${item.alt ?? ""}" />
              <div class="adm-galeria-item__body">
                <input class="adm-inp adm-galeria-item__alt" data-role="alt-input" data-idx="${idx}" value="${item.alt ?? ""}" placeholder="Text alternatiu…" />
                <span class="adm-galeria-item__url">${item.url}</span>
              </div>
              <button type="button" class="adm-icon-btn adm-icon-btn--delete" data-action="remove" data-idx="${idx}" title="Treure"><i class="ti ti-x"></i></button>
            </div>
          `;
        }).join("")}
      </div>
    `;
    listMount.querySelectorAll('[data-role="alt-input"]').forEach(inp => {
      inp.addEventListener("input", e => {
        const idx = Number(inp.dataset.idx);
        value[idx] = { ...value[idx], alt: e.target.value };
        onChange(value);
      });
    });
    listMount.querySelectorAll('[data-action="remove"]').forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.idx);
        value = value.filter((_, i) => i !== idx);
        onChange(value);
        renderList();
        renderDropdown();
      });
    });
  }

  function renderDropdown() {
    toggleLabel.textContent = labelText();
    if (!open) { dropdownMount.innerHTML = ""; return; }
    dropdownMount.innerHTML = `
      <div class="adm-imgpick-dropdown adm-imgpick-dropdown--galeria">
        <div class="adm-imgpick-search"><i class="ti ti-search"></i><input class="adm-inp" data-role="search-input" placeholder="Cerca imatge…" /></div>
        ${images.length === 0
          ? `<div class="adm-imgpick-empty"><i class="ti ti-photo-off"></i>Sense imatges</div>`
          : `<div class="adm-imgpick-grid">
              ${images.map(img => {
                const url = `${API}${img.url}`;
                const isSelected = value.some(v => v.url === url || v.url === img.url);
                return `
                  <button type="button" class="adm-imgpick-thumb${isSelected ? " adm-imgpick-thumb--active" : ""}" data-thumb="${img.filename}" title="${img.filename}">
                    <img src="${url}" alt="${img.filename}" loading="lazy" />
                    ${isSelected ? `<div class="adm-imgpick-thumb__check"><i class="ti ti-check"></i></div>` : ""}
                  </button>
                `;
              }).join("")}
            </div>`}
        <div class="adm-imgpick-foot">
          <span class="adm-imgpick-foot__count" data-role="count"></span>
          <button type="button" class="adm-btn adm-btn--ghost" data-action="confirm"><i class="ti ti-check"></i>Confirmar</button>
        </div>
      </div>
    `;
    updateCount();
    dropdownMount.querySelector('[data-role="search-input"]').addEventListener("input", e => {
      const term = e.target.value.toLowerCase();
      dropdownMount.querySelectorAll("[data-thumb]").forEach(btn => {
        btn.style.display = btn.dataset.thumb.toLowerCase().includes(term) ? "" : "none";
      });
    });
    dropdownMount.querySelector('[data-action="confirm"]').addEventListener("click", () => { open = false; renderDropdown(); });
    dropdownMount.querySelectorAll("[data-thumb]").forEach(btn => {
      btn.addEventListener("click", () => {
        const img = images.find(i => i.filename === btn.dataset.thumb);
        if (!img) return;
        const url = `${API}${img.url}`;
        const exists = value.some(v => v.url === url || v.url === img.url);
        if (exists) value = value.filter(v => v.url !== url && v.url !== img.url);
        else value = [...value, { url, alt: img.filename.replace(/\.[^.]+$/, "") }];
        onChange(value);
        renderList();
        renderDropdown();
      });
    });
  }

  function updateCount() {
    const el = dropdownMount.querySelector('[data-role="count"]');
    if (el) el.textContent = `${value.length} imatge${value.length !== 1 ? "s" : ""} seleccionada${value.length !== 1 ? "s" : ""}`;
  }

  buildShell();
  return { setImages(newImages) { images = newImages; renderDropdown(); } };
}

// ── Càrrega d'imatges compartida (equivalent a useMediaImages) ─────
function loadMediaImages(callback) {
  apiFetch("/admin/multimedia")
    .then(d => callback(Array.isArray(d) ? d : (d.images ?? [])))
    .catch(() => callback([]));
}
// publicacio.js
// Equivalent vanilla del component PublicacioDetall.jsx.
// Reutilitza buildEstreles() de resenyes.js (mateixes classes res-estreles/res-estrela).

const id = new URLSearchParams(window.location.search).get("id");
const token = getToken();

const state = {
  pub: null,
  loading: true,
  error: null,
  lbIdx: null,
  liked: false,
  ressenyes: [],
  expanded: false,
  showForm: false,
  rating: 0,
  text: "",
  posting: false,
  postErr: null,
};

document.addEventListener("DOMContentLoaded", () => {
  window.scrollTo(0, 0);
  fetchRessenyes();
  fetchPublicacio();
  wireLightboxKeys();
});

/* ===========================================================
   FETCH
=========================================================== */

async function fetchRessenyes() {
  try {
    const res = await fetch(`https://backend-tradicions.onrender.com/resenas/${id}`);
    if (!res.ok) { state.ressenyes = []; return; }
    const data = await res.json();
    const lista = data?.reseñas ?? data?.ressenyes ?? data ?? [];
    state.ressenyes = Array.isArray(lista) ? lista : [];
  } catch (err) {
    console.error(err);
    state.ressenyes = [];
  } finally {
    render();
  }
}

async function fetchPublicacio() {
  try {
    let res = await fetch(`https://backend-tradicions.onrender.com/publi/${id}`);
    if (res.ok) {
      const data = await res.json();
      state.pub = data.publicacio ?? data;
    } else {
      res = await fetch("https://backend-tradicions.onrender.com/publi");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const all = Array.isArray(data) ? data : data.publicacions ?? [];
      const trobat = all.find((p) => String(p.id) === String(id) || p.slug === id);
      if (!trobat) throw new Error("Publicació no trobada");
      state.pub = trobat;
    }
  } catch (err) {
    console.error(err);
    state.error = err.message;
  } finally {
    state.loading = false;
    render();
  }
}

async function handleEnviar() {
  if (!state.text.trim() || !state.rating || state.posting) return;
  state.posting = true;
  state.postErr = null;
  render();

  try {
    const res = await fetch(`https://backend-tradicions.onrender.com/resenas/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: state.text, rating: state.rating }),
    });
    if (!res.ok) throw new Error("Error en enviar la ressenya");
    const nova = await res.json();
    state.ressenyes = [nova?.ressenya ?? nova, ...state.ressenyes];
    state.showForm = false;
    state.text = "";
    state.rating = 0;
  } catch (err) {
    state.postErr = err.message;
  } finally {
    state.posting = false;
    render();
  }
}

/* ===========================================================
   DERIVED
=========================================================== */

function getImgs() {
  const pub = state.pub;
  return pub?.galeria_imatges ?? (pub?.imatge ? [{ url: pub.imatge }] : []);
}

/* ===========================================================
   LIGHTBOX
=========================================================== */

function openLb(i) { state.lbIdx = i; render(); }
function closeLb() { state.lbIdx = null; render(); }
function prevLb() {
  const imgs = getImgs();
  state.lbIdx = (state.lbIdx - 1 + imgs.length) % imgs.length;
  render();
}
function nextLb() {
  const imgs = getImgs();
  state.lbIdx = (state.lbIdx + 1) % imgs.length;
  render();
}

function wireLightboxKeys() {
  window.addEventListener("keydown", (e) => {
    if (state.lbIdx === null) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") prevLb();
    if (e.key === "ArrowRight") nextLb();
  });
}

function renderLightbox() {
  const root = document.getElementById("pubd-lightbox-root");
  root.innerHTML = "";
  if (state.lbIdx === null) return;

  const imgs = getImgs();
  const img = imgs[state.lbIdx];
  const url = img?.url ?? img;

  const backdrop = document.createElement("div");
  backdrop.className = "pubd-lb-backdrop";
  backdrop.addEventListener("click", closeLb);

  backdrop.innerHTML = `
    <button class="pubd-lb-close" aria-label="Tancar"><i class="ti ti-x"></i></button>
    <button class="pubd-lb-arrow pubd-lb-prev"><i class="ti ti-chevron-left"></i></button>
    <div class="pubd-lb-img-wrap">
      <img src="${url}" alt="Imatge ${state.lbIdx + 1}" />
      <span class="pubd-lb-counter">${state.lbIdx + 1} / ${imgs.length}</span>
    </div>
    <button class="pubd-lb-arrow pubd-lb-next"><i class="ti ti-chevron-right"></i></button>
  `;

  backdrop.querySelector(".pubd-lb-close").addEventListener("click", closeLb);
  backdrop.querySelector(".pubd-lb-prev").addEventListener("click", (e) => { e.stopPropagation(); prevLb(); });
  backdrop.querySelector(".pubd-lb-next").addEventListener("click", (e) => { e.stopPropagation(); nextLb(); });
  backdrop.querySelector(".pubd-lb-img-wrap").addEventListener("click", (e) => e.stopPropagation());

  root.appendChild(backdrop);
}

/* ===========================================================
   RENDER PRINCIPAL
=========================================================== */

function render() {
  const loadingEl = document.getElementById("pubd-loading");
  const errorEl = document.getElementById("pubd-error");
  const mainEl = document.getElementById("pubd-main");

  if (state.loading) {
    loadingEl.style.display = "flex";
    errorEl.style.display = "none";
    mainEl.style.display = "none";
    return;
  }

  if (state.error || !state.pub) {
    loadingEl.style.display = "none";
    errorEl.style.display = "flex";
    mainEl.style.display = "none";
    document.getElementById("pubd-error-msg").textContent = state.error ?? "Publicació no trobada";
    document.getElementById("pubd-error-back").onclick = () => {
      window.location.href = "publicacions.html";
    };
    return;
  }

  loadingEl.style.display = "none";
  errorEl.style.display = "none";
  mainEl.style.display = "block";

  renderBreadcrumb();
  renderHero();
  renderArticle();
  renderSidebar();
  renderRessenyes();
  renderLightbox();
}

/* ── BREADCRUMB ── */
function renderBreadcrumb() {
  const pub = state.pub;
  const wrap = document.getElementById("pubd-breadcrumb");
  wrap.innerHTML = `
    <a href="publicacions.html" class="pubd-bc-link"><i class="ti ti-arrow-left"></i> Publicacions</a>
    <span class="pubd-bc-sep">/</span>
    ${pub.categoria ? `
      <a href="publicacions.html?categoria=${encodeURIComponent(pub.categoria)}" class="pubd-bc-link pubd-bc-cat">${pub.categoria}</a>
      <span class="pubd-bc-sep">/</span>
    ` : ""}
    <span class="pubd-bc-current">${pub.titol}</span>
  `;
}

/* ── HERO ── */
function renderHero() {
  const pub = state.pub;
  const imgs = getImgs();
  const heroImg = imgs[0]?.url ?? imgs[0] ?? null;
  const estat = pub.estat ? (ESTAT_META[pub.estat] ?? { color: "var(--text-muted)", label: pub.estat }) : null;
  const dateStr = pub.data_publicacio ?? pub.data ?? pub.created_at;

  const hero = document.getElementById("pubd-hero");
  hero.innerHTML = `
    ${heroImg ? `
      <img class="pubd-hero-img" src="${heroImg}" alt="${pub.titol}" />
      <div class="pubd-hero-overlay"></div>
    ` : ""}
    <div class="pubd-hero-content">
      <div class="pubd-hero-top">
        ${pub.categoria ? `<span class="pubd-cat-badge">${pub.categoria}</span>` : ""}
        ${estat ? `<span class="pubd-estat-badge" style="background:${estat.color}">${estat.label}</span>` : ""}
      </div>

      <h1 class="pubd-hero-title">${pub.titol}</h1>

      ${pub.resum ? `<p class="pubd-hero-resum">${pub.resum}</p>` : ""}

      <div class="pubd-hero-meta">
        ${pub.autor ? `<span class="pubd-meta-item"><i class="ti ti-user"></i> ${pub.autor}</span>` : ""}
        ${dateStr ? `
        <span class="pubd-meta-item">
          <i class="ti ti-calendar"></i> ${fmtDate(dateStr)}
          <span class="pubd-meta-rel">(${tempsRelatiu(dateStr)})</span>
        </span>` : ""}
        ${pub.temps_lectura ? `<span class="pubd-meta-item"><i class="ti ti-clock"></i> ${pub.temps_lectura} min de lectura</span>` : ""}
        ${pub.visualitzacions ? `<span class="pubd-meta-item"><i class="ti ti-eye"></i> ${pub.visualitzacions} visualitzacions</span>` : ""}
      </div>
    </div>
  `;
}

/* ── ARTICLE ── */
function renderArticle() {
  const pub = state.pub;
  const imgs = getImgs();
  const article = document.getElementById("pubd-article");
  article.innerHTML = "";

  // Contingut ric (equivalent a dangerouslySetInnerHTML)
  const richWrap = document.createElement("div");
  richWrap.className = "pubd-rich-text";
  if (pub.contingut) {
    richWrap.innerHTML = pub.contingut;
  } else if (pub.resum) {
    richWrap.innerHTML = `<p>${pub.resum}</p>`;
  }
  if (pub.contingut || pub.resum) article.appendChild(richWrap);

  // Galeria
  if (imgs.length > 1) {
    const section = document.createElement("section");
    section.className = "pubd-section";
    section.innerHTML = `
      <h2 class="pubd-section-title">
        <span class="pubd-section-idx">Galeria</span>
        <span class="pubd-section-count">${imgs.length} imatges</span>
      </h2>
      <div class="pubd-gallery"></div>
    `;
    const grid = section.querySelector(".pubd-gallery");
    imgs.forEach((img, i) => {
      const url = img?.url ?? img;
      const item = document.createElement("div");
      item.className = `pubd-gallery-item ${i === 0 ? "pubd-gallery-item--featured" : ""}`;
      item.innerHTML = `
        <img src="${url}" alt="Imatge ${i + 1}" loading="lazy" />
        <div class="pubd-gallery-overlay"><i class="ti ti-zoom-in"></i></div>
      `;
      item.addEventListener("click", () => openLb(i));
      grid.appendChild(item);
    });
    article.appendChild(section);
  }

  // Tags
  if (pub.tags?.length > 0) {
    const row = document.createElement("div");
    row.className = "pubd-tags-row";
    row.innerHTML = `
      <i class="ti ti-tag pubd-tags-icon"></i>
      <div class="pubd-tags">
        ${pub.tags.map((tag) => `<span class="pubd-tag">${tag}</span>`).join("")}
      </div>
    `;
    article.appendChild(row);
  }

  // Accions
  const actions = document.createElement("div");
  actions.className = "pubd-actions";
  actions.innerHTML = `
    <button class="pubd-action-btn pubd-like ${state.liked ? "pubd-liked" : ""}">
      <i class="ti ${state.liked ? "ti-heart-filled" : "ti-heart"}"></i>
      ${state.liked ? (pub.likes ?? 0) + 1 : (pub.likes ?? 0)} m'agrada
    </button>
    <button class="pubd-action-btn"><i class="ti ti-share"></i> Compartir</button>
    <button class="pubd-back-btn pubd-back-inline"><i class="ti ti-arrow-left"></i> Tornar</button>
  `;

  actions.querySelector(".pubd-like").addEventListener("click", () => {
    state.liked = !state.liked;
    render();
  });
  actions.querySelectorAll(".pubd-action-btn")[1].addEventListener("click", () => {
    navigator.share?.({ title: pub.titol, url: window.location.href });
  });
  actions.querySelector(".pubd-back-btn").addEventListener("click", () => {
    window.location.href = "publicacions.html";
  });

  article.appendChild(actions);
}

/* ── SIDEBAR ── */
function renderSidebar() {
  const pub = state.pub;
  const estat = pub.estat ? (ESTAT_META[pub.estat] ?? { color: "var(--text-muted)", label: pub.estat }) : null;
  const dateStr = pub.data_publicacio ?? pub.data ?? pub.created_at;

  const sidebar = document.getElementById("pubd-sidebar");
  sidebar.innerHTML = "";

  const infoCard = document.createElement("div");
  infoCard.className = "pubd-sidebar-card";
  infoCard.innerHTML = `
    <h3 class="pubd-sidebar-title">Informació</h3>
    <div class="pubd-info-rows">
      ${estat ? `
      <div class="pubd-info-row">
        <span class="pubd-info-label">Estat</span>
        <span class="pubd-info-val pubd-info-estat" style="color:${estat.color}">
          <span class="pubd-estat-dot" style="background:${estat.color}"></span>
          ${estat.label}
        </span>
      </div>` : ""}
      ${pub.categoria ? `
      <div class="pubd-info-row">
        <span class="pubd-info-label">Categoria</span>
        <span class="pubd-info-val">${pub.categoria}</span>
      </div>` : ""}
      ${pub.autor ? `
      <div class="pubd-info-row">
        <span class="pubd-info-label">Autor/a</span>
        <span class="pubd-info-val">${pub.autor}</span>
      </div>` : ""}
      ${dateStr ? `
      <div class="pubd-info-row">
        <span class="pubd-info-label">Publicat</span>
        <span class="pubd-info-val">${fmtDate(dateStr)}</span>
      </div>` : ""}
      ${pub.data_modificacio ? `
      <div class="pubd-info-row">
        <span class="pubd-info-label">Actualitzat</span>
        <span class="pubd-info-val">${fmtDate(pub.data_modificacio)}</span>
      </div>` : ""}
      ${pub.temps_lectura ? `
      <div class="pubd-info-row">
        <span class="pubd-info-label">Lectura</span>
        <span class="pubd-info-val">${pub.temps_lectura} min</span>
      </div>` : ""}
      ${pub.visualitzacions !== undefined ? `
      <div class="pubd-info-row">
        <span class="pubd-info-label">Visites</span>
        <span class="pubd-info-val">${pub.visualitzacions}</span>
      </div>` : ""}
      ${pub.likes !== undefined ? `
      <div class="pubd-info-row">
        <span class="pubd-info-label">M'agrada</span>
        <span class="pubd-info-val" style="color:var(--pink)">${state.liked ? pub.likes + 1 : pub.likes}</span>
      </div>` : ""}
    </div>
  `;
  sidebar.appendChild(infoCard);

  if (pub.tags?.length > 0) {
    const tagsCard = document.createElement("div");
    tagsCard.className = "pubd-sidebar-card";
    tagsCard.innerHTML = `
      <h3 class="pubd-sidebar-title">Etiquetes</h3>
      <div class="pubd-tags">
        ${pub.tags.map((tag) => `<span class="pubd-tag">${tag}</span>`).join("")}
      </div>
    `;
    sidebar.appendChild(tagsCard);
  }

  if (pub.enllacos?.length > 0) {
    const linksCard = document.createElement("div");
    linksCard.className = "pubd-sidebar-card";
    linksCard.innerHTML = `
      <h3 class="pubd-sidebar-title">Enllaços relacionats</h3>
      <div class="pubd-ext-links">
        ${pub.enllacos.map((e) => `
          <a href="${e.url ?? e}" target="_blank" rel="noopener noreferrer" class="pubd-ext-link">
            <i class="ti ti-external-link"></i> ${e.nom ?? e.url ?? e}
          </a>
        `).join("")}
      </div>
    `;
    sidebar.appendChild(linksCard);
  }

  const backBtn = document.createElement("button");
  backBtn.className = "pubd-back-btn";
  backBtn.innerHTML = `<i class="ti ti-arrow-left"></i> Tornar a publicacions`;
  backBtn.addEventListener("click", () => { window.location.href = "publicacions.html"; });
  sidebar.appendChild(backBtn);
}

/* ── RESSENYES ── */
function renderRessenyes() {
  const wrap = document.getElementById("pubd-res-inner");
  wrap.innerHTML = "";

  const visibles = state.expanded ? state.ressenyes : state.ressenyes.slice(0, 3);
  const mitjana = state.ressenyes.length > 0
    ? (state.ressenyes.reduce((acc, r) => acc + (r.rating || 0), 0) / state.ressenyes.length).toFixed(1)
    : null;

  // Header
  const header = document.createElement("div");
  header.className = "pubd-res-header";
  header.innerHTML = `
    <div class="pubd-res-header-left">
      <div>
        <div class="pubd-res-label">Ressenyes</div>
        <div class="pubd-res-big-num">${state.ressenyes.length}</div>
      </div>
      ${mitjana ? `
      <div class="pubd-res-stars-avg">
        <span class="pubd-res-avg-val">${mitjana}</span>
        <span class="pubd-res-avg-stars"></span>
      </div>` : ""}
    </div>
    ${token && !state.showForm ? `
    <button class="pubd-res-write-btn"><i class="ti ti-pencil"></i> Escriu una ressenya</button>
    ` : ""}
  `;
  if (mitjana) {
    const starsWrap = header.querySelector(".pubd-res-avg-stars");
    starsWrap.appendChild(buildEstreles(Math.round(parseFloat(mitjana)), null, true).el);
  }
  const writeBtn = header.querySelector(".pubd-res-write-btn");
  if (writeBtn) {
    writeBtn.addEventListener("click", () => {
      state.showForm = true;
      render();
    });
  }
  wrap.appendChild(header);

  // Llista
  if (state.ressenyes.length > 0) {
    const list = document.createElement("div");
    list.className = "pubd-res-list";

    visibles.forEach((r) => {
      const card = document.createElement("article");
      card.className = "pubd-res-card";
      card.innerHTML = `
        <div class="pubd-res-card-top">
          <div class="pubd-res-author-block">
            <div class="pubd-res-avatar">${(r.autor ?? r.username ?? "U").slice(0, 2).toUpperCase()}</div>
            <div>
              <div class="pubd-res-author">${r.autor ?? r.username ?? "Usuari"}</div>
              <div class="pubd-res-date">${fmtDate(r.data ?? r.createdAt) ?? ""}</div>
            </div>
          </div>
          ${r.rating ? `
          <div class="pubd-res-rating-right">
            <span class="pubd-res-rating-stars"></span>
            <span class="pubd-res-rating-num">${r.rating} / 5</span>
          </div>` : ""}
        </div>
        <p class="pubd-res-text">${r.text}</p>
      `;
      if (r.rating) {
        card.querySelector(".pubd-res-rating-stars").appendChild(buildEstreles(r.rating, null, true).el);
      }
      list.appendChild(card);
    });

    wrap.appendChild(list);
  }

  if (state.ressenyes.length === 0) {
    const empty = document.createElement("div");
    empty.className = "pubd-res-empty";
    empty.innerHTML = `<i class="ti ti-message-off"></i><span>Encara no hi ha ressenyes. Sigues el primer!</span>`;
    wrap.appendChild(empty);
  }

  if (state.ressenyes.length > 3) {
    const moreBtn = document.createElement("button");
    moreBtn.className = "pubd-res-more";
    moreBtn.innerHTML = `
      ${state.expanded ? "Veure menys" : `Veure les ${state.ressenyes.length - 3} restants`}
      <i class="ti ${state.expanded ? "ti-chevron-up" : "ti-chevron-down"}"></i>
    `;
    moreBtn.addEventListener("click", () => {
      state.expanded = !state.expanded;
      render();
    });
    wrap.appendChild(moreBtn);
  }

  // Formulari
  if (token && state.showForm) {
    wrap.appendChild(buildResForm());
  }
}

function buildResForm() {
  const form = document.createElement("div");
  form.className = "pubd-res-form";

  const cancel = () => {
    state.showForm = false;
    state.text = "";
    state.rating = 0;
    state.postErr = null;
    render();
  };

  const head = document.createElement("div");
  head.className = "pubd-res-form-head";
  head.innerHTML = `
    <span class="pubd-res-form-title">La teva ressenya</span>
    <button type="button" class="pubd-res-close"><i class="ti ti-x"></i></button>
  `;
  head.querySelector(".pubd-res-close").addEventListener("click", cancel);
  form.appendChild(head);

  const stars = buildEstreles(state.rating, (n) => {
    state.rating = n;
    updateSubmit();
  }, false);
  form.appendChild(stars.el);

  const textarea = document.createElement("textarea");
  textarea.className = "pubd-res-textarea";
  textarea.placeholder = "Comparteix la teva opinió sobre aquesta publicació...";
  textarea.rows = 4;
  textarea.maxLength = 400;
  textarea.disabled = state.posting;
  textarea.value = state.text;
  textarea.addEventListener("input", (e) => {
    state.text = e.target.value;
    charCount.textContent = `${state.text.length} / 400`;
    updateSubmit();
  });
  form.appendChild(textarea);

  const errorDiv = document.createElement("div");
  errorDiv.className = "pubd-res-error";
  errorDiv.style.display = state.postErr ? "flex" : "none";
  errorDiv.innerHTML = `<i class="ti ti-alert-circle"></i> ${state.postErr ?? ""}`;
  form.appendChild(errorDiv);

  const actions = document.createElement("div");
  actions.className = "pubd-res-form-actions";

  const charCount = document.createElement("span");
  charCount.className = "pubd-res-char";
  charCount.textContent = `${state.text.length} / 400`;
  actions.appendChild(charCount);

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "pubd-res-cancel";
  cancelBtn.textContent = "Cancel·lar";
  cancelBtn.addEventListener("click", cancel);
  actions.appendChild(cancelBtn);

  const submitBtn = document.createElement("button");
  submitBtn.className = "pubd-res-submit";
  submitBtn.addEventListener("click", handleEnviar);
  actions.appendChild(submitBtn);

  function updateSubmit() {
    submitBtn.disabled = !state.text.trim() || !state.rating || state.posting;
    submitBtn.innerHTML = state.posting
      ? `<div class="pubd-res-spinner"></div> Enviant…`
      : `<i class="ti ti-send"></i> Publicar ressenya`;
  }
  updateSubmit();

  form.appendChild(actions);
  return form;
}
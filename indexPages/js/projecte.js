// ============================================================
// projecte-detall.js — Equivalent a ProjecteDetall.jsx
// Llegeix l'id del projecte de la query string: projecte-detall.html?id=123
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  const app = document.getElementById("pd-app");
  if (!app) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const ESTAT_META = {
    actiu:      { color: "var(--yellow)", label: "Actiu" },
    finalitzat: { color: "var(--blue)",   label: "Finalitzat" },
    pendent:    { color: "var(--pink)",   label: "Pendent" },
  };

  const state = {
    projecte: null,
    loading: true,
    error: null,
    lbIdx: null, // índex obert al lightbox, null = tancat
  };

  function fmtDate(raw) {
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d) ? raw : d.toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" });
  }

  function getImgs() {
    if (!state.projecte) return [];
    return state.projecte.galeria_imatges ?? (state.projecte.imatge ? [{ url: state.projecte.imatge }] : []);
  }

  function imgUrl(img) {
    return (img && typeof img === "object") ? img.url : img;
  }

  // ── Lightbox ─────────────────────────────────────────────────────
  function openLightbox(i) { state.lbIdx = i; renderLightbox(); }
  function closeLightbox() { state.lbIdx = null; renderLightbox(); }
  function prevLightbox() {
    const imgs = getImgs();
    state.lbIdx = (state.lbIdx - 1 + imgs.length) % imgs.length;
    renderLightbox();
  }
  function nextLightbox() {
    const imgs = getImgs();
    state.lbIdx = (state.lbIdx + 1) % imgs.length;
    renderLightbox();
  }

  let lbEscHandler = null;

  function renderLightbox() {
    let lb = document.getElementById("pd-lightbox-root");
    if (!lb) {
      lb = document.createElement("div");
      lb.id = "pd-lightbox-root";
      document.body.appendChild(lb);
    }

    const imgs = getImgs();

    if (state.lbIdx === null) {
      lb.innerHTML = "";
      if (lbEscHandler) {
        window.removeEventListener("keydown", lbEscHandler);
        lbEscHandler = null;
      }
      return;
    }

    const current = imgs[state.lbIdx];

    lb.innerHTML = `
      <div class="pd-lb-backdrop" data-action="lb-close">
        <button class="pd-lb-close" aria-label="Tancar" data-action="lb-close">
          <i class="ti ti-x"></i>
        </button>
        <button class="pd-lb-arrow pd-lb-prev" aria-label="Anterior" data-action="lb-prev">
          <i class="ti ti-chevron-left"></i>
        </button>
        <div class="pd-lb-img-wrap" data-action="lb-stop">
          <img src="${imgUrl(current)}" alt="Imatge ${state.lbIdx + 1}" />
          <span class="pd-lb-counter">${state.lbIdx + 1} / ${imgs.length}</span>
        </div>
        <button class="pd-lb-arrow pd-lb-next" aria-label="Següent" data-action="lb-next">
          <i class="ti ti-chevron-right"></i>
        </button>
      </div>
    `;

    lb.querySelectorAll('[data-action="lb-close"]').forEach(el => el.addEventListener("click", closeLightbox));
    lb.querySelector('[data-action="lb-prev"]')?.addEventListener("click", (e) => { e.stopPropagation(); prevLightbox(); });
    lb.querySelector('[data-action="lb-next"]')?.addEventListener("click", (e) => { e.stopPropagation(); nextLightbox(); });
    lb.querySelector('[data-action="lb-stop"]')?.addEventListener("click", (e) => e.stopPropagation());

    if (!lbEscHandler) {
      lbEscHandler = (e) => {
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") prevLightbox();
        if (e.key === "ArrowRight") nextLightbox();
      };
      window.addEventListener("keydown", lbEscHandler);
    }
  }

  // ── Render principal ─────────────────────────────────────────────
  function render() {
    if (state.loading) {
      app.innerHTML = `
        <div class="pd-fullstate">
          <div class="pd-spinner"></div>
          <span>Carregant projecte…</span>
        </div>
      `;
      return;
    }

    if (state.error || !state.projecte) {
      app.innerHTML = `
        <div class="pd-fullstate pd-fullstate--err">
          <i class="ti ti-alert-circle"></i>
          <span>${state.error ?? "Projecte no trobat"}</span>
          <button class="pd-back-btn" data-action="back-to-projectes">
            <i class="ti ti-arrow-left"></i> Tornar als projectes
          </button>
        </div>
      `;
      app.querySelector('[data-action="back-to-projectes"]')?.addEventListener("click", () => {
        window.location.href = "/projectes";
      });
      return;
    }

    const p = state.projecte;
    const imgs = getImgs();
    const heroImg = imgs[0] ? imgUrl(imgs[0]) : null;
    const estat = p.estat ? (ESTAT_META[p.estat] ?? { color: "var(--text-muted)", label: p.estat }) : null;

    app.innerHTML = `
      <main class="pd-page">

        <!-- BREADCRUMB -->
        <div class="pd-breadcrumb">
          <a href="/projectes" class="pd-bc-link">
            <i class="ti ti-arrow-left"></i> Projectes
          </a>
          <span class="pd-bc-sep">/</span>
          <span class="pd-bc-current">${p.titol ?? ""}</span>
        </div>

        <!-- HERO -->
        <section class="pd-hero">
          ${heroImg ? `
            <img class="pd-hero-img" src="${heroImg}" alt="${p.titol ?? ""}" />
            <div class="pd-hero-overlay"></div>
          ` : ""}

          <div class="pd-hero-content">
            <div class="pd-hero-top">
              ${p.categoria ? `<span class="pd-cat-badge">${p.categoria}</span>` : ""}
              ${estat ? `<span class="pd-estat-badge" style="background:${estat.color}">${estat.label}</span>` : ""}
            </div>

            <h1 class="pd-hero-title">${p.titol ?? ""}</h1>

            ${p.resum ? `<p class="pd-hero-resum">${p.resum}</p>` : ""}

            <div class="pd-hero-meta">
              ${p.lloc ? `<span class="pd-meta-item"><i class="ti ti-map-pin"></i> ${p.lloc}</span>` : ""}
              ${p.data_publicacio ? `<span class="pd-meta-item"><i class="ti ti-calendar"></i> ${fmtDate(p.data_publicacio)}</span>` : ""}
              ${p.data_fi ? `<span class="pd-meta-item"><i class="ti ti-calendar-off"></i> Fi: ${fmtDate(p.data_fi)}</span>` : ""}
              ${p.responsable ? `<span class="pd-meta-item"><i class="ti ti-user"></i> ${p.responsable}</span>` : ""}
            </div>
          </div>
        </section>

        <!-- BODY -->
        <div class="pd-body">

          <div class="pd-main">

            ${p.descripcio ? `
              <section class="pd-section">
                <h2 class="pd-section-title"><span class="pd-section-idx">01</span>Descripció</h2>
                <div class="pd-rich-text">${p.descripcio}</div>
              </section>
            ` : ""}

            ${p.objectius?.length > 0 ? `
              <section class="pd-section">
                <h2 class="pd-section-title"><span class="pd-section-idx">02</span>Objectius</h2>
                <ul class="pd-objectius">
                  ${p.objectius.map(o => `
                    <li class="pd-objectiu-item"><span class="pd-obj-dot"></span>${o}</li>
                  `).join("")}
                </ul>
              </section>
            ` : ""}

            ${p.participants?.length > 0 ? `
              <section class="pd-section">
                <h2 class="pd-section-title"><span class="pd-section-idx">03</span>Participants</h2>
                <div class="pd-participants">
                  ${p.participants.map(part => `
                    <div class="pd-participant-card">
                      ${part.avatar
                        ? `<img src="${part.avatar}" alt="${part.nom ?? part}" class="pd-participant-avatar" />`
                        : `<div class="pd-participant-avatar pd-participant-avatar--placeholder"><i class="ti ti-user"></i></div>`}
                      <span class="pd-participant-nom">${part.nom ?? part}</span>
                      ${part.rol ? `<span class="pd-participant-rol">${part.rol}</span>` : ""}
                    </div>
                  `).join("")}
                </div>
              </section>
            ` : ""}

            ${imgs.length > 0 ? `
              <section class="pd-section">
                <h2 class="pd-section-title">
                  <span class="pd-section-idx">04</span>Galeria
                  <span class="pd-section-count">${imgs.length} imatges</span>
                </h2>
                <div class="pd-gallery">
                  ${imgs.map((img, i) => `
                    <div class="pd-gallery-item ${i === 0 ? "pd-gallery-item--featured" : ""}" data-gallery-index="${i}">
                      <img src="${imgUrl(img)}" alt="Imatge ${i + 1}" loading="lazy" />
                      <div class="pd-gallery-overlay"><i class="ti ti-zoom-in"></i></div>
                    </div>
                  `).join("")}
                </div>
              </section>
            ` : ""}

            ${p.documents?.length > 0 ? `
              <section class="pd-section">
                <h2 class="pd-section-title"><span class="pd-section-idx">05</span>Documents</h2>
                <div class="pd-docs">
                  ${p.documents.map((doc, i) => `
                    <a href="${doc.url ?? doc}" target="_blank" rel="noopener noreferrer" class="pd-doc-card">
                      <i class="ti ti-file-description pd-doc-icon"></i>
                      <span class="pd-doc-name">${doc.nom ?? `Document ${i + 1}`}</span>
                      <i class="ti ti-download pd-doc-dl"></i>
                    </a>
                  `).join("")}
                </div>
              </section>
            ` : ""}

          </div>

          <!-- SIDEBAR -->
          <aside class="pd-sidebar">

            <div class="pd-sidebar-card">
              <h3 class="pd-sidebar-title">Dades del projecte</h3>
              <div class="pd-info-rows">
                ${estat ? `
                  <div class="pd-info-row">
                    <span class="pd-info-label">Estat</span>
                    <span class="pd-info-val pd-info-estat" style="color:${estat.color}">
                      <span class="pd-estat-dot" style="background:${estat.color}"></span>${estat.label}
                    </span>
                  </div>` : ""}
                ${p.categoria ? `
                  <div class="pd-info-row">
                    <span class="pd-info-label">Categoria</span>
                    <span class="pd-info-val">${p.categoria}</span>
                  </div>` : ""}
                ${p.lloc ? `
                  <div class="pd-info-row">
                    <span class="pd-info-label">Lloc</span>
                    <span class="pd-info-val">${p.lloc}</span>
                  </div>` : ""}
                ${p.data_publicacio ? `
                  <div class="pd-info-row">
                    <span class="pd-info-label">Inici</span>
                    <span class="pd-info-val">${fmtDate(p.data_publicacio)}</span>
                  </div>` : ""}
                ${p.data_fi ? `
                  <div class="pd-info-row">
                    <span class="pd-info-label">Fi</span>
                    <span class="pd-info-val">${fmtDate(p.data_fi)}</span>
                  </div>` : ""}
                ${p.responsable ? `
                  <div class="pd-info-row">
                    <span class="pd-info-label">Responsable</span>
                    <span class="pd-info-val">${p.responsable}</span>
                  </div>` : ""}
                ${p.pressupost ? `
                  <div class="pd-info-row">
                    <span class="pd-info-label">Pressupost</span>
                    <span class="pd-info-val">${p.pressupost}</span>
                  </div>` : ""}
              </div>
            </div>

            ${p.tags?.length > 0 ? `
              <div class="pd-sidebar-card">
                <h3 class="pd-sidebar-title">Etiquetes</h3>
                <div class="pd-tags">
                  ${p.tags.map(tag => `<span class="pd-tag">${tag}</span>`).join("")}
                </div>
              </div>
            ` : ""}

            ${p.enllacos?.length > 0 ? `
              <div class="pd-sidebar-card">
                <h3 class="pd-sidebar-title">Enllaços</h3>
                <div class="pd-links-list">
                  ${p.enllacos.map(e => `
                    <a href="${e.url ?? e}" target="_blank" rel="noopener noreferrer" class="pd-ext-link">
                      <i class="ti ti-external-link"></i>${e.nom ?? e.url ?? e}
                    </a>
                  `).join("")}
                </div>
              </div>
            ` : ""}

            <button class="pd-back-btn" data-action="back-to-projectes-2">
              <i class="ti ti-arrow-left"></i>
              Tornar als projectes
            </button>

          </aside>

        </div>

      </main>
    `;

    app.querySelector('[data-action="back-to-projectes-2"]')?.addEventListener("click", () => {
      window.location.href = "/projectes";
    });

    app.querySelectorAll("[data-gallery-index]").forEach(el => {
      const i = Number(el.dataset.galleryIndex);
      el.addEventListener("click", () => openLightbox(i));
    });

    renderLightbox();
  }

  // ── Fetch ─────────────────────────────────────────────────────────
  async function fetchProjecte() {
    window.scrollTo(0, 0);
    state.loading = true;
    render();

    if (!id) {
      state.error = "Falta l'identificador del projecte";
      state.loading = false;
      render();
      return;
    }

    try {
      // Prova primer la ruta individual
      let res = await fetch(`http://localhost:5000/projectes/${id}`);

      if (res.ok) {
        const data = await res.json();
        state.projecte = data.projecte ?? data;
        state.loading = false;
        render();
        return;
      }

      // Fallback: agafa tots i filtra
      res = await fetch("http://localhost:5000/projectes");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const all = Array.isArray(data) ? data : (data.projectes ?? []);

      const trobat = all.find(pr => String(pr.id) === String(id) || pr.slug === id);
      if (!trobat) throw new Error("Projecte no trobat");

      state.projecte = trobat;
    } catch (err) {
      console.error(err);
      state.error = err.message;
    } finally {
      state.loading = false;
      render();
    }
  }

  fetchProjecte();
});
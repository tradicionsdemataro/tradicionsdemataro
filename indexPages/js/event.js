// ============================================================
// event-detall.js — Equivalent a EventDetall.jsx
// Llegeix l'id de l'event de la query string: event-detall.html?id=123
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  const app = document.getElementById("ed-app");
  if (!app) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const ESTAT_META = {
    publicat:  { color: "var(--yellow)", label: "Publicat" },
    esborrany: { color: "var(--blue)",   label: "Esborrany" },
    arxivat:   { color: "var(--pink)",   label: "Arxivat" },
  };

  const state = {
    pub: null,
    loading: true,
    error: null,
    lbIdx: null, // índex obert al lightbox, null = tancat
    liked: false,
  };

  function fmtDate(raw) {
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d) ? raw : d.toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" });
  }

  function tempsRelatiu(raw) {
    if (!raw) return null;
    const diff = Date.now() - new Date(raw).getTime();
    const min = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (min < 1) return "ara mateix";
    if (min < 60) return `fa ${min} min`;
    if (h < 24) return `fa ${h}h`;
    if (d < 7) return `fa ${d} dia${d > 1 ? "s" : ""}`;
    return fmtDate(raw);
  }

  function getImgs() {
    if (!state.pub) return [];
    return state.pub.galeria_imatges ?? (state.pub.imatge ? [{ url: state.pub.imatge }] : []);
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
    let lb = document.getElementById("ed-lightbox-root");
    if (!lb) {
      lb = document.createElement("div");
      lb.id = "ed-lightbox-root";
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
      <div class="pubd-lb-backdrop" data-action="lb-close">
        <button class="pubd-lb-close" aria-label="Tancar" data-action="lb-close">
          <i class="ti ti-x"></i>
        </button>
        <button class="pubd-lb-arrow pubd-lb-prev" aria-label="Anterior" data-action="lb-prev">
          <i class="ti ti-chevron-left"></i>
        </button>
        <div class="pubd-lb-img-wrap" data-action="lb-stop">
          <img src="${imgUrl(current)}" alt="Imatge ${state.lbIdx + 1}" />
          <span class="pubd-lb-counter">${state.lbIdx + 1} / ${imgs.length}</span>
        </div>
        <button class="pubd-lb-arrow pubd-lb-next" aria-label="Següent" data-action="lb-next">
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

  // ── Like ───────────────────────────────────────────────────────
  function toggleLike() {
    state.liked = !state.liked;
    render();
  }

  // ── Render principal ─────────────────────────────────────────────
  function render() {
    if (state.loading) {
      app.innerHTML = `
        <div class="pubd-fullstate">
          <div class="pubd-spinner"></div>
          <span>Carregant event…</span>
        </div>
      `;
      return;
    }

    if (state.error || !state.pub) {
      app.innerHTML = `
        <div class="pubd-fullstate pubd-fullstate--err">
          <i class="ti ti-alert-circle"></i>
          <span>${state.error ?? "Event no trobat"}</span>
          <button class="pubd-back-btn" data-action="back-to-events">
            <i class="ti ti-arrow-left"></i> Tornar a events
          </button>
        </div>
      `;
      app.querySelector('[data-action="back-to-events"]')?.addEventListener("click", () => {
        window.location.href = "/events";
      });
      return;
    }

    const pub = state.pub;
    const imgs = getImgs();
    const heroImg = imgs[0] ? imgUrl(imgs[0]) : null;
    const estat = pub.estat ? (ESTAT_META[pub.estat] ?? { color: "var(--text-muted)", label: pub.estat }) : null;
    const dateStr = pub.data;
    const likesBase = pub.likes ?? 0;
    const likesShown = state.liked ? likesBase + 1 : likesBase;

    app.innerHTML = `
      <main class="pubd-page">

        <!-- BREADCRUMB -->
        <div class="pubd-breadcrumb">
          <a href="/events" class="pubd-bc-link">
            <i class="ti ti-arrow-left"></i> Events
          </a>
          <span class="pubd-bc-sep">/</span>
          ${pub.categoria ? `
            <a href="/events?categoria=${encodeURIComponent(pub.categoria)}" class="pubd-bc-link pubd-bc-cat">${pub.categoria}</a>
            <span class="pubd-bc-sep">/</span>
          ` : ""}
          <span class="pubd-bc-current">${pub.titol ?? ""}</span>
        </div>

        <!-- HERO -->
        <section class="pubd-hero">
          ${heroImg ? `
            <img class="pubd-hero-img" src="${heroImg}" alt="${pub.titol ?? ""}" />
            <div class="pubd-hero-overlay"></div>
          ` : ""}

          <div class="pubd-hero-content">
            <div class="pubd-hero-top">
              ${pub.categoria ? `<span class="pubd-cat-badge">${pub.categoria}</span>` : ""}
              ${estat ? `<span class="pubd-estat-badge" style="background:${estat.color}">${estat.label}</span>` : ""}
            </div>

            <h1 class="pubd-hero-title">${pub.titol ?? ""}</h1>

            ${pub.resum ? `<p class="pubd-hero-resum">${pub.resum}</p>` : ""}

            <div class="pubd-hero-meta">
              ${pub.autor ? `<span class="pubd-meta-item"><i class="ti ti-user"></i> ${pub.autor}</span>` : ""}
              ${dateStr ? `
                <span class="pubd-meta-item">
                  <i class="ti ti-calendar"></i> ${fmtDate(dateStr)}
                  <span class="pubd-meta-rel">(${tempsRelatiu(dateStr)})</span>
                </span>
              ` : ""}
              ${pub.temps_lectura ? `<span class="pubd-meta-item"><i class="ti ti-clock"></i> ${pub.temps_lectura} min de lectura</span>` : ""}
              ${pub.visualitzacions != null ? `<span class="pubd-meta-item"><i class="ti ti-eye"></i> ${pub.visualitzacions} visualitzacions</span>` : ""}
            </div>
          </div>
        </section>

        <!-- BODY -->
        <div class="pubd-body">

          <article class="pubd-article">

            ${pub.descripcio ? `
              <div class="pubd-rich-text">${pub.descripcio}</div>
            ` : ""}

            ${!pub.contingut && !pub.descripcio && pub.resum ? `
              <div class="pubd-rich-text"><p>${pub.resum}</p></div>
            ` : ""}

            ${imgs.length > 1 ? `
              <section class="pubd-section">
                <h2 class="pubd-section-title">
                  <span class="pubd-section-idx">Galeria</span>
                  <span class="pubd-section-count">${imgs.length} imatges</span>
                </h2>
                <div class="pubd-gallery">
                  ${imgs.map((img, i) => `
                    <div class="pubd-gallery-item ${i === 0 ? "pubd-gallery-item--featured" : ""}" data-gallery-index="${i}">
                      <img src="${imgUrl(img)}" alt="Imatge ${i + 1}" loading="lazy" />
                      <div class="pubd-gallery-overlay"><i class="ti ti-zoom-in"></i></div>
                    </div>
                  `).join("")}
                </div>
              </section>
            ` : ""}

            ${pub.tags?.length > 0 ? `
              <div class="pubd-tags-row">
                <i class="ti ti-tag pubd-tags-icon"></i>
                ${pub.tags.map(tag => `<span class="pubd-tag">${tag}</span>`).join("")}
              </div>
            ` : ""}

            <div class="pubd-actions">
              <button class="pubd-action-btn pubd-like ${state.liked ? "pubd-liked" : ""}" data-action="toggle-like">
                <i class="ti ${state.liked ? "ti-heart-filled" : "ti-heart"}"></i>
                ${likesShown} m'agrada
              </button>

              <button class="pubd-action-btn" data-action="share">
                <i class="ti ti-share"></i> Compartir
              </button>

              <button class="pubd-back-btn pubd-back-inline" data-action="back-to-events-inline">
                <i class="ti ti-arrow-left"></i> Tornar
              </button>
            </div>

          </article>

          <!-- SIDEBAR -->
          <aside class="pubd-sidebar">

            <div class="pubd-sidebar-card">
              <h3 class="pubd-sidebar-title">Informació</h3>
              <div class="pubd-info-rows">
                ${estat ? `
                  <div class="pubd-info-row">
                    <span class="pubd-info-label">Estat</span>
                    <span class="pubd-info-val pubd-info-estat" style="color:${estat.color}">
                      <span class="pubd-estat-dot" style="background:${estat.color}"></span>${estat.label}
                    </span>
                  </div>` : ""}
                ${pub.categoria ? `
                  <div class="pubd-info-row">
                    <span class="pubd-info-label">Categoria</span>
                    <span class="pubd-info-val">${pub.categoria}</span>
                  </div>` : ""}
                ${pub.organitzador ? `
                  <div class="pubd-info-row">
                    <span class="pubd-info-label">Organitzador/a</span>
                    <span class="pubd-info-val">${pub.organitzador}</span>
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
                    <span class="pubd-info-val" style="color:var(--pink)">${likesShown}</span>
                  </div>` : ""}
              </div>
            </div>

            ${pub.tags?.length > 0 ? `
              <div class="pubd-sidebar-card">
                <h3 class="pubd-sidebar-title">Etiquetes</h3>
                <div class="pubd-tags">
                  ${pub.tags.map(tag => `<span class="pubd-tag">${tag}</span>`).join("")}
                </div>
              </div>
            ` : ""}

            ${pub.enllacos?.length > 0 ? `
              <div class="pubd-sidebar-card">
                <h3 class="pubd-sidebar-title">Enllaços relacionats</h3>
                <div class="pubd-ext-links">
                  ${pub.enllacos.map(e => `
                    <a href="${e.url ?? e}" target="_blank" rel="noopener noreferrer" class="pubd-ext-link">
                      <i class="ti ti-external-link"></i>${e.nom ?? e.url ?? e}
                    </a>
                  `).join("")}
                </div>
              </div>
            ` : ""}

            <button class="pubd-back-btn" data-action="back-to-events">
              <i class="ti ti-arrow-left"></i> Tornar a events
            </button>

          </aside>

        </div>

      </main>
    `;

    app.querySelectorAll('[data-action="back-to-events"], [data-action="back-to-events-inline"]').forEach(btn => {
      btn.addEventListener("click", () => { window.location.href = "/events"; });
    });

    app.querySelector('[data-action="toggle-like"]')?.addEventListener("click", toggleLike);

    app.querySelector('[data-action="share"]')?.addEventListener("click", () => {
      navigator.share?.({ title: pub.titol, url: window.location.href });
    });

    app.querySelectorAll("[data-gallery-index]").forEach(el => {
      const i = Number(el.dataset.galleryIndex);
      el.addEventListener("click", () => openLightbox(i));
    });

    renderLightbox();
  }

  // ── Fetch ─────────────────────────────────────────────────────────
  async function fetchEvent() {
    window.scrollTo(0, 0);
    state.loading = true;
    render();

    if (!id) {
      state.error = "Falta l'identificador de l'event";
      state.loading = false;
      render();
      return;
    }

    try {
      let res = await fetch(`http://localhost:5000/events/${id}`);

      if (res.ok) {
        const data = await res.json();
        state.pub = data.event ?? data;
        state.loading = false;
        render();
        return;
      }

      // Fallback: agafa tots i filtra
      res = await fetch("http://localhost:5000/events");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const all = Array.isArray(data) ? data : (data.events ?? []);

      const trobat = all.find(p => String(p.id) === String(id) || p.slug === id);
      if (!trobat) throw new Error("Event no trobat");

      state.pub = trobat;
    } catch (err) {
      console.error(err);
      state.error = err.message;
    } finally {
      state.loading = false;
      render();
    }
  }

  fetchEvent();
});
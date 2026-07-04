// ============================================================
// app.js — Lògica equivalent al component React Home.jsx,
// escrita en JS vanilla. Depèn de data.js (carregar-lo abans).
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  // ── Estat global (equivalent als useState de React) ──────────────────
  const state = {
    showClock: false,
    likedYears: [],
    currentYear: timelineParagraphs[0].year,
    playedYears: [],
    publis: [],
    publiLoading: true,
    publiError: null,
    publiPage: 1,
    publiHasMore: true,
    likedPosts: [],
  };

  // ================================================================
  // RELLOTGE (equivalent a l'useEffect amb setInterval)
  // ================================================================
  const clockSection = document.querySelector(".clock-section");
  const clockCloseBtn = document.querySelector(".clock-close-inline");
  const clockTimeEl = document.querySelector(".clock-time");
  const clockDateEl = document.querySelector(".clock-date");
  const heroArrowBtn = document.querySelector(".hero-arrow-img");

  function tickClock() {
    const now = new Date();
    if (clockTimeEl) clockTimeEl.textContent = now.toLocaleTimeString("ca-ES");
    if (clockDateEl) {
      clockDateEl.textContent = now.toLocaleDateString("ca-ES", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      });
    }
  }
  tickClock();
  setInterval(tickClock, 1000);

  function setShowClock(value) {
    state.showClock = value;
    if (clockSection) clockSection.classList.toggle("open", value);
  }
  if (heroArrowBtn) heroArrowBtn.addEventListener("click", () => setShowClock(true));
  if (clockCloseBtn) clockCloseBtn.addEventListener("click", () => setShowClock(false));

  // ================================================================
  // TIMELINE
  // ================================================================
  const timelineYearsContainer = document.querySelector(".timeline-years");
  const timelineRight = document.querySelector(".timeline-right");

  function renderTimelineYears() {
    if (!timelineYearsContainer) return;
    timelineYearsContainer.innerHTML = "";
    timelineParagraphs.forEach(item => {
      const el = document.createElement("div");
      el.id = `year-${item.year}`;
      el.className = `timeline-year ${item.year === state.currentYear ? "active" : ""}`;
      el.innerHTML = `
        <span class="timeline-dot"></span>
        <span class="timeline-year-text">${item.year}</span>
      `;
      el.addEventListener("click", () => handleYearClick(item.year));
      timelineYearsContainer.appendChild(el);
    });
  }

  function renderTimelineRight() {
    if (!timelineRight) return;
    const currentItem = timelineParagraphs.find(p => p.year === state.currentYear);
    if (!currentItem) return;

    const trobansHtml = currentItem.trobans && currentItem.trobans.length > 0 ? `
      <div class="trobans-wrapper">
        <h3 class="trobans-title">Trobades d'aquest any</h3>
        <div class="trobans-list">
          ${currentItem.trobans.map((t, idx) => `
            <div class="trobans-item">
              <span class="trobans-number">${String(idx + 1).padStart(2, '0')}</span>
              <div class="trobans-content">
                <h4>${t.titol}</h4>
                <p>${t.desc}</p>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    ` : "";

    timelineRight.innerHTML = `
      <img src="images/timeline/${state.currentYear}.jpg" alt="Any ${state.currentYear}" class="timeline-inner-image" />
      <h2 class="timeline-title">${state.currentYear}</h2>
      <p class="timeline-text">${currentItem.text}</p>
      <div class="timeline-buttons">
        <button class="like-btn ${state.likedYears.includes(state.currentYear) ? "liked" : ""}" data-action="like-year">Guardar</button>
        <button class="audio-btn" data-action="play-audio">Escoltar</button>
      </div>
      ${trobansHtml}
    `;

    timelineRight.querySelector('[data-action="like-year"]')
      .addEventListener("click", () => toggleLike(state.currentYear));
    timelineRight.querySelector('[data-action="play-audio"]')
      .addEventListener("click", () => playSequentialAudio([state.currentYear]));
  }

  function handleYearClick(year) {
    state.currentYear = year;
    renderTimelineYears();
    renderTimelineRight();

    const container = timelineYearsContainer;
    const yearElement = document.getElementById(`year-${year}`);
    if (container && yearElement) {
      const containerTop = container.getBoundingClientRect().top;
      const elementTop = yearElement.getBoundingClientRect().top;
      const offset = elementTop - containerTop - container.clientHeight / 2 + yearElement.clientHeight / 2;
      container.scrollBy({ top: offset, behavior: "smooth" });
    }
  }

  function toggleLike(year) {
    if (state.likedYears.includes(year)) {
      state.likedYears = state.likedYears.filter(y => y !== year);
    } else {
      state.likedYears.push(year);
    }
    renderTimelineRight();
  }

  async function playSequentialAudio(years) {
    for (const year of years) {
      const item = timelineParagraphs.find(p => p.year === year);
      if (!item) continue;
      state.currentYear = year;
      renderTimelineYears();
      renderTimelineRight();
      if (!state.playedYears.includes(year)) state.playedYears.push(year);
      await new Promise(resolve => {
        const audio = new Audio(item.audio);
        audio.onended = resolve;
        audio.onerror = resolve;
        audio.play();
      });
    }
  }

  renderTimelineYears();
  renderTimelineRight();

  // ================================================================
  // GALERIA (mosaic + strip)
  // ================================================================
  const galleryGrid = document.querySelector(".gallery-grid");
  const galleryStripEl = document.querySelector(".gallery-strip");
  const galleryCounter = document.querySelector(".gallery-counter strong");

  function renderGallery() {
    if (galleryCounter) galleryCounter.textContent = String(galleryItems.length).padStart(2, "0");

    if (galleryGrid) {
      galleryGrid.innerHTML = galleryItems.map((item, i) => `
        <div class="gallery-item ${item.className}">
          <img src="${item.img}" alt="${item.label}" />
          <div class="gallery-overlay">
            <div class="gallery-item-meta">
              <span class="gallery-item-index">${String(i + 1).padStart(2, '0')}</span>
              <span class="gallery-item-label">${item.label}</span>
            </div>
          </div>
        </div>
      `).join("");
    }

    if (galleryStripEl) {
      galleryStripEl.innerHTML = galleryStrip.map(item => `
        <div class="gallery-strip-item">
          <img src="${item.img}" alt="${item.label}" />
          <span class="gallery-strip-label">${item.label}</span>
        </div>
      `).join("");
    }
  }
  renderGallery();

  // ================================================================
  // VIDEO CARDS (equivalent al component <VideoCard />)
  // ================================================================
  function createVideoCard(item, featured = false) {
    const wrapper = document.createElement("div");
    wrapper.className = `video-card ${featured ? "video-card--featured" : "video-card--compact"}`;

    const thumbClass = featured ? "video-thumb video-thumb--featured" : "video-thumb video-thumb--sm";
    const playBtnClass = featured ? "video-play-btn video-play-btn--lg" : "video-play-btn";
    const controlsClass = featured ? "vc-controls" : "vc-controls vc-controls--mini";

    wrapper.innerHTML = `
      <div class="${thumbClass}">
        <video src="${item.src}" muted playsinline class="vc-video"></video>
        <div class="video-overlay-dark"></div>

        <button class="${playBtnClass}" data-action="toggle-play" aria-label="Reproduir">
          <i class="ti ti-player-play"></i>
        </button>

        ${featured ? `<span class="video-cat video-cat--blue">${item.cat}</span>` : `<span class="video-duration">${item.duration}</span>`}

        <div class="${controlsClass}">
          <div class="vc-progress" data-action="seek">
            <div class="vc-progress-fill" style="width:0%"></div>
          </div>
          <div class="vc-bar">
            <button class="vc-btn" data-action="toggle-play" aria-label="Play/Pause">
              <i class="ti ti-player-play"></i>
            </button>
            ${featured ? `
              <div class="vc-volume">
                <button class="vc-btn" data-action="toggle-mute" aria-label="Silenciar">
                  <i class="ti ti-volume-3"></i>
                </button>
                <input type="range" min="0" max="1" step="0.05" value="1" class="vc-vol-slider" data-action="volume" aria-label="Volum" />
              </div>
              <span class="vc-duration">${item.duration}</span>
            ` : `
              <button class="vc-btn" data-action="toggle-mute" aria-label="Silenciar">
                <i class="ti ti-volume-3"></i>
              </button>
            `}
            <button class="vc-btn vc-fullscreen" data-action="fullscreen" aria-label="Pantalla completa">
              <i class="ti ti-maximize"></i>
            </button>
          </div>
        </div>
      </div>

      ${featured ? `
        <div class="video-info">
          <h3>${item.title}</h3>
          ${item.desc ? `<p>${item.desc}</p>` : ""}
          <div class="video-meta"><span><i class="ti ti-calendar"></i> ${item.date}</span></div>
        </div>
      ` : `
        <div class="video-info video-info--sm">
          <span class="video-cat ${item.catClass}">${item.cat}</span>
          <h4>${item.title}</h4>
          <div class="video-meta"><span><i class="ti ti-calendar"></i> ${item.date}</span></div>
        </div>
      `}
    `;

    const video = wrapper.querySelector("video");
    const playBtns = wrapper.querySelectorAll('[data-action="toggle-play"]');
    const muteBtn = wrapper.querySelector('[data-action="toggle-mute"]');
    const volumeSlider = wrapper.querySelector('[data-action="volume"]');
    const progressBar = wrapper.querySelector('[data-action="seek"]');
    const progressFill = wrapper.querySelector(".vc-progress-fill");
    const fullscreenBtn = wrapper.querySelector('[data-action="fullscreen"]');
    const controlsEl = wrapper.querySelector(featured ? ".vc-controls" : ".vc-controls--mini");
    const overlay = wrapper.querySelector(".video-overlay-dark");
    const thumbEl = wrapper.querySelector(featured ? ".video-thumb--featured" : ".video-thumb--sm");

    function setPlayIcons(playing) {
      playBtns.forEach(btn => {
        btn.classList.toggle("playing", playing);
        btn.querySelector("i").className = `ti ${playing ? "ti-player-pause" : "ti-player-play"}`;
        btn.setAttribute("aria-label", playing ? "Pausar" : "Reproduir");
      });
      if (overlay) overlay.classList.toggle("dim", playing);
    }

    function togglePlay() {
      if (video.paused) {
        video.play();
        setPlayIcons(true);
      } else {
        video.pause();
        setPlayIcons(false);
      }
    }

    playBtns.forEach(btn => btn.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePlay();
    }));

    if (thumbEl) thumbEl.addEventListener("click", togglePlay);

    if (muteBtn) {
      muteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        muteBtn.querySelector("i").className = `ti ${video.muted ? "ti-volume-3" : "ti-volume"}`;
      });
    }

    if (volumeSlider) {
      volumeSlider.addEventListener("click", (e) => e.stopPropagation());
      volumeSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        video.volume = val;
        video.muted = val === 0;
        if (muteBtn) {
          muteBtn.querySelector("i").className =
            `ti ${video.muted || val === 0 ? "ti-volume-3" : val < 0.5 ? "ti-volume-2" : "ti-volume"}`;
        }
      });
    }

    video.addEventListener("timeupdate", () => {
      if (!video.duration) return;
      progressFill.style.width = `${(video.currentTime / video.duration) * 100}%`;
    });

    video.addEventListener("ended", () => {
      setPlayIcons(false);
      progressFill.style.width = "0%";
    });

    if (progressBar) {
      progressBar.addEventListener("click", (e) => {
        e.stopPropagation();
        const rect = progressBar.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        video.currentTime = ratio * video.duration;
      });
    }

    if (fullscreenBtn) {
      fullscreenBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        video.requestFullscreen?.();
      });
    }

    if (thumbEl && controlsEl) {
      wrapper.addEventListener("mouseenter", () => controlsEl.classList.add("visible"));
      wrapper.addEventListener("mouseleave", () => {
        if (video.paused) controlsEl.classList.remove("visible");
      });
    }

    return wrapper;
  }

  function renderVideos() {
    const videosGrid = document.querySelector(".videos-grid");
    if (videosGrid) {
      videosGrid.innerHTML = "";
      const featuredItem = { ...videoSideItems[0], desc: "Cobertura completa de la Batucada de Mataró amb imatges exclusives." };
      videosGrid.appendChild(createVideoCard(featuredItem, true));

      const sidebar = document.createElement("div");
      sidebar.className = "video-sidebar";
      videoSideItems.slice(1).forEach(v => sidebar.appendChild(createVideoCard(v, false)));
      videosGrid.appendChild(sidebar);
    }

    const reelsContainer = document.querySelector(".videos-reels");
    if (reelsContainer) {
      reelsContainer.innerHTML = videoReels.map(r => `
        <div class="reel-item">
          <div class="reel-thumb">
            <img src="${r.thumb}" alt="${r.label}" />
            <div class="video-overlay-dark"></div>
            <span class="reel-duration">${r.duration}</span>
          </div>
          <span class="reel-label">${r.label}</span>
        </div>
      `).join("");
    }
  }
  renderVideos();

  // ================================================================
  // STATS
  // ================================================================
  function renderStats() {
    const statsGrid = document.querySelector(".stats-grid");
    if (!statsGrid) return;
    statsGrid.innerHTML = statsData.map((s, idx) => `
      <div class="stats-card">
        <div class="stats-card-icon">${String(idx + 1).padStart(2, '0')}</div>
        <div>
          <span class="stats-number">${s.numero}<span class="stats-plus">+</span></span>
          <span class="stats-label">${s.label}</span>
        </div>
      </div>
    `).join("");
  }
  renderStats();

  // ================================================================
  // PUBLICACIONS — feed vertical amb fetch, paginació i likes
  // ================================================================
  const hpfStateContainer = document.querySelector(".hpf-states-container") || document.querySelector(".hpf-section");
  const hpfFeed = document.querySelector(".hpf-feed");
  const hpfFooter = document.querySelector(".hpf-footer");
  const hpfLoadingBlock = document.querySelector(".hpf-loading-block");
  const hpfErrorBlock = document.querySelector(".hpf-error-block");
  const hpfEmptyBlock = document.querySelector(".hpf-empty-block");
  const hpfErrorMsg = document.querySelector(".hpf-error-msg");

  function tempsRelatiu(dateStr) {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);

    if (min < 1) return "ara mateix";
    if (min < 60) return `fa ${min} min`;
    if (h < 24) return `fa ${h}h`;
    if (d < 7) return `fa ${d} dies`;
    return new Date(dateStr).toLocaleDateString("ca-ES");
  }

  function toggleLikePost(postId) {
    if (state.likedPosts.includes(postId)) {
      state.likedPosts = state.likedPosts.filter(x => x !== postId);
    } else {
      state.likedPosts.push(postId);
    }
    renderPublicacions();
  }

  function handleLoadMore() {
    state.publiPage += 1;
    if (state.publiPage * PUBLI_PER_PAGE >= state.publis.length) state.publiHasMore = false;
    renderPublicacions();
  }

  function renderPublicacions() {
    if (hpfLoadingBlock) hpfLoadingBlock.style.display = state.publiLoading ? "flex" : "none";
    if (hpfErrorBlock) hpfErrorBlock.style.display = !state.publiLoading && state.publiError ? "flex" : "none";
    if (hpfErrorMsg && state.publiError) hpfErrorMsg.textContent = `Error: ${state.publiError}`;
    if (hpfEmptyBlock) {
      hpfEmptyBlock.style.display = !state.publiLoading && !state.publiError && state.publis.length === 0 ? "flex" : "none";
    }

    const showFeed = !state.publiLoading && !state.publiError && state.publis.length > 0;
    if (hpfFeed) hpfFeed.style.display = showFeed ? "" : "none";
    if (hpfFooter) hpfFooter.style.display = showFeed ? "" : "none";
    if (!showFeed) return;

    const visiblePublis = state.publis.slice(0, state.publiPage * PUBLI_PER_PAGE);

    hpfFeed.innerHTML = visiblePublis.map((p, idx) => {
      const postId = p.id ?? idx;
      const liked = state.likedPosts.includes(postId);
      const dateStr = p.data ?? p.fecha ?? p.created_at;
      const imgSrc = p.imatge ?? p.imagen ?? p.img;
      const titol = p.titol ?? p.titulo ?? p.title ?? "Sin título";
      const resum = p.resum ?? p.resumen ?? p.excerpt ?? "";
      const cat = p.categoria ?? p.category ?? "";
      const likes = p.likes ?? 0;

      return `
        <article class="hpf-vpost" data-post-id="${postId}">
          <div class="hpf-vpost-top">
            <div class="hpf-vpost-user">
              <div class="hpf-vpost-avatar">
                <div class="hpf-vpost-avatar-inner"><img src="/images/logo1.png" alt="TM" /></div>
              </div>
              <div class="hpf-vpost-meta">
                <span class="hpf-vpost-username">Tradicions Mataró</span>
                <span class="hpf-vpost-time">${tempsRelatiu(dateStr)}</span>
              </div>
            </div>
            ${cat ? `<span class="hpf-vpost-cat">${cat}</span>` : ""}
          </div>

          <div class="hpf-vpost-img-wrap">
            ${imgSrc
              ? `<img src="${imgSrc}" alt="${titol}" loading="lazy" />`
              : `<div class="hpf-vpost-img-placeholder"><i class="ti ti-photo"></i></div>`}
          </div>

          <div class="hpf-vpost-body">
            <h3 class="hpf-vpost-title">${titol}</h3>
            ${resum ? `<p class="hpf-vpost-resum">${resum}</p>` : ""}
          </div>

          <div class="hpf-vpost-actions">
            <button class="hpf-vpost-action hpf-like" data-action="like-post">
              <i class="ti ${liked ? "ti-heart-filled" : "ti-heart"}" style="${liked ? "color:var(--pink)" : ""}"></i>
              ${liked ? likes + 1 : likes}
            </button>
            <button class="hpf-vpost-action">
              <i class="ti ti-message-circle"></i> ${p.comentaris ?? 0}
            </button>
            <button class="hpf-vpost-action"><i class="ti ti-send"></i></button>
            <span class="hpf-vpost-spacer"></span>
            <a href="/publicacions/${postId}" class="hpf-vpost-read">Leer <i class="ti ti-arrow-right"></i></a>
          </div>
        </article>
      `;
    }).join("");

    hpfFeed.querySelectorAll('[data-action="like-post"]').forEach(btn => {
      const postId = btn.closest(".hpf-vpost").dataset.postId;
      btn.addEventListener("click", () => toggleLikePost(isNaN(postId) ? postId : Number(postId)));
    });

    const countLabel = document.querySelector(".hpf-count-label");
    if (countLabel) {
      countLabel.innerHTML = `<strong>${visiblePublis.length}</strong> de <strong>${state.publis.length}</strong> publicacions`;
    }

    const loadWrap = document.querySelector(".hpf-load-wrap");
    let loadBtn = document.querySelector(".hpf-load-btn");
    if (loadBtn) loadBtn.remove();
    if (loadWrap) {
      if (state.publiHasMore) {
        loadBtn = document.createElement("button");
        loadBtn.className = "hpf-load-btn";
        loadBtn.textContent = "Carregar més";
        loadBtn.addEventListener("click", handleLoadMore);
      } else {
        loadBtn = document.createElement("a");
        loadBtn.href = "/publicaciones";
        loadBtn.className = "hpf-load-btn";
        loadBtn.textContent = "Veure totes";
      }
      loadWrap.appendChild(loadBtn);
    }
  }

  async function fetchPublicacions() {
    state.publiLoading = true;
    renderPublicacions();
    try {
      const res = await fetch("https://backend-tradicions.onrender.com/publi");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const all = Array.isArray(data) ? data : (data.publicacions ?? []);
      state.publis = all;
      state.publiHasMore = all.length > PUBLI_PER_PAGE;
    } catch (err) {
      state.publiError = err.message;
    } finally {
      state.publiLoading = false;
      renderPublicacions();
    }
  }

  fetchPublicacions();

  // Mostrar el contenidor principal (equivalent a `showContent`)
  document.querySelector(".home-container")?.classList.add("show");
});
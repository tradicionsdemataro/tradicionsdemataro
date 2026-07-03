// quisom.js
// Renderitza les seccions dinàmiques de "Qui Som" i porta la lògica
// del reproductor de vídeo (equivalent vanilla del component VideoCard.jsx)

/* ===========================================================
   1. CONSTRUCCIÓ DEL MARKUP DE CADA TARGETA DE VÍDEO
=========================================================== */

function buildControlsMarkup(mini, duration) {
  return `
    <div class="vc-controls ${mini ? "vc-controls--mini" : ""}">
      <div class="vc-progress">
        <div class="vc-progress-fill" style="width:0%"></div>
      </div>
      <div class="vc-bar">
        <button class="vc-btn vc-play-btn" aria-label="Play/Pause">
          <i class="ti ti-player-play"></i>
        </button>
        <div class="vc-volume">
          <button class="vc-btn vc-mute-btn" aria-label="Silenciar">
            <i class="ti ti-volume-3"></i>
          </button>
          ${mini ? "" : `
          <input type="range" min="0" max="1" step="0.05" value="1"
                 class="vc-vol-slider" aria-label="Volum" />`}
        </div>
        ${mini ? "" : `<span class="vc-duration">${duration}</span>`}
        <button class="vc-btn vc-fullscreen" aria-label="Pantalla completa">
          <i class="ti ti-maximize"></i>
        </button>
      </div>
    </div>
  `;
}

function buildFeaturedCard(item, desc) {
  const card = document.createElement("div");
  card.className = "video-card video-card--featured";
  card.innerHTML = `
    <div class="video-thumb video-thumb--featured">
      <video class="vc-video" src="${item.thumb}" muted playsinline></video>
      <div class="video-overlay-dark"></div>
      <button class="video-play-btn video-play-btn--lg" aria-label="Reproduir">
        <i class="ti ti-player-play"></i>
      </button>
      <span class="video-cat video-cat--blue">${item.cat}</span>
      ${buildControlsMarkup(false, item.duration)}
    </div>
    <div class="video-info">
      <h3>${item.title}</h3>
      ${desc ? `<p>${desc}</p>` : ""}
      <div class="video-meta">
        <span><i class="ti ti-calendar"></i> ${item.date}</span>
      </div>
    </div>
  `;
  wireVideoCard(card, true);
  return card;
}

function buildCompactCard(item) {
  const card = document.createElement("div");
  card.className = "video-card video-card--compact";
  card.innerHTML = `
    <div class="video-thumb video-thumb--sm">
      <video class="vc-video" src="${item.thumb}" muted playsinline></video>
      <div class="video-overlay-dark"></div>
      <button class="video-play-btn" aria-label="Reproduir">
        <i class="ti ti-player-play"></i>
      </button>
      <span class="video-duration">${item.duration}</span>
      ${buildControlsMarkup(true, item.duration)}
    </div>
    <div class="video-info video-info--sm">
      <span class="video-cat ${item.catClass}">${item.cat}</span>
      <h4>${item.title}</h4>
      <div class="video-meta">
        <span><i class="ti ti-calendar"></i> ${item.date}</span>
      </div>
    </div>
  `;
  wireVideoCard(card, false);
  return card;
}

/* ===========================================================
   2. LÒGICA DEL REPRODUCTOR (equivalent al useState/useRef de React)
=========================================================== */

function wireVideoCard(card) {
  const video       = card.querySelector(".vc-video");
  const thumb       = card.querySelector(".video-thumb");
  const overlay     = card.querySelector(".video-overlay-dark");
  const playBtns    = card.querySelectorAll(".video-play-btn, .vc-play-btn");
  const muteBtn     = card.querySelector(".vc-mute-btn");
  const volSlider   = card.querySelector(".vc-vol-slider");
  const progressBar = card.querySelector(".vc-progress");
  const progressFill = card.querySelector(".vc-progress-fill");
  const fullscreenBtn = card.querySelector(".vc-fullscreen");
  const controls    = card.querySelector(".vc-controls");

  const setIcon = (btn, iconClass) => {
    const i = btn.querySelector("i");
    if (i) i.className = `ti ${iconClass}`;
  };

  const setPlayingState = (playing) => {
    playBtns.forEach((btn) => {
      btn.classList.toggle("playing", playing);
      setIcon(btn, playing ? "ti-player-pause" : "ti-player-play");
    });
    overlay.classList.toggle("dim", playing);
    controls.classList.toggle("visible", playing);
  };

  const togglePlay = () => {
    if (video.paused) {
      video.play().then(() => setPlayingState(true)).catch(() => {});
    } else {
      video.pause();
      setPlayingState(false);
    }
  };

  const updateMuteIcon = () => {
    const vol = video.volume;
    let icon = "ti-volume";
    if (video.muted || vol === 0) icon = "ti-volume-3";
    else if (vol < 0.5) icon = "ti-volume-2";
    setIcon(muteBtn, icon);
  };

  // Clic sobre la miniatura -> play/pause
  thumb.addEventListener("click", togglePlay);

  // Botons de play (tant el gran com el de la barra de controls)
  playBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePlay();
    });
  });

  // Mut
  if (muteBtn) {
    muteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      updateMuteIcon();
    });
  }

  // Volum (només targeta destacada, no compacta)
  if (volSlider) {
    volSlider.addEventListener("click", (e) => e.stopPropagation());
    volSlider.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      video.volume = val;
      video.muted = val === 0;
      updateMuteIcon();
    });
  }

  // Barra de progrés
  video.addEventListener("timeupdate", () => {
    if (video.duration) {
      progressFill.style.width = `${(video.currentTime / video.duration) * 100}%`;
    }
  });

  if (progressBar) {
    progressBar.addEventListener("click", (e) => {
      e.stopPropagation();
      const rect = progressBar.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      video.currentTime = ratio * video.duration;
    });
  }

  // Pantalla completa
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (video.requestFullscreen) video.requestFullscreen();
    });
  }

  // Fi del vídeo
  video.addEventListener("ended", () => {
    setPlayingState(false);
    progressFill.style.width = "0%";
  });

  // Mostrar/amagar controls en passar el ratolí
  card.addEventListener("mouseenter", () => controls.classList.add("visible"));
  card.addEventListener("mouseleave", () => {
    if (video.paused) controls.classList.remove("visible");
  });
}

/* ===========================================================
   3. RENDERITZAT DE LES SECCIONS DINÀMIQUES
=========================================================== */

function renderVideos() {
  const featuredWrap = document.getElementById("qs-video-featured");
  const sidebarWrap  = document.getElementById("qs-video-sidebar");
  const reelsWrap     = document.getElementById("qs-video-reels");

  if (featuredWrap) {
    featuredWrap.appendChild(
      buildFeaturedCard(
        videoSideItems[0],
        "Cobertura completa de la Batucada de Mataró amb imatges exclusives."
      )
    );
  }

  if (sidebarWrap) {
    videoSideItems.slice(1).forEach((item) => {
      sidebarWrap.appendChild(buildCompactCard(item));
    });
  }

  if (reelsWrap) {
    videoReels.forEach((r) => {
      const el = document.createElement("div");
      el.className = "reel-item";
      el.innerHTML = `
        <div class="reel-thumb">
          <img src="${r.thumb}" alt="${r.label}" />
          <div class="video-overlay-dark"></div>
          <span class="reel-duration">${r.duration}</span>
        </div>
        <span class="reel-label">${r.label}</span>
      `;
      reelsWrap.appendChild(el);
    });
  }
}

function renderTimeline() {
  const wrap = document.getElementById("qs-timeline");
  if (!wrap) return;

  timelineItems.forEach((item) => {
    const el = document.createElement("div");
    el.className = "qs-tl-item";
    el.innerHTML = `
      <span class="qs-tl-year">${item.year}</span>
      <div class="qs-tl-dot"></div>
      <div class="qs-tl-right">
        <p class="qs-tl-text">${item.text}</p>
        ${item.img ? `
        <div class="qs-tl-img">
          <img src="${item.img}" alt="${item.year}" />
        </div>` : ""}
      </div>
    `;
    wrap.appendChild(el);
  });
}

function renderObjectius() {
  const wrap = document.getElementById("qs-objectius");
  if (!wrap) return;

  objectius.forEach((o) => {
    const el = document.createElement("div");
    el.className = "qs-obj-card";
    el.innerHTML = `
      <span class="qs-obj-emoji">${o.emoji}</span>
      <h3>${o.titol}</h3>
      <p>${o.desc}</p>
    `;
    wrap.appendChild(el);
  });
}

function renderValors() {
  const wrap = document.getElementById("qs-valors");
  if (!wrap) return;

  valors.forEach((v, i) => {
    const el = document.createElement("div");
    el.className = "qs-val-card";
    el.innerHTML = `
      <div class="qs-val-top">
        <span class="qs-val-num">${String(i + 1).padStart(2, "0")}</span>
        <span class="qs-val-emoji">${v.emoji}</span>
      </div>
      <h3>${v.titol}</h3>
      <p>${v.desc}</p>
    `;
    wrap.appendChild(el);
  });
}

function renderProjectes() {
  const wrap = document.getElementById("qs-projectes");
  if (!wrap) return;

  projectes.forEach((p) => {
    const el = document.createElement("div");
    el.className = "qs-proj-card";
    el.innerHTML = `
      <div class="qs-proj-img">
        <img src="${p.img}" alt="${p.titol}" />
        <span class="qs-proj-emoji-badge">${p.emoji}</span>
      </div>
      <div class="qs-proj-body">
        <h3>${p.titol}</h3>
        <p>${p.desc}</p>
      </div>
      <a href="${p.url}" class="qs-proj-btn" target="_blank" rel="noopener noreferrer">
        Visita →
      </a>
    `;
    wrap.appendChild(el);
  });
}

/* ===========================================================
   4. INICIALITZACIÓ
=========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  renderVideos();
  renderTimeline();
  renderObjectius();
  renderValors();
  renderProjectes();
});
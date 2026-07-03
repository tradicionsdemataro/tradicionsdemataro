// ============================================================
// overlay.js — Equivalent a Overlay.jsx
// Depèn de search-content.js (renderSearchContent) i d'un
// contenidor #search-overlay-root al HTML.
// Exposa window.openSearchOverlay() / window.closeSearchOverlay()
// ============================================================

(function () {
  const root = document.getElementById("search-overlay-root");
  let isOpen = false;
  let isClosing = false;
  let escHandler = null;

  function renderOverlay() {
    if (!root) return;

    if (!isOpen && !isClosing) {
      root.innerHTML = "";
      return;
    }

    root.innerHTML = `
      <div class="search-overlay ${isOpen && !isClosing ? "activo" : ""} ${isClosing ? "cerrando" : ""}">
        <div class="navbar-clone"></div>
        <div class="overlay-backdrop" data-action="close-overlay"></div>

        <button class="overlay-close" aria-label="Tancar cerca" data-action="close-overlay">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="2" y1="2" x2="14" y2="14"></line>
            <line x1="14" y1="2" x2="2" y2="14"></line>
          </svg>
        </button>

        <div class="search-content-mount"></div>
      </div>
    `;

    root.querySelectorAll('[data-action="close-overlay"]').forEach(el =>
      el.addEventListener("click", closeSearchOverlay)
    );

    const mount = root.querySelector(".search-content-mount");
    if (mount) renderSearchContent(mount, closeSearchOverlay);
  }

  function openSearchOverlay() {
    isOpen = true;
    isClosing = false;
    document.body.style.overflow = "hidden";
    renderOverlay();

    escHandler = (e) => {
      if (e.key === "Escape" && isOpen) closeSearchOverlay();
    };
    window.addEventListener("keydown", escHandler);
  }

  function closeSearchOverlay() {
    if (!isOpen) return;
    isClosing = true;
    renderOverlay();
    setTimeout(() => {
      isOpen = false;
      isClosing = false;
      document.body.style.overflow = "";
      renderOverlay();
    }, 450);

    if (escHandler) {
      window.removeEventListener("keydown", escHandler);
      escHandler = null;
    }
  }

  // Exposats globalment perquè navbar.js els pugui cridar
  window.openSearchOverlay = openSearchOverlay;
  window.closeSearchOverlay = closeSearchOverlay;
})();
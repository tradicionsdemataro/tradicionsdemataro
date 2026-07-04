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

  function notifyToggle(open) {
    window.dispatchEvent(new CustomEvent("search-overlay-toggle", { detail: { open } }));
  }

  function renderOverlay() {
    if (!root) return;

    if (!isOpen && !isClosing) {
      root.innerHTML = "";
      return;
    }

    // IMPORTANT: el botó de tancar es renderitza FORA de .search-overlay,
    // com a germà directe dins de #root. Si estigués dins de .search-overlay
    // (que té animació/transform per obrir-tancar), el position:fixed del
    // botó deixaria de referenciar-se al viewport i el clic no arribaria bé.
    root.innerHTML = `
      <div class="search-overlay ${isOpen && !isClosing ? "activo" : ""} ${isClosing ? "cerrando" : ""}">
        <div class="navbar-clone"></div>
        <div class="overlay-backdrop" data-action="close-overlay"></div>
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
    if (isOpen) return;
    isOpen = true;
    isClosing = false;
    document.body.style.overflow = "hidden";
    renderOverlay();
    notifyToggle(true);

    escHandler = (e) => {
      if (e.key === "Escape" && isOpen) closeSearchOverlay();
    };
    window.addEventListener("keydown", escHandler);
  }

  function closeSearchOverlay() {
    if (!isOpen) return;
    isClosing = true;
    renderOverlay();
    notifyToggle(false);
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
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

    root.innerHTML = `
      <div class="search-overlay ${isOpen && !isClosing ? "activo" : ""} ${isClosing ? "cerrando" : ""}">
        <div class="navbar-clone"></div>
        <div class="overlay-backdrop" data-action="close-overlay"></div>

        <button
          type="button"
          class="overlay-close"
          aria-label="Tancar cerca"
          data-action="close-overlay"
          style="all:revert; position:fixed !important; top:20px !important; right:20px !important; z-index:2147483647 !important; width:44px !important; height:44px !important; min-width:44px !important; min-height:44px !important; border-radius:50% !important; border:3px solid #F2D57E !important; background-color:#1F1E40 !important; color:#ffffff !important; font-size:20px !important; font-weight:bold !important; line-height:44px !important; text-align:center !important; display:block !important; cursor:pointer !important; box-shadow:0 4px 18px rgba(0,0,0,0.5) !important; opacity:1 !important; visibility:visible !important; pointer-events:auto !important; padding:0 !important; margin:0 !important;"
        >✕</button>

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
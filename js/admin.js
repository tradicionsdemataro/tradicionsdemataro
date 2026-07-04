// ============================================================
// admin.js — Component principal (equivalent al export default
// AdminPanel de AdminPanel.jsx). Depèn de admin-core.js i
// admin-sections.js.
// ============================================================

const SECTIONS = [
  { id: "dashboard", label: "Dashboard", icon: "ti-layout-dashboard" },
  { id: "events", label: "Esdeveniments", icon: "ti-calendar-event" },
  { id: "projectes", label: "Projectes", icon: "ti-folder" },
  { id: "publicacions", label: "Publicacions", icon: "ti-file-text" },
  { id: "ressenyes", label: "Ressenyes", icon: "ti-message-star" },
  { id: "solicituds", label: "Sol·licituds", icon: "ti-users" },
  { id: "usuaris", label: "Usuaris", icon: "ti-users-group" },
  { id: "multimedia", label: "Multimedia", icon: "ti-photo" },
  { id: "editor-json", label: "Editor JSON", icon: "ti-code" },
];

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("admin-root");
  if (!root) return;

  root.innerHTML = `<div class="adm-auth-check"><div class="adm-spin"></div><span>Verificant permisos…</span></div>`;

  checkAdminAuth().then(user => {
    if (!user) {
      window.location.href = "https://tradicionsdemataro.github.io/tradicionsdemataro/";
      return;
    }
    renderApp(root, user);
  });
});

// ── Auth (equivalent a useAdminAuth) ────────────────────────────────
async function checkAdminAuth() {
  const token = getAdminToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API}api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    const data = await res.json();
    const u = data.user ?? data;
    return (u.rol === "admin" || u.role === "admin") ? u : null;
  } catch {
    return null;
  }
}

// ── App shell ────────────────────────────────────────────────────
function renderApp(root, user) {
  const state = { active: "dashboard", sideOpen: false };

  function navTo(id) {
    state.active = id;
    state.sideOpen = false;
    renderShell();
    mountSection();
  }

  function renderShell() {
    const currentSection = SECTIONS.find(s => s.id === state.active);

    root.innerHTML = `
      <div class="adm-root">
        <aside class="adm-side${state.sideOpen ? " adm-side--open" : ""}">
          <div class="adm-side__brand">
            <span class="adm-side__logo">TM</span>
            <div>
              <div class="adm-side__name">Tradicions Mataró</div>
              <div class="adm-side__role">Panel d'administració</div>
            </div>
          </div>
          <nav class="adm-nav">
            <div class="adm-nav__section-lbl">Menú principal</div>
            ${SECTIONS.map(s => `
              <button class="adm-nav__item${state.active === s.id ? " adm-nav__item--active" : ""}" data-nav="${s.id}">
                <i class="ti ${s.icon}"></i><span>${s.label}</span>
                ${state.active === s.id ? `<i class="ti ti-chevron-right adm-nav__arrow"></i>` : ""}
              </button>
            `).join("")}
          </nav>
          <div class="adm-side__foot">
            <div class="adm-side__user">
              <div class="adm-side__avatar">${(user.nom ?? user.name ?? user.email ?? "A").charAt(0).toUpperCase()}</div>
              <div class="adm-side__user-info">
                <div class="adm-side__uname">${user.nom ?? user.name ?? user.email}</div>
                <div class="adm-side__urole"><i class="ti ti-shield-check"></i>Administrador/a</div>
              </div>
            </div>
            <a href="/" target="_blank" rel="noopener noreferrer" class="adm-side__view-web">
              <i class="ti ti-world"></i>Veure web<i class="ti ti-arrow-up-right"></i>
            </a>
          </div>
        </aside>

        ${state.sideOpen ? `<div class="adm-side-backdrop" data-action="close-side"></div>` : ""}

        <main class="adm-main">
          <header class="adm-topbar">
            <button class="adm-menu-btn" data-action="toggle-side" title="Obrir menú"><i class="ti ti-menu-2"></i></button>
            <nav class="adm-topbar__breadcrumb">
              <span class="adm-topbar__bc-home"><i class="ti ti-home"></i></span>
              <i class="ti ti-chevron-right adm-topbar__bc-sep"></i>
              <span class="adm-topbar__bc-current"><i class="ti ${currentSection?.icon}"></i>${currentSection?.label}</span>
            </nav>
            <div class="adm-topbar__right">
              <a href="/" target="_blank" rel="noopener noreferrer" class="adm-topbar__site">
                <i class="ti ti-external-link"></i><span>Veure web</span>
              </a>
            </div>
          </header>
          <div class="adm-content" data-role="content-mount"></div>
        </main>
      </div>
    `;

    root.querySelectorAll("[data-nav]").forEach(btn => btn.addEventListener("click", () => navTo(btn.dataset.nav)));
    root.querySelector('[data-action="toggle-side"]')?.addEventListener("click", () => {
      state.sideOpen = !state.sideOpen;
      renderShell();
      mountSection();
    });
    root.querySelector('[data-action="close-side"]')?.addEventListener("click", () => {
      state.sideOpen = false;
      renderShell();
      mountSection();
    });
  }

  function mountSection() {
    const mount = root.querySelector('[data-role="content-mount"]');
    if (!mount) return;
    switch (state.active) {
      case "dashboard": initDashboard(mount, navTo); break;
      case "events": initEvents(mount); break;
      case "projectes": initProjectes(mount); break;
      case "publicacions": initPublicacions(mount); break;
      case "ressenyes": initRessenyes(mount); break;
      case "solicituds": initSolicituds(mount); break;
      case "usuaris": initUsuaris(mount); break;
      case "multimedia": initMultimedia(mount); break;
      case "editor-json": initEditorJSON(mount); break;
    }
  }

  renderShell();
  mountSection();
}
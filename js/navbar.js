// ============================================================
// navbar.js — Equivalent a Navbar.jsx
// Depèn de overlay.js (window.openSearchOverlay) i d'un
// contenidor <header id="navbar"></header> al HTML.
// ============================================================

(function () {
  const DEFAULT_AVATAR = "/images/default.jpg";
  const SEARCH_ICON = "https://tradicionsdemataro.github.io/tradicionsdemataro/images/search.png";
  const SEARCH_CLOSE_ICON = "https://tradicionsdemataro.github.io/tradicionsdemataro/images/searchclose.png";
  const SEARCH_ICON_MOBILE = "https://tradicionsdemataro.github.io/tradicionsdemataro/images/search.png";
  const SEARCH_CLOSE_ICON_MOBILE = "https://tradicionsdemataro.github.io/tradicionsdemataro/images/searchclose.png";

  const root = document.getElementById("navbar");
  if (!root) return;

  const nb = {
    menuOpen: false,
    isMobile: window.innerWidth < 850,
    token: localStorage.getItem("token"),
    categorias: [],
    categoriesPubli: [],
    categoriesEvents: [],
    user: null,
    isSearchOpen: false,
  };

  async function fetchCategorias() {
    try {
      const res = await fetch("https://backend-tradicions.onrender.com/projectes");
      const data = await res.json();
      nb.categorias = [...new Set(data.projectes.map(p => p.categoria))];
      render();
    } catch (error) {
      console.error("Error carregant categories:", error);
    }
  }

  async function fetchCategoriesPubli() {
    try {
      const res = await fetch("https://backend-tradicions.onrender.com/publi");
      const data = await res.json();
      nb.categoriesPubli = [...new Set(
        (Array.isArray(data) ? data : data.publicacions || [])
          .map(p => p.categoria)
          .filter(Boolean)
      )];
      render();
    } catch (error) {
      console.error("Error carregant categories de publicacions:", error);
    }
  }

  async function fetchCategoriesEvents() {
    try {
      const res = await fetch("https://backend-tradicions.onrender.com/events");
      const data = await res.json();
      const eventsArray = Array.isArray(data) ? data : data.events || data.data || [];
      nb.categoriesEvents = [...new Set(
        eventsArray.map(e => e.categoria || e.category || e.type).filter(Boolean)
      )];
      render();
    } catch (error) {
      console.error("Error carregant categories events:", error);
    }
  }

  async function fetchUser() {
    if (!nb.token) return;
    try {
      const res = await fetch("https://backend-tradicions.onrender.com/api/auth/perfil", {
        method: "POST",
        headers: { Authorization: `Bearer ${nb.token}` },
      });
      const data = await res.json();
      nb.user = data.user ?? data.data ?? data;
      render();
    } catch (err) {
      console.error("Error carregant usuari:", err);
    }
  }

  function dropdownLinks(categories, basePath) {
    return categories.map(categoria => `
      <a href="${basePath}?categoria=${encodeURIComponent(categoria)}">${categoria}</a>
    `).join("");
  }

  function paginesDropdown() {
    return `
      <a href="https://tradicionsdemataro.github.io/tradicionsdemataro/">HOME</a>
      <a href="https://tradicionsdemataro.github.io/tradicionsdemataro/quisom.html">QUI SOM</a>
      <a href="https://tradicionsdemataro.github.io/tradicionsdemataro/mapa.html">MAPA D'EVENTS</a>
      <a href="https://tradicionsdemataro.github.io/tradicionsdemataro/agenda.html">AGENDA</a>
      <a href="https://tradicionsdemataro.github.io/tradicionsdemataro/identitat.html">IDENTITAT CORPORETIVA</a>
      <a href="https://tradicionsdemataro.github.io/tradicionsdemataro/avis.html">CRÈDITS I SUBJECTE</a>
      <a href="https://tradicionsdemataro.github.io/tradicionsdemataro/links.html">LINKS D'INTERÈS</a>
    `;
  }

  function equipDropdown() {
    return `
      <a href="https://tradicionsdemataro.github.io/tradicionsdemataro/equip.html">EQUIP</a>
      <a href="https://tradicionsdemataro.github.io/tradicionsdemataro/uneixte.html">UNEIXTE</a>
    `;
  }

  function projectesDropdown() {
    return `<a href="https://tradicionsdemataro.github.io/tradicionsdemataro/projectes.html">TOTS</a>${dropdownLinks(nb.categorias, "/projectes")}`;
  }

  function publicacionsDropdown() {
    return `<a href="https://tradicionsdemataro.github.io/tradicionsdemataro/publicacions.html">TOTES</a>${dropdownLinks(nb.categoriesPubli, "/publicacions")}`;
  }

  function eventsDropdown() {
    return `<a href="https://tradicionsdemataro.github.io/tradicionsdemataro/events.html">TOTS</a>${dropdownLinks(nb.categoriesEvents, "/events")}`;
  }

  function socialsDropdown() {
    return `
      <div class="dropdown-content socials-dropdown">
        <a href="https://www.instagram.com/tradicionsdemataro" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/1384/1384063.png" alt="Instagram" class="social-icon" />
          Instagram
        </a>
        <a href="https://www.tiktok.com/@tradicionsdemataro" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/3046/3046125.png" alt="TikTok" class="social-icon" />
          TikTok
        </a>
        <a href="https://www.youtube.com/channel/UCpMtIIlyod3HaPb5Lwl52qw" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" class="social-icon" />
          YouTube
        </a>
        <a href="https://twitter.com/tradicionsdemataro" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" class="social-icon" />
          Twitter
        </a>
        <a href="https://www.threads.com/login/?next=https%3A%2F%2Fwww.threads.com%2F%40tradicionsdemataro%C3%A7%2F" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn-icons-png.flaticon.com/512/5968/5968958.png" alt="Threads" class="social-icon" />
          Threads
        </a>
        <div class="spotify-divider">Playlist oficial</div>
        <div class="spotify-embed">
          <iframe
            src="https://open.spotify.com/embed/playlist/0PnwUnk7lRYI1h4q8RT9XJ?utm_source=generator&theme=0"
            width="100%" height="352" frameborder="0" allowfullscreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy" title="Playlist de Tradicions de Mataró"></iframe>
        </div>
      </div>
    `;
  }

  function authItem() {
    if (!nb.token) {
      return `<li><a href="https://tradicionsdemataro.github.io/tradicionsdemataro/auth.html">LOGIN</a></li>`;
    }
    return `
      <li class="dropdown profile-dropdown">
        <button class="profile-btn">
          <img src="${nb.user?.avatar || DEFAULT_AVATAR}" alt="Perfil" class="navbar-avatar" />
        </button>
        <div class="dropdown-content profile-menu">
          <a href="https://tradicionsdemataro.github.io/tradicionsdemataro/perfil.html"><i class="ti ti-user"></i> Perfil</a>
          <a href="#" class="logout-dropdown-btn" data-action="logout"><i class="ti ti-logout"></i> Tancar sessió</a>
        </div>
      </li>
    `;
  }

  function logoStrip() {
    return `
      <img src="https://tradicionsdemataro.github.io/tradicionsdemataro/images/logo2.jpg" alt="Logo 1" />
      <img src="https://tradicionsdemataro.github.io/tradicionsdemataro/images/logo3.png" alt="Logo 2" />
      <img src="https://tradicionsdemataro.github.io/tradicionsdemataro/images/logo4.png" alt="Logo 3" />
      <img src="https://tradicionsdemataro.github.io/tradicionsdemataro/images/logo5.png" alt="Logo 4" />
      <img src="https://tradicionsdemataro.github.io/tradicionsdemataro/images/logo6.png" alt="Logo 5" />
      <img src="https://tradicionsdemataro.github.io/tradicionsdemataro/images/logo7.png" alt="Logo 6" />
    `;
  }

  function render() {
    const desktopMenu = !nb.isMobile ? `
      <ul class="nav-options desktop-only">
        <div class="search-container">
          <button type="button" class="search-toggle" data-action="toggle-search">
            <img src="${nb.isSearchOpen ? SEARCH_CLOSE_ICON : SEARCH_ICON}" alt="Buscar" />
          </button>
        </div>

        <li class="dropdown">
          <button class="dropbtn">PÀGINES ▾</button>
          <div class="dropdown-content">${paginesDropdown()}</div>
        </li>
        <li class="dropdown">
          <button class="dropbtn">EQUIP ▾</button>
          <div class="dropdown-content">${equipDropdown()}</div>
        </li>
        <li class="dropdown">
          <button class="dropbtn">PROJECTES ▾</button>
          <div class="dropdown-content">${projectesDropdown()}</div>
        </li>
        <li class="dropdown">
          <button class="dropbtn">PUBLICACIONS ▾</button>
          <div class="dropdown-content">${publicacionsDropdown()}</div>
        </li>
        <li class="dropdown">
          <button class="dropbtn">EVENTS ▾</button>
          <div class="dropdown-content">${eventsDropdown()}</div>
        </li>
        <li><a href="https://tradicionsdemataro.github.io/tradicionsdemataro/contacte.html">CONTACTE</a></li>
        <li class="dropdown">
          <button class="dropbtn">SOCIALS ▾</button>
          ${socialsDropdown()}
        </li>
        ${authItem()}
      </ul>
    ` : "";

    const mobileMenu = (nb.isMobile && nb.menuOpen) ? `
      <div class="mobile-menu open">

        <button type="button" class="search-toggle mobile-search-toggle" data-action="toggle-search-mobile">
          <img src="${nb.isSearchOpen ? SEARCH_CLOSE_ICON_MOBILE : SEARCH_ICON_MOBILE}" alt="Buscar" />
        </button>

        <div class="yellow-container">${logoStrip()}</div>

        <ul class="mobile-options">
          <li class="dropdown">
            <button class="dropbtn">PÀGINES</button>
            <div class="dropdown-content">${paginesDropdown()}</div>
          </li>
          <li class="dropdown">
            <button class="dropbtn">EQUIP</button>
            <div class="dropdown-content">${equipDropdown()}</div>
          </li>
          <li class="dropdown">
            <button class="dropbtn">PROJECTES ▾</button>
            <div class="dropdown-content">${projectesDropdown()}</div>
          </li>
          <li class="dropdown">
            <button class="dropbtn">PUBLICACIONS ▾</button>
            <div class="dropdown-content">${publicacionsDropdown()}</div>
          </li>
          <li class="dropdown">
            <button class="dropbtn">EVENTS ▾</button>
            <div class="dropdown-content">${eventsDropdown()}</div>
          </li>
          <li><a href="/contacte">CONTACTE</a></li>
          <li class="dropdown">
            <button class="dropbtn">SOCIALS ▾</button>
            ${socialsDropdown()}
          </li>
          <li><a href="https://tradicionsdemataro.github.io/tradicionsdemataro/login.html">LOGIN</a></li>
        </ul>
      </div>
    ` : "";

    root.innerHTML = `
      <div class="page-container">
        ${!nb.isMobile ? `<div class="yellow-container desktop-only">${logoStrip()}</div>` : ""}

        <nav class="navbar ${nb.menuOpen ? "menu-open" : ""}">
          ${nb.isMobile ? `
            <button class="menu-toggle mobile-only" data-action="toggle-menu">☰</button>
          ` : ""}
          ${desktopMenu}
          ${mobileMenu}
        </nav>
      </div>
    `;

    attachHandlers();
  }

  function attachHandlers() {
    root.querySelector('[data-action="toggle-menu"]')?.addEventListener("click", () => {
      nb.menuOpen = !nb.menuOpen;
      render();
    });
    root.querySelector('[data-action="close-menu"]')?.addEventListener("click", () => {
      nb.menuOpen = false;
      render();
    });
    root.querySelector('[data-action="toggle-search"]')?.addEventListener("click", () => {
      // Toggle optimista: la icona canvia a l'instant, no espera l'event de l'overlay
      nb.isSearchOpen = !nb.isSearchOpen;
      render();
      if (nb.isSearchOpen) {
        window.openSearchOverlay?.();
      } else {
        window.closeSearchOverlay?.();
      }
    });
    root.querySelector('[data-action="toggle-search-mobile"]')?.addEventListener("click", () => {
      nb.isSearchOpen = !nb.isSearchOpen;
      if (nb.isSearchOpen) {
        nb.menuOpen = false;
        render();
        window.openSearchOverlay?.();
      } else {
        render();
        window.closeSearchOverlay?.();
      }
    });
    root.querySelector('[data-action="logout"]')?.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      window.location.href = "https://tradicionsdemataro.github.io/tradicionsdemataro/";
    });
  }

  // Font de veritat: sincronitza la icona quan l'overlay es tanca
  // per altres vies (Esc, backdrop, botó ✕ intern) que el toggle
  // optimista de dalt no cobreix.
  window.addEventListener("search-overlay-toggle", (e) => {
    const open = !!e.detail?.open;
    if (nb.isSearchOpen !== open) {
      nb.isSearchOpen = open;
      render();
    }
  });

  window.addEventListener("resize", () => {
    const wasMobile = nb.isMobile;
    nb.isMobile = window.innerWidth < 850;
    if (wasMobile !== nb.isMobile) render();
  });

  render();
  fetchUser();
  fetchCategoriesPubli();
  fetchCategoriesEvents();
  fetchCategorias();
})();
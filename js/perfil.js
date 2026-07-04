// ============================================================
// perfil.js — Equivalent a Perfil.jsx
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  const app = document.getElementById("perfil-app");
  if (!app) return;

  const DEFAULT_AVATAR = "https://res.cloudinary.com/demo/image/upload/v1690000000/default-avatar.png";
  const DEFAULT_BANNER = "https://res.cloudinary.com/demo/image/upload/v1690000000/default-banner.jpg";

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  const state = {
    user: null,
    loading: true,
    error: null,
    editMode: false,
    saving: false,
    feedback: null, // { type: "success"|"error", msg }
    form: {},
  };

  function fmtDate(raw) {
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d) ? raw : d.toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" });
  }

  function fmtDateInput(raw) {
    if (!raw) return "";
    const d = new Date(raw);
    return isNaN(d) ? "" : d.toISOString().split("T")[0];
  }

  function setFormFromUser(u) {
    state.form = {
      nom: u.nom ?? "",
      username: u.username ?? "",
      email: u.email ?? "",
      descripcion: u.descripcion ?? "",
      telefono: u.telefono ?? "",
      ubicacion: u.ubicacion ?? "",
      fechaNacimiento: fmtDateInput(u.fechaNacimiento),
    };
  }

  // ── Fetch perfil ────────────────────────────────────────────────
  async function fetchPerfil() {
    state.loading = true;
    render();
    try {
      const res = await fetch("http://localhost:5000/api/auth/perfil", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const u = data.user ?? data.data ?? data;
      if (!u || !u.email) throw new Error("Resposta invàlida del servidor");

      state.user = u;
      setFormFromUser(u);
    } catch (err) {
      state.error = err.message;
    } finally {
      state.loading = false;
      render();
    }
  }

  // ── Desar canvis ─────────────────────────────────────────────────
  async function handleSave() {
    state.saving = true;
    state.feedback = null;
    render();
    try {
      const res = await fetch("http://localhost:5000/api/auth/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(state.form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      state.user = data.user ?? data;
      state.editMode = false;
      state.feedback = { type: "success", msg: "Perfil actualitzat correctament." };
    } catch (err) {
      state.feedback = { type: "error", msg: "Error en desar els canvis." };
    } finally {
      state.saving = false;
      render();
    }
  }

  // ── Pujar imatge (avatar / banner) ────────────────────────────────
  async function handleImageUpload(file, field) {
    if (!file) return;

    const fd = new FormData();
    fd.append("image", file);
    fd.append("field", field);

    try {
      const res = await fetch("http://localhost:5000/api/auth/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      state.user = data.user ?? data;
      state.feedback = { type: "success", msg: "Imatge actualitzada." };
    } catch (err) {
      state.feedback = { type: "error", msg: "Error pujant la imatge." };
    } finally {
      render();
    }
  }

  // ── Render ─────────────────────────────────────────────────────
  function render() {
    if (state.loading) {
      app.innerHTML = `
        <div class="perfil-loading">
          <div class="perfil-spinner"></div>
          <p>Carregant perfil...</p>
        </div>
      `;
      return;
    }

    if (state.error) {
      app.innerHTML = `
        <div class="perfil-loading error">
          <i class="ti ti-alert-circle"></i>
          <p>Error: ${state.error}</p>
        </div>
      `;
      return;
    }

    const user = state.user;
    const isAdmin = user?.rol === "admin";
    const form = state.form;

    app.innerHTML = `
      <main class="perfil-page">

        <!-- BANNER -->
        <div class="perfil-banner-wrap">
          <img src="${user.banner || DEFAULT_BANNER}" alt="Banner" class="perfil-banner-img" />
          <div class="perfil-banner-overlay"></div>

          <button class="perfil-banner-edit-btn" data-action="pick-banner" title="Canviar banner">
            <i class="ti ti-camera"></i> Canviar banner
          </button>
          <input type="file" accept="image/*" style="display:none;" data-role="banner-input" />
        </div>

        <!-- PROFILE HEADER -->
        <div class="perfil-header-wrap">
          <div class="perfil-header-inner">

            <div class="perfil-avatar-wrap">
              <img src="${user.avatar || DEFAULT_AVATAR}" alt="${user.nom ?? ""}" class="perfil-avatar" />
              <button class="perfil-avatar-edit-btn" data-action="pick-avatar" title="Canviar foto">
                <i class="ti ti-camera"></i>
              </button>
              <input type="file" accept="image/*" style="display:none;" data-role="avatar-input" />
            </div>

            <div class="perfil-header-info">
              <div class="perfil-header-name-row">
                <h1 class="perfil-nom">${user.nom ?? ""}</h1>
                ${user.verificado ? `
                  <span class="perfil-verified" title="Compte verificat">
                    <i class="ti ti-rosette-discount-check"></i>
                  </span>` : ""}
                ${isAdmin
                  ? `<span class="perfil-role-badge admin">Admin</span>`
                  : `<span class="perfil-role-badge user">Usuari</span>`}
              </div>

              ${user.username ? `<p class="perfil-username">@${user.username}</p>` : ""}

              ${user.descripcion && !state.editMode ? `<p class="perfil-desc">${user.descripcion}</p>` : ""}

              <div class="perfil-meta-row">
                ${user.ubicacion ? `<span class="perfil-meta-item"><i class="ti ti-map-pin"></i> ${user.ubicacion}</span>` : ""}
                ${user.telefono ? `<span class="perfil-meta-item"><i class="ti ti-phone"></i> ${user.telefono}</span>` : ""}
                ${user.fechaNacimiento ? `<span class="perfil-meta-item"><i class="ti ti-cake"></i> ${fmtDate(user.fechaNacimiento)}</span>` : ""}
                <span class="perfil-meta-item"><i class="ti ti-calendar"></i> Membre des de ${fmtDate(user.createdAt)}</span>
              </div>
            </div>

            <div class="perfil-header-actions">
              ${!state.editMode ? `
                <button class="perfil-edit-btn" data-action="enter-edit">
                  <i class="ti ti-edit"></i> Editar perfil
                </button>
              ` : `
                <div class="perfil-edit-actions">
                  <button class="perfil-save-btn" data-action="save" ${state.saving ? "disabled" : ""}>
                    ${state.saving ? "Desant..." : `<i class="ti ti-check"></i> Desar`}
                  </button>
                  <button class="perfil-cancel-btn" data-action="cancel-edit">
                    <i class="ti ti-x"></i> Cancel·lar
                  </button>
                </div>
              `}
            </div>

          </div>
        </div>

        ${state.feedback ? `
          <div class="perfil-feedback ${state.feedback.type}">
            <i class="ti ${state.feedback.type === "success" ? "ti-check" : "ti-alert-circle"}"></i>
            ${state.feedback.msg}
          </div>
        ` : ""}

        <!-- CONTINGUT -->
        <div class="perfil-body">

          ${state.editMode ? `
            <section class="perfil-edit-section">
              <span class="section-index">EDITAR INFORMACIÓ</span>
              <h2 class="perfil-section-title">
                Actualitza el teu <span class="accent-word">perfil</span>
              </h2>

              <div class="perfil-form">
                <div class="perfil-form-row">
                  <div class="perfil-form-group">
                    <label>Nom complet</label>
                    <input type="text" data-field="nom" value="${form.nom}" placeholder="El teu nom" />
                  </div>
                  <div class="perfil-form-group">
                    <label>Nom d'usuari</label>
                    <div class="perfil-input-prefix">
                      <span>@</span>
                      <input type="text" data-field="username" value="${form.username}" placeholder="username" />
                    </div>
                  </div>
                </div>

                <div class="perfil-form-row">
                  <div class="perfil-form-group">
                    <label>Correu electrònic</label>
                    <input type="email" data-field="email" value="${form.email}" placeholder="nom@exemple.com" />
                  </div>
                  <div class="perfil-form-group">
                    <label>Telèfon</label>
                    <input type="tel" data-field="telefono" value="${form.telefono}" placeholder="+34 600 000 000" />
                  </div>
                </div>

                <div class="perfil-form-row">
                  <div class="perfil-form-group">
                    <label>Ubicació</label>
                    <input type="text" data-field="ubicacion" value="${form.ubicacion}" placeholder="Mataró, Catalunya" />
                  </div>
                  <div class="perfil-form-group">
                    <label>Data de naixement</label>
                    <input type="date" data-field="fechaNacimiento" value="${form.fechaNacimiento}" />
                  </div>
                </div>

                <div class="perfil-form-group full">
                  <label>Descripció <span class="perfil-char-count" data-role="char-count">${form.descripcion.length}/300</span></label>
                  <textarea data-field="descripcion" maxlength="300" rows="4" placeholder="Explica qui ets...">${form.descripcion}</textarea>
                </div>
              </div>
            </section>
          ` : `
            <div class="perfil-cards-grid">

              <section class="perfil-card">
                <div class="perfil-card-header"><i class="ti ti-user"></i><h3>Sobre mi</h3></div>
                <div class="perfil-card-body">
                  ${user.descripcion
                    ? `<p class="perfil-card-desc">${user.descripcion}</p>`
                    : `<p class="perfil-card-empty">Sense descripció.</p>`}
                </div>
              </section>

              <section class="perfil-card">
                <div class="perfil-card-header"><i class="ti ti-address-book"></i><h3>Contacte</h3></div>
                <div class="perfil-card-body">
                  <div class="perfil-info-list">
                    <div class="perfil-info-item">
                      <span class="perfil-info-label"><i class="ti ti-mail"></i> Email</span>
                      <span class="perfil-info-value">${user.email}</span>
                    </div>
                    <div class="perfil-info-item">
                      <span class="perfil-info-label"><i class="ti ti-phone"></i> Telèfon</span>
                      <span class="perfil-info-value">${user.telefono || `<em class="perfil-empty-field">No indicat</em>`}</span>
                    </div>
                    <div class="perfil-info-item">
                      <span class="perfil-info-label"><i class="ti ti-map-pin"></i> Ubicació</span>
                      <span class="perfil-info-value">${user.ubicacion || `<em class="perfil-empty-field">No indicada</em>`}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section class="perfil-card">
                <div class="perfil-card-header"><i class="ti ti-shield"></i><h3>Compte</h3></div>
                <div class="perfil-card-body">
                  <div class="perfil-info-list">
                    <div class="perfil-info-item">
                      <span class="perfil-info-label"><i class="ti ti-at"></i> Username</span>
                      <span class="perfil-info-value">${user.username ? `@${user.username}` : `<em class="perfil-empty-field">No definit</em>`}</span>
                    </div>
                    <div class="perfil-info-item">
                      <span class="perfil-info-label"><i class="ti ti-cake"></i> Nascuda/t el</span>
                      <span class="perfil-info-value">${user.fechaNacimiento ? fmtDate(user.fechaNacimiento) : `<em class="perfil-empty-field">No indicat</em>`}</span>
                    </div>
                    <div class="perfil-info-item">
                      <span class="perfil-info-label"><i class="ti ti-crown"></i> Rol</span>
                      <span class="perfil-info-value" style="color:${isAdmin ? "var(--yellow)" : "var(--text-muted)"}">${isAdmin ? "Administrador" : "Usuari"}</span>
                    </div>
                    <div class="perfil-info-item">
                      <span class="perfil-info-label"><i class="ti ti-rosette-discount-check"></i> Verificat</span>
                      <span class="perfil-info-value" style="color:${user.verificado ? "var(--blue)" : "var(--text-muted)"}">${user.verificado ? "Sí" : "No"}</span>
                    </div>
                    <div class="perfil-info-item">
                      <span class="perfil-info-label"><i class="ti ti-calendar-plus"></i> Membre des de</span>
                      <span class="perfil-info-value">${fmtDate(user.createdAt)}</span>
                    </div>
                    <div class="perfil-info-item">
                      <span class="perfil-info-label"><i class="ti ti-refresh"></i> Última actualització</span>
                      <span class="perfil-info-value">${fmtDate(user.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section class="perfil-card">
                <div class="perfil-card-header"><i class="ti ti-activity"></i><h3>Estat</h3></div>
                <div class="perfil-card-body">
                  <div class="perfil-status-row">
                    <div class="perfil-status-dot ${user.activo ? "active" : "inactive"}"></div>
                    <span class="perfil-status-label">Compte ${user.activo ? "actiu" : "inactiu"}</span>
                  </div>
                  <p class="perfil-card-empty" style="margin-top:12px;">
                    ${user.activo
                      ? "El teu compte és actiu i visible a la plataforma."
                      : "El teu compte ha estat desactivat. Contacta amb l'administrador."}
                  </p>
                </div>
              </section>

            </div>
          `}

        </div>

      </main>
    `;

    attachHandlers();
  }

  function attachHandlers() {
    const avatarInput = app.querySelector('[data-role="avatar-input"]');
    const bannerInput = app.querySelector('[data-role="banner-input"]');

    app.querySelector('[data-action="pick-avatar"]')?.addEventListener("click", () => avatarInput?.click());
    app.querySelector('[data-action="pick-banner"]')?.addEventListener("click", () => bannerInput?.click());

    avatarInput?.addEventListener("change", (e) => handleImageUpload(e.target.files[0], "avatar"));
    bannerInput?.addEventListener("change", (e) => handleImageUpload(e.target.files[0], "banner"));

    app.querySelector('[data-action="enter-edit"]')?.addEventListener("click", () => {
      state.editMode = true;
      render();
    });

    app.querySelector('[data-action="cancel-edit"]')?.addEventListener("click", () => {
      state.editMode = false;
      state.feedback = null;
      render();
    });

    app.querySelector('[data-action="save"]')?.addEventListener("click", handleSave);

    app.querySelectorAll("[data-field]").forEach(el => {
      el.addEventListener("input", (e) => {
        state.form[el.dataset.field] = e.target.value;
        if (el.dataset.field === "descripcion") {
          const counter = app.querySelector('[data-role="char-count"]');
          if (counter) counter.textContent = `${e.target.value.length}/300`;
        }
      });
    });
  }

  fetchPerfil();
});
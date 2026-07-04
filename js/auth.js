// auth.js
// Equivalent vanilla del component Auth.jsx: canvi de pestanya login/registre,
// validació bàsica i crides a l'API amb desat a localStorage.

document.addEventListener("DOMContentLoaded", () => {
  buildBrandGrid();
  wireTabs();
  wireLoginForm();
  wireRegisterForm();
});

/* ===========================================================
   FONS DE 24 CEL·LES DEL PANELL DE MARCA
=========================================================== */

function buildBrandGrid() {
  const wrap = document.getElementById("auth-brand-grid-bg");
  if (!wrap) return;

  for (let i = 0; i < 24; i++) {
    const cell = document.createElement("span");
    cell.className = "auth-bg-cell";
    wrap.appendChild(cell);
  }
}

/* ===========================================================
   CANVI DE MODE (LOGIN / REGISTER)
=========================================================== */

function wireTabs() {
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const indicator = document.getElementById("auth-tab-indicator");
  const blockLogin = document.getElementById("block-login");
  const blockRegister = document.getElementById("block-register");
  const switchToRegister = document.getElementById("switch-to-register");
  const switchToLogin = document.getElementById("switch-to-login");

  function switchMode(mode) {
    const isLogin = mode === "login";

    tabLogin.classList.toggle("active", isLogin);
    tabRegister.classList.toggle("active", !isLogin);
    indicator.style.transform = isLogin ? "translateX(0)" : "translateX(100%)";

    blockLogin.classList.toggle("visible", isLogin);
    blockLogin.classList.toggle("hidden", !isLogin);
    blockRegister.classList.toggle("visible", !isLogin);
    blockRegister.classList.toggle("hidden", isLogin);

    // Reinicia l'estat de feedback en canviar de mode
    hideFeedback("login");
    hideFeedback("register");
  }

  tabLogin.addEventListener("click", () => switchMode("login"));
  tabRegister.addEventListener("click", () => switchMode("register"));
  switchToRegister.addEventListener("click", () => switchMode("register"));
  switchToLogin.addEventListener("click", () => switchMode("login"));
}

/* ===========================================================
   FEEDBACK HELPERS
=========================================================== */

function hideFeedback(prefix) {
  const err = document.getElementById(`${prefix}-error`);
  const ok = document.getElementById(`${prefix}-success`);
  if (err) { err.style.display = "none"; err.textContent = ""; }
  if (ok) ok.style.display = "none";
}

function showError(prefix, message) {
  const err = document.getElementById(`${prefix}-error`);
  const ok = document.getElementById(`${prefix}-success`);
  if (ok) ok.style.display = "none";
  if (err) {
    err.textContent = message;
    err.style.display = "block";
  }
}

function showSuccess(prefix) {
  const err = document.getElementById(`${prefix}-error`);
  const ok = document.getElementById(`${prefix}-success`);
  if (err) err.style.display = "none";
  if (ok) ok.style.display = "block";
}

function setLoading(prefix, loading, loadingLabel, idleLabel) {
  const btn = document.getElementById(`${prefix}-submit-btn`);
  const label = document.getElementById(`${prefix}-submit-label`);
  btn.disabled = loading;
  label.textContent = loading ? loadingLabel : idleLabel;
}

/* ===========================================================
   LOCALSTORAGE
=========================================================== */

function saveToLocalStorage(data) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user_id", data.user.id);
  localStorage.setItem("name", data.user.nom);
  localStorage.setItem("email", data.user.email);
  localStorage.setItem("role", data.user.rol ?? "usuari");
}

/* ===========================================================
   LOGIN
=========================================================== */

function wireLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    hideFeedback("login");
    setLoading("login", true, "Entrant...", "Accedir");

    const loginData = {
      email: document.getElementById("login-email").value,
      password: document.getElementById("login-password").value,
    };

    try {
      const res = await fetch("https://backend-tradicions.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Credencials incorrectes");
      }

      saveToLocalStorage(data);
      showSuccess("login");
      window.location.href = "https://tradicionsdemataro.github.io/tradicionsdemataro/";
    } catch (err) {
      showError("login", err.message);
    } finally {
      setLoading("login", false, "Entrant...", "Accedir");
    }
  });
}

/* ===========================================================
   REGISTER
=========================================================== */

function wireRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    hideFeedback("register");

    const registerData = {
      nom: document.getElementById("reg-nom").value,
      email: document.getElementById("reg-email").value,
      password: document.getElementById("reg-password").value,
      password2: document.getElementById("reg-password2").value,
    };

    if (registerData.password !== registerData.password2) {
      showError("register", "Les contrasenyes no coincideixen");
      return;
    }

    setLoading("register", true, "Registrant...", "Crear compte");

    try {
      const res = await fetch("https://backend-tradicions.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: registerData.nom,
          email: registerData.email,
          password: registerData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error en el registre");
      }

      saveToLocalStorage(data);
      showSuccess("register");
      window.location.href = "https://tradicionsdemataro.github.io/tradicionsdemataro/";
    } catch (err) {
      showError("register", err.message);
    } finally {
      setLoading("register", false, "Registrant...", "Crear compte");
    }
  });
}
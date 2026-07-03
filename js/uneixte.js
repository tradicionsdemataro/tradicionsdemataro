// uneixte.js
// Renderitza els beneficis, àrees, FAQs i el <select> del formulari,
// i gestiona la validació + enviament (equivalent vanilla del component React)

document.addEventListener("DOMContentLoaded", () => {
  renderBeneficis();
  renderAreas();
  renderAreaSelect();
  renderFaqs();
  wireForm();
});

/* ===========================================================
   RENDERITZAT DE SECCIONS
=========================================================== */

function renderBeneficis() {
  const wrap = document.getElementById("beneficis-grid");
  if (!wrap) return;

  BENEFICIS.forEach((b, i) => {
    const el = document.createElement("div");
    el.className = "benefici-card";
    el.innerHTML = `
      <span class="benefici-num">0${i + 1}</span>
      <span class="benefici-icon">${b.icon}</span>
      <h3>${b.titol}</h3>
      <p>${b.desc}</p>
    `;
    wrap.appendChild(el);
  });
}

function renderAreas() {
  const wrap = document.getElementById("areas-grid");
  if (!wrap) return;

  AREAS.forEach((a) => {
    const el = document.createElement("div");
    el.className = "area-card";
    el.innerHTML = `
      <span class="area-icon">${a.icon}</span>
      <h3>${a.titol}</h3>
      <p>${a.desc}</p>
      <span class="area-tag">${a.tag}</span>
    `;
    wrap.appendChild(el);
  });
}

function renderAreaSelect() {
  const select = document.getElementById("area");
  if (!select) return;

  AREAS.forEach((a) => {
    const opt = document.createElement("option");
    opt.value = a.titol;
    opt.textContent = a.titol;
    select.appendChild(opt);
  });

  const altres = document.createElement("option");
  altres.value = "Altres";
  altres.textContent = "Altres / No ho sé encara";
  select.appendChild(altres);
}

function renderFaqs() {
  const wrap = document.getElementById("faq-list");
  if (!wrap) return;

  FAQS.forEach((f) => {
    const el = document.createElement("div");
    el.className = "faq-item";
    el.innerHTML = `
      <h4>${f.q}</h4>
      <p>${f.a}</p>
    `;
    wrap.appendChild(el);
  });
}

/* ===========================================================
   FORMULARI: VALIDACIÓ + ENVIAMENT
=========================================================== */

function wireForm() {
  const form = document.getElementById("uneixte-form");
  if (!form) return;

  const fields = {
    nom: document.getElementById("nom"),
    email: document.getElementById("email"),
    telefon: document.getElementById("telefon"),
    area: document.getElementById("area"),
    experiencia: document.getElementById("experiencia"),
    motivacio: document.getElementById("motivacio"),
  };

  const errorEls = {
    nom: document.getElementById("err-nom"),
    email: document.getElementById("err-email"),
    telefon: document.getElementById("err-telefon"),
    area: document.getElementById("err-area"),
    motivacio: document.getElementById("err-motivacio"),
  };

  const submitBtn = document.getElementById("uneixte-submit-btn");
  const feedbackSuccess = document.getElementById("feedback-success");
  const feedbackError = document.getElementById("feedback-error");

  function clearErrors() {
    Object.values(errorEls).forEach((el) => {
      if (el) el.textContent = "";
    });
  }

  function clearFeedback() {
    feedbackSuccess.style.display = "none";
    feedbackError.style.display = "none";
  }

  function validate() {
    const newErrors = {};
    const nom = fields.nom.value.trim();
    const email = fields.email.value.trim();
    const telefon = fields.telefon.value.trim();
    const area = fields.area.value;
    const motivacio = fields.motivacio.value.trim();

    if (!nom || nom.length < 2) {
      newErrors.nom = "El nom ha de tenir almenys 2 caràcters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "L'email és obligatori";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Email no vàlid";
    }

    const phoneRegex = /^[0-9+\s]{6,15}$/;
    if (telefon && !phoneRegex.test(telefon)) {
      newErrors.telefon = "Telèfon no vàlid";
    }

    if (!area) {
      newErrors.area = "Selecciona una àrea";
    }

    if (!motivacio || motivacio.length < 10) {
      newErrors.motivacio = "La motivació ha de tenir almenys 10 caràcters";
    }

    clearErrors();
    Object.entries(newErrors).forEach(([field, msg]) => {
      if (errorEls[field]) errorEls[field].textContent = msg;
    });

    return Object.keys(newErrors).length === 0;
  }

  function setStatus(status) {
    submitBtn.disabled = status === "loading";
    submitBtn.textContent = status === "loading" ? "Enviant..." : "Enviar sol·licitud";
    clearFeedback();
    if (status === "success") feedbackSuccess.style.display = "block";
    if (status === "error") feedbackError.style.display = "block";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setStatus("loading");

    const nom = fields.nom.value.trim();
    const email = fields.email.value.trim();
    const telefon = fields.telefon.value.trim();
    const area = fields.area.value;
    const experiencia = fields.experiencia.value.trim();
    const motivacio = fields.motivacio.value.trim();

    try {
      const res = await fetch("http://localhost:5000/solicituds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom,
          email,
          telefon,
          assumpte: `Uneix-te · ${area}`,
          missatge: `Experiència: ${experiencia || "No indicada"}\n\nMotivació: ${motivacio}`,
        }),
      });

      if (!res.ok) throw new Error("Error en l'enviament");

      setStatus("success");
      form.reset();
      clearErrors();
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  });
}
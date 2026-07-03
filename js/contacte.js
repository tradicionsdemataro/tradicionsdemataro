// contacte.js
// Equivalent vanilla del component Contacte.jsx: gestiona l'estat del
// formulari, la validació i l'enviament a l'API.

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contacte-form");
  if (!form) return;

  const fields = {
    nom: document.getElementById("nom"),
    email: document.getElementById("email"),
    telefon: document.getElementById("telefon"),
    assumpte: document.getElementById("assumpte"),
    missatge: document.getElementById("missatge"),
  };

  const errorEls = {
    nom: document.getElementById("err-nom"),
    email: document.getElementById("err-email"),
    telefon: document.getElementById("err-telefon"),
    assumpte: document.getElementById("err-assumpte"),
    missatge: document.getElementById("err-missatge"),
  };

  const submitBtn = document.getElementById("contacte-submit-btn");
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
    const assumpte = fields.assumpte.value.trim();
    const missatge = fields.missatge.value.trim();

    // NOM
    if (!nom) {
      newErrors.nom = "El nom és obligatori";
    } else if (nom.length < 2) {
      newErrors.nom = "El nom ha de tenir almenys 2 caràcters";
    }

    // EMAIL
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "L'email és obligatori";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Email no vàlid";
    }

    // TELÈFON (opcional però validat si existeix)
    const phoneRegex = /^[0-9+\s]{6,15}$/;
    if (telefon && !phoneRegex.test(telefon)) {
      newErrors.telefon = "Telèfon no vàlid";
    }

    // ASSUMPTE
    if (!assumpte) {
      newErrors.assumpte = "L'assumpte és obligatori";
    } else if (assumpte.length < 3) {
      newErrors.assumpte = "L'assumpte és massa curt";
    }

    // MISSATGE
    if (!missatge) {
      newErrors.missatge = "El missatge és obligatori";
    } else if (missatge.length < 10) {
      newErrors.missatge = "El missatge ha de tenir almenys 10 caràcters";
    }

    clearErrors();
    Object.entries(newErrors).forEach(([field, msg]) => {
      if (errorEls[field]) errorEls[field].textContent = msg;
    });

    return Object.keys(newErrors).length === 0;
  }

  function setStatus(status) {
    submitBtn.disabled = status === "loading";
    submitBtn.textContent = status === "loading" ? "Enviant..." : "Enviar missatge";
    clearFeedback();
    if (status === "success") feedbackSuccess.style.display = "block";
    if (status === "error") feedbackError.style.display = "block";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setStatus("loading");

    const formData = {
      nom: fields.nom.value.trim(),
      email: fields.email.value.trim(),
      telefon: fields.telefon.value.trim(),
      assumpte: fields.assumpte.value.trim(),
      missatge: fields.missatge.value.trim(),
    };

    try {
      const res = await fetch("http://localhost:5000/solicituds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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
});
// resenyes.js
// Equivalent vanilla dels components <Estreles> i <ResenyesCard> de Publicacions.jsx
// Cada crida a buildResenyesCard() crea una instància independent amb el seu
// propi estat mantingut via closures (com useState per component en React).

/* ===========================================================
   ESTRELES
=========================================================== */

// Crea un selector/visor d'estrelles.
// value: valoració inicial. onChange(n): callback quan es clica una estrella (només si !readonly).
// Retorna { el, setValue } perquè el cridant pugui actualitzar el valor des de fora si cal.
function buildEstreles(value, onChange, readonly = false) {
  const wrap = document.createElement("div");
  wrap.className = "res-estreles";

  let current = value;
  let hover = 0;
  const buttons = [];

  function paint() {
    buttons.forEach((btn, i) => {
      const n = i + 1;
      btn.classList.toggle("activa", (hover || current) >= n);
    });
  }

  for (let n = 1; n <= 5; n++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "res-estrela";
    btn.textContent = "★";
    btn.setAttribute("aria-label", `${n} estreles`);
    btn.disabled = readonly;

    if (!readonly) {
      btn.addEventListener("click", () => {
        current = n;
        onChange?.(n);
        paint();
      });
      btn.addEventListener("mouseenter", () => {
        hover = n;
        paint();
      });
      btn.addEventListener("mouseleave", () => {
        hover = 0;
        paint();
      });
    }

    buttons.push(btn);
    wrap.appendChild(btn);
  }

  paint();

  return {
    el: wrap,
    setValue(v) {
      current = v;
      paint();
    },
  };
}

/* ===========================================================
   RESENYES CARD
=========================================================== */

function buildResenyesCard(publicacioId) {
  const token = getToken();

  // ── "useState" locals via closures ──
  let ressenyes = [];
  let loading = true;
  let text = "";
  let rating = 0;
  let posting = false;
  let postErr = null;
  let expanded = false;
  let open = false;
  let showForm = false;

  // ── Root element ──
  const root = document.createElement("div");
  root.className = "res-section";

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "res-toggle";
  root.appendChild(toggleBtn);

  const body = document.createElement("div");
  body.className = "res-body";
  root.appendChild(body);

  /* ── Fetch inicial ── */
  (async () => {
    try {
      const res = await fetch(`http://localhost:5000/resenas/${publicacioId}`);
      if (res.ok) {
        const data = await res.json();
        ressenyes = Array.isArray(data) ? data : data.ressenyes ?? [];
      }
    } catch {
      // silenciós, com al React original
    } finally {
      loading = false;
      render();
    }
  })();

  /* ── Render ── */
  function render() {
    const mitjana = ressenyes.length
      ? (ressenyes.reduce((a, r) => a + (r.rating ?? 0), 0) / ressenyes.length).toFixed(1)
      : null;

    // Capçalera / toggle
    toggleBtn.innerHTML = `
      <span class="res-toggle-left">
        <i class="ti ti-message-star"></i>
        <span class="res-label-inline">Ressenyes</span>
        ${!loading && ressenyes.length > 0 ? `<span class="res-badge">${ressenyes.length}</span>` : ""}
      </span>
      <span class="res-toggle-right">
        ${mitjana ? `
        <span class="res-mitjana">
          <span class="res-mitjana-num">${mitjana}</span>
          <span class="res-estrela-static">★</span>
        </span>` : ""}
        <i class="ti ${open ? "ti-chevron-up" : "ti-chevron-down"} res-chevron"></i>
      </span>
    `;

    body.style.display = open ? "block" : "none";
    body.innerHTML = "";
    if (!open) return;

    const visibles = expanded ? ressenyes : ressenyes.slice(0, 2);

    // Llista
    if (!loading && ressenyes.length > 0) {
      const ul = document.createElement("ul");
      ul.className = "res-llista";

      visibles.forEach((r, i) => {
        const li = document.createElement("li");
        li.className = "res-item";

        const top = document.createElement("div");
        top.className = "res-item-top";
        const autor = document.createElement("span");
        autor.className = "res-item-autor";
        autor.textContent = r.autor ?? r.username ?? "Usuari";
        top.appendChild(autor);
        if (r.rating) {
          const stars = buildEstreles(r.rating, null, true);
          top.appendChild(stars.el);
        }
        li.appendChild(top);

        const p = document.createElement("p");
        p.className = "res-item-text";
        p.textContent = r.text;
        li.appendChild(p);

        const data = document.createElement("span");
        data.className = "res-item-data";
        data.textContent = fmtDate(r.data ?? r.createdAt) ?? "";
        li.appendChild(data);

        ul.appendChild(li);
      });

      body.appendChild(ul);
    }

    if (!loading && ressenyes.length === 0) {
      const p = document.createElement("p");
      p.className = "res-empty";
      p.textContent = "Encara no hi ha ressenyes.";
      body.appendChild(p);
    }

    if (ressenyes.length > 2) {
      const btn = document.createElement("button");
      btn.className = "res-veure-mes";
      btn.innerHTML = `
        ${expanded ? "Veure menys" : `Veure les ${ressenyes.length - 2} restants`}
        <i class="ti ${expanded ? "ti-chevron-up" : "ti-chevron-down"}"></i>
      `;
      btn.addEventListener("click", () => {
        expanded = !expanded;
        render();
      });
      body.appendChild(btn);
    }

    // Botó escriure / formulari
    if (token && !showForm) {
      const btn = document.createElement("button");
      btn.className = "res-write-btn";
      btn.innerHTML = `<i class="ti ti-pencil"></i> Escriu una ressenya`;
      btn.addEventListener("click", () => {
        showForm = true;
        render();
      });
      body.appendChild(btn);
    }

    if (token && showForm) {
      body.appendChild(buildForm());
    }
  }

  function buildForm() {
    const form = document.createElement("div");
    form.className = "res-form";

    const top = document.createElement("div");
    top.className = "res-form-top";

    const stars = buildEstreles(rating, (n) => {
      rating = n;
      updateSubmitState();
    }, false);
    top.appendChild(stars.el);

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "res-form-cancel";
    cancelBtn.innerHTML = `<i class="ti ti-x"></i>`;
    cancelBtn.addEventListener("click", () => {
      showForm = false;
      text = "";
      rating = 0;
      postErr = null;
      render();
    });
    top.appendChild(cancelBtn);

    form.appendChild(top);

    const textarea = document.createElement("textarea");
    textarea.className = "res-textarea";
    textarea.placeholder = "Escriu la teva ressenya...";
    textarea.rows = 3;
    textarea.maxLength = 400;
    textarea.disabled = posting;
    textarea.value = text;
    textarea.addEventListener("input", (e) => {
      text = e.target.value;
      updateSubmitState();
    });
    form.appendChild(textarea);

    const errorSpan = document.createElement("span");
    errorSpan.className = "res-error";
    errorSpan.style.display = postErr ? "inline-flex" : "none";
    errorSpan.innerHTML = `<i class="ti ti-alert-circle"></i> ${postErr ?? ""}`;
    form.appendChild(errorSpan);

    const submitBtn = document.createElement("button");
    submitBtn.className = "res-submit";
    form.appendChild(submitBtn);

    function updateSubmitState() {
      submitBtn.disabled = !text.trim() || !rating || posting;
      submitBtn.innerHTML = posting
        ? `<div class="res-spinner"></div> Enviant...`
        : `<i class="ti ti-send"></i> Publicar`;
    }
    updateSubmitState();

    submitBtn.addEventListener("click", async () => {
      if (!text.trim() || !rating || posting) return;
      posting = true;
      postErr = null;
      updateSubmitState();
      submitBtn.disabled = true;

      try {
        const res = await fetch(`http://localhost:5000/resenas/${publicacioId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: text.trim(), rating }),
        });

        if (!res.ok) {
          const b = await res.json().catch(() => ({}));
          throw new Error(b.message || `HTTP ${res.status}`);
        }

        const nova = await res.json();
        ressenyes = [nova, ...ressenyes];
        text = "";
        rating = 0;
        showForm = false;
      } catch (err) {
        postErr = err.message;
      } finally {
        posting = false;
        render();
      }
    });

    setTimeout(() => textarea.focus(), 0);

    return form;
  }

  toggleBtn.addEventListener("click", () => {
    open = !open;
    render();
  });

  render();

  return root;
}
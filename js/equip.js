// equip.js
// Renderitza: 1) direcció, 2) equip complert amb cerca/filtre, 3) departaments.

function getInitials(nom) {
  return nom
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Categoritza el càrrec en una família visual, per donar significat
// real al color de cada targeta (no és decoració, és informació).
const ROLE_CATEGORIES = [
  { key: "role-direccio",     test: /director/i },
  { key: "role-tecnic",       test: /desenvolupador/i },
  { key: "role-visual",       test: /fotografia|audiovisual/i },
  { key: "role-colaboracio",  test: /col·laborador/i },
];

function getRoleClass(carrec) {
  const text = carrec.toLowerCase();

  if (text.includes("fotografia") || text.includes("audiovisual")) {
    return "role-visual";
  }

  if (text.includes("director")) {
    return "role-direccio";
  }

  if (text.includes("desenvolupador")) {
    return "role-tecnic";
  }

  if (text.includes("col·laborador")) {
    return "role-colaboracio";
  }

  return "role-redaccio";
}

function findMembre(nom) {
  return membres.find((m) => m.nom === nom);
}

function memberCardHtml(membre) {
  const roleClass = getRoleClass(membre.carrec);
  const contacte = membre.email
    ? `<a href="mailto:${membre.email}">${membre.email}</a>`
    : `<span class="member-no-email">Sense contacte públic</span>`;

  return `
    <div class="member-avatar">${getInitials(membre.nom)}</div>
    <span class="member-role ${roleClass}">${membre.carrec}</span>
    <h3>${membre.nom}</h3>
    ${contacte}
  `;
}

/* ===========================================================
   1) DIRECCIÓ
=========================================================== */

function renderDirectors() {
  const wrap = document.getElementById("equip-directors-grid");
  if (!wrap) return;
  wrap.innerHTML = "";

  juntaDirectiva.directors.forEach((nom) => {
    const membre = findMembre(nom);
    if (!membre) return;
    const roleClass = getRoleClass(membre.carrec);

    const card = document.createElement("article");
    card.className = `member-card member-card--director ${roleClass}`;
    card.innerHTML = memberCardHtml(membre);
    wrap.appendChild(card);
  });
}

/* ===========================================================
   2) EQUIP COMPLERT — cerca + filtre per àmbit
=========================================================== */

const equipState = { search: "", role: "tots" };

function getFilteredMembres() {
  const q = equipState.search.trim().toLowerCase();
  return membres.filter((m) => {
    const roleClass = getRoleClass(m.carrec);
    const matchRole = equipState.role === "tots" || roleClass === equipState.role;
    const matchSearch = !q || m.nom.toLowerCase().includes(q) || m.carrec.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });
}

function renderEquipGrid() {
  const wrap = document.getElementById("equip-grid");
  const emptyEl = document.getElementById("equip-empty");
  if (!wrap) return;

  const filtered = getFilteredMembres();
  wrap.innerHTML = "";

  if (filtered.length === 0) {
    if (emptyEl) emptyEl.style.display = "block";
    return;
  }
  if (emptyEl) emptyEl.style.display = "none";

  filtered.forEach((membre) => {
    const roleClass = getRoleClass(membre.carrec);
    const card = document.createElement("article");
    card.className = `member-card ${roleClass}`;
    card.innerHTML = memberCardHtml(membre);
    wrap.appendChild(card);
  });
}

function wireEquipFilters() {
  const searchInput = document.getElementById("equip-search-input");
  const filterSelect = document.getElementById("equip-filter-select");

  searchInput?.addEventListener("input", (e) => {
    equipState.search = e.target.value;
    renderEquipGrid();
  });

  filterSelect?.addEventListener("change", (e) => {
    equipState.role = e.target.value;
    renderEquipGrid();
  });
}

/* ===========================================================
   3) DEPARTAMENTS
=========================================================== */

function renderDepartaments() {
  const wrap = document.getElementById("equip-departaments");
  if (!wrap) return;
  wrap.innerHTML = "";

  const entries = [
    ["Coordinació general", juntaDirectiva.coordinadors],
    ...Object.entries(juntaDirectiva.responsables),
  ];

  entries.forEach(([nomDept, persones]) => {
    const card = document.createElement("article");
    card.className = "dept-card-block";
    card.innerHTML = `
      <h3 class="dept-card-block__title">${nomDept}</h3>
      <ul class="dept-card-block__list">
        ${persones.map((nom) => {
          const membre = findMembre(nom);
          return `
            <li>
              ${membre?.email
                ? `<a href="mailto:${membre.email}">${nom}</a>`
                : `<span>${nom}</span>`}
            </li>
          `;
        }).join("")}
      </ul>
    `;
    wrap.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderDirectors();
  renderEquipGrid();
  wireEquipFilters();
  renderDepartaments();
});
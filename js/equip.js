// equip.js
// Renderitza la graella de membres de l'equip (equivalent vanilla del .map() de React)

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
  const match = ROLE_CATEGORIES.find((r) => r.test.test(carrec));
  return match ? match.key : "role-redaccio"; // redacció/comunicació = per defecte
}

function renderMembres() {
  const wrap = document.getElementById("equip-grid");
  if (!wrap) return;

  membres.forEach((membre) => {
    const roleClass = getRoleClass(membre.carrec);

    const card = document.createElement("article");
    card.className = `member-card ${roleClass}`;

    const contacte = membre.email
      ? `<a href="mailto:${membre.email}">${membre.email}</a>`
      : `<span class="member-no-email">Sense contacte públic</span>`;

    card.innerHTML = `
      <div class="member-avatar">${getInitials(membre.nom)}</div>
      <span class="member-role ${roleClass}">${membre.carrec}</span>
      <h3>${membre.nom}</h3>
      ${contacte}
    `;
    wrap.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", renderMembres);
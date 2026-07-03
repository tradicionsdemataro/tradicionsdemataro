// equip.js
// Renderitza la graella de membres de l'equip (equivalent vanilla del .map() de React)

function getInitials(nom) {
  return nom
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("");
}

function renderMembres() {
  const wrap = document.getElementById("equip-grid");
  if (!wrap) return;

  membres.forEach((membre) => {
    const card = document.createElement("article");
    card.className = "member-card";
    card.innerHTML = `
      <div class="member-avatar">${getInitials(membre.nom)}</div>
      <span class="member-role">${membre.carrec}</span>
      <h3>${membre.nom}</h3>
      <a href="mailto:${membre.email}">${membre.email}</a>
    `;
    wrap.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", renderMembres);
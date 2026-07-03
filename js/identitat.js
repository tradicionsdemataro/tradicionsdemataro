// identitat.js
// Renderitza les targetes de logotips i colors corporatius (equivalent
// vanilla dels .map() de React)

document.addEventListener("DOMContentLoaded", () => {
  renderLogos();
  renderColors();
});

function renderLogos() {
  const wrap = document.getElementById("logos-grid");
  if (!wrap) return;

  logos.forEach((logo) => {
    const el = document.createElement("article");
    el.className = "logo-card";
    el.innerHTML = `
      <div class="logo-preview">
        <img src="${logo.img}" alt="${logo.nom}" />
      </div>

      <div class="logo-content">
        <span class="logo-type">LOGOTIP</span>
        <h3>${logo.nom}</h3>
        <p>${logo.desc}</p>

        <a href="${logo.pdf}" target="_blank" rel="noopener noreferrer" class="download-btn">
          VEURE PDF
        </a>
      </div>
    `;
    wrap.appendChild(el);
  });
}

function renderColors() {
  const wrap = document.getElementById("colors-grid");
  if (!wrap) return;

  colors.forEach((c) => {
    const el = document.createElement("article");
    el.className = "color-card";
    el.innerHTML = `
      <div class="color-preview" style="background:${c.hex}"></div>
      <div class="color-info">
        <span class="color-hex">${c.hex}</span>
        <h3>${c.nom}</h3>
        <p>${c.desc}</p>
      </div>
    `;
    wrap.appendChild(el);
  });
}
// agenda.js
// Equivalent vanilla del component Agenda.jsx: renderitza stats/features,
// aplica el fade-in (`showContent`) i gestiona el scroll suau al calendari.

document.addEventListener("DOMContentLoaded", () => {
  renderStats();
  renderFeatures();
  wireScrollButtons();

  // Equivalent a: useEffect(() => setTimeout(() => setShowContent(true), 100), [])
  setTimeout(() => {
    document.querySelector(".agenda-page").classList.add("show");
  }, 100);
});

function renderStats() {
  const wrap = document.getElementById("agenda-hero-stats");
  if (!wrap) return;

  STATS.forEach((s) => {
    const el = document.createElement("div");
    el.className = "agenda-hero-stat";
    el.innerHTML = `
      <span class="agenda-hero-stat-num" style="color:${s.color}">${s.num}</span>
      <span class="agenda-hero-stat-label">${s.label}</span>
    `;
    wrap.appendChild(el);
  });
}

function renderFeatures() {
  const wrap = document.getElementById("agenda-features");
  if (!wrap) return;

  FEATURES.forEach((f, i) => {
    const el = document.createElement("div");
    el.className = "agenda-feat-card";
    el.innerHTML = `
      <span class="agenda-feat-num">0${i + 1}</span>
      <span class="agenda-feat-emoji">${f.emoji}</span>
      <div class="agenda-feat-line" style="background:${f.color}"></div>
      <h3 style="color:${f.color}">${f.titol}</h3>
      <p>${f.desc}</p>
    `;
    wrap.appendChild(el);
  });
}

function scrollToCalendar() {
  document.getElementById("agenda-calendar-section")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function wireScrollButtons() {
  document.getElementById("agenda-hero-btn").addEventListener("click", scrollToCalendar);
  document.getElementById("agenda-intro-cta").addEventListener("click", scrollToCalendar);
}
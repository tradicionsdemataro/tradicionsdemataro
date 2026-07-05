// footer.js
// Genera i injecta el markup del footer dins de <footer id="footer"></footer>
// Segueix el mateix patró que navbar.js: es crida un cop el DOM està carregat.

function renderFooter() {
  const footerEl = document.getElementById("footer");
  if (!footerEl) return;

  footerEl.innerHTML = `
    <div class="footer-glow footer-glow-1"></div>
    <div class="footer-glow footer-glow-2"></div>

    <div class="footer-top">

      <div class="footer-brand">
        <span class="footer-index">TRADICIONS · DE MATARÓ</span>

        <div class="footer-logo-row">
          <img src="https://tradicionsdemataro.github.io/tradicionsdemataro/images/logo-footer.png" alt="Tradicions de Mataró" class="footer-logo" />
          <span class="footer-logo-divider" aria-hidden="true"></span>
          <img src="https://tradicionsdemataro.github.io/tradicionsdemataro/images/cercavila_logo.svg" alt="Cercavila" class="footer-logo footer-logo-svg" />
        </div>

        <h2 class="footer-headline">
          Teixint <span class="accent-word">tradicions</span>,<br />
          creant <span class="accent-blue">futur</span>.
        </h2>

        <a href="https://tradicionsdemataro.github.io/tradicionsdemataro/contacte.html" class="footer-btn">
          Contacta amb nosaltres
        </a>
      </div>

      <div class="footer-col">
        <h3 class="footer-col-title">Contacte</h3>
        <ul class="footer-list">
          <li>Ronda O'Donnell, 08302 Mataró</li>
          <li>
            <a href="mailto:info@tradicionsdemataro.cat">info@tradicionsdemataro.cat</a>
          </li>
          <li>
            <a href="Horari: Atencio">Dilluns a Divendres: 10:00 – 14:00 i de 16:00  - 20:30</a>
          </li>
          <li>
            <a href="Horari: Atencio">Dissabtes i Diumenges: 08:00 – 14:00 | 16:00 – 20:30</a>
          </li>
        </ul>
      </div>

      <div class="footer-col">
        <h3 class="footer-col-title">Navegació</h3>
        <ul class="footer-list">
          <li><a href="https://tradicionsdemataro.github.io/tradicionsdemataro/">Inici</a></li>
          <li><a href="https://tradicionsdemataro.github.io/tradicionsdemataro/contacte.html">Contacte</a></li>
          <li><a href="https://tradicionsdemataro.github.io/tradicionsdemataro/priv.html">Política de privacitat</a></li>
          <li><a href="https://tradicionsdemataro.github.io/tradicionsdemataro/xarxes.html">Política de xarxes</a></li>
          <li><a href="https://tradicionsdemataro.github.io/tradicionsdemataro/avis.html">Avìs legal</a></li>
        </ul>
      </div>

      <div class="footer-col footer-social-col">
        <h3 class="footer-col-title">Segueix-nos</h3>

        <div class="social-list">
          <a href="https://www.instagram.com/tradicionsdemataro" target="_blank" rel="noopener noreferrer" class="social-link">
            <i class="ti ti-brand-instagram" aria-hidden="true"></i>
            <span>Instagram</span>
          </a>
          <a href="https://www.tiktok.com/@tradicionsdemataro" target="_blank" rel="noopener noreferrer" class="social-link">
            <i class="ti ti-brand-tiktok" aria-hidden="true"></i>
            <span>TikTok</span>
          </a>
          <a href="https://www.youtube.com/channel/UCpMtIIlyod3HaPb5Lwl52qw" target="_blank" rel="noopener noreferrer" class="social-link">
            <i class="ti ti-brand-youtube" aria-hidden="true"></i>
            <span>YouTube</span>
          </a>
          <a href="https://www.threads.com/login/?next=https%3A%2F%2Fwww.threads.com%2F%40tradicionsdemataro%25C3%25A7%2F" target="_blank" rel="noopener noreferrer" class="social-link">
            <i class="ti ti-brand-threads" aria-hidden="true"></i>
            <span>Threads</span>
          </a>
          <a href="https://x.com/mataro_de" target="_blank" rel="noopener noreferrer" class="social-link">
            <i class="ti ti-link" aria-hidden="true"></i>
            <span>Twitter</span>
          </a>
        </div>
      </div>

    </div>

    <div class="footer-bottom">
      <div class="footer-mark">
        <span class="footer-mark-icon">TM</span>
        <span class="footer-mark-text">Tradicions de Mataró</span>
      </div>

      <div class="footer-bottom-text">
        <p>© 2015–2026 Tradicions de Mataró</p>
        <span>Tots els drets reservats</span>
      </div>
    </div>
  `;

  footerEl.classList.add("footer");
}

document.addEventListener("DOMContentLoaded", renderFooter);
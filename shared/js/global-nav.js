/**
 * Design Home - Universal Global Navigation Bar Auto-Injector
 */
(function () {
  if (document.getElementById('dh-global-nav')) return;

  // Determine root path depth based on script src or window location
  const currentPath = window.location.pathname;
  let rootPrefix = './';

  if (currentPath.includes('/trend-style/') || currentPath.includes('/ui-components/')) {
    rootPrefix = '../';
  }

  // Load CSS dynamically if not present
  if (!document.getElementById('dh-global-nav-css')) {
    const link = document.createElement('link');
    link.id = 'dh-global-nav-css';
    link.rel = 'stylesheet';
    link.href = rootPrefix + 'shared/css/global-nav.css';
    document.head.appendChild(link);
  }

  const navHTML = `
    <nav id="dh-global-nav">
      <a href="${rootPrefix}index.html" class="dh-brand">
        <div class="dh-brand-badge">DH</div>
        <span>Design Home</span>
      </a>
      <ul class="dh-nav-links">
        <li>
          <a href="${rootPrefix}index.html" class="dh-nav-link ${currentPath.endsWith('index.html') && !currentPath.includes('/') ? 'active' : ''}">
            🏠 <span>Home</span>
          </a>
        </li>
        <li>
          <a href="${rootPrefix}trend-style/index.html" class="dh-nav-link ${currentPath.includes('trend-style') ? 'active' : ''}">
            🎨 <span>Trend Styles</span>
          </a>
        </li>
        <li>
          <a href="${rootPrefix}ui-components/index.html" class="dh-nav-link ${currentPath.includes('ui-components') ? 'active' : ''}">
            🧩 <span>UI Components</span>
          </a>
        </li>
      </ul>
      <a href="https://github.com/pollux-o4/design-home" target="_blank" rel="noopener" class="dh-nav-btn">
        GitHub
      </a>
    </nav>
  `;

  function injectNav() {
    const container = document.createElement('div');
    container.innerHTML = navHTML.trim();
    document.body.insertBefore(container.firstChild, document.body.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNav);
  } else {
    injectNav();
  }
})();

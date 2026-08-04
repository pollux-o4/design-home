/**
 * Design Home - Universal Global Navigation Bar Auto-Injector with i18n
 */
(function () {
  if (document.getElementById('dh-global-nav')) return;

  const currentPath = window.location.pathname;
  let rootPrefix = './';

  if (currentPath.includes('/trend-style/') || currentPath.includes('/ui-components/')) {
    rootPrefix = '../';
  }

  const navHTML = `
    <nav id="dh-global-nav" aria-label="Global Navigation">
      <a href="${rootPrefix}index.html" class="dh-brand">
        <div class="dh-brand-badge" aria-hidden="true">DH</div>
        <span>Design Home</span>
      </a>
      <ul class="dh-nav-links">
        <li>
          <a href="${rootPrefix}index.html" class="dh-nav-link ${currentPath.endsWith('index.html') && !currentPath.includes('/trend-style') && !currentPath.includes('/ui-components') ? 'active' : ''}">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span data-i18n="nav_home">홈</span>
          </a>
        </li>
        <li>
          <a href="${rootPrefix}trend-style/index.html" class="dh-nav-link ${currentPath.includes('trend-style') ? 'active' : ''}">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.2 19.54 10.56 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>
            <span data-i18n="nav_trends">트렌드 스타일</span>
          </a>
        </li>
        <li>
          <a href="${rootPrefix}ui-components/index.html" class="dh-nav-link ${currentPath.includes('ui-components') ? 'active' : ''}">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
            <span data-i18n="nav_components">UI 컴포넌트</span>
          </a>
        </li>
      </ul>

      <div class="dh-nav-right">
        <div class="dh-lang-switcher" aria-label="Language Selector">
          <button id="dh-lang-ko" class="dh-lang-btn" onclick="window.setLanguage('ko')" aria-label="한국어로 변경">KO</button>
          <button id="dh-lang-en" class="dh-lang-btn" onclick="window.setLanguage('en')" aria-label="Switch to English">EN</button>
        </div>
        <a href="https://github.com/pollux-o4/design-home" target="_blank" rel="noopener" class="dh-nav-btn" aria-label="GitHub Repository (opens in a new tab)">
          <svg aria-hidden="true" style="width:14px;height:14px;fill:currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          GitHub
        </a>
      </div>
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

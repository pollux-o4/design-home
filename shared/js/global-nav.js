/**
 * Design Home - Universal Global Navigation Bar Auto-Injector with i18n
 */
(function () {
  if (document.getElementById("dh-global-nav")) return;

  const currentPath = window.location.pathname;
  let rootPrefix = "./";

  if (
    currentPath.includes("/trend-style/") ||
    currentPath.includes("/ui-components/") ||
    currentPath.includes("/libraries/")
  ) {
    rootPrefix = "../";
  }

  const destinations = [
    { path: "index.html", key: "nav_home", label: "홈", icon: "home" },
    {
      path: "trend-style/index.html",
      key: "nav_trends",
      label: "트렌드 스타일",
      icon: "layers",
    },
    {
      path: "ui-components/index.html",
      key: "nav_components",
      label: "Patterns",
      icon: "grid",
    },
    {
      path: "libraries/index.html",
      key: "nav_libraries",
      label: "Libraries",
      icon: "layers",
    },
  ];
  if (document.body.classList.contains("home-page"))
    destinations.push({
      path: "design-library/",
      key: "nav_library",
      label: "Design Library",
      icon: "library",
    });
  const activePath = currentPath.includes("/trend-style/")
    ? "trend-style/index.html"
    : currentPath.includes("/libraries/")
      ? "libraries/index.html"
      : currentPath.includes("/ui-components/")
        ? "ui-components/index.html"
        : "index.html";

  const navHTML = `
    <nav id="dh-global-nav" aria-label="Global Navigation">
      <a href="${rootPrefix}index.html" class="dh-brand">
        <div class="dh-brand-badge" aria-hidden="true">DH</div>
        <span>Design Home</span>
      </a>
      <ul class="dh-nav-links">
        ${destinations
          .map(
            (destination) => `
        <li>
          <a href="${rootPrefix}${destination.path}" class="dh-nav-link ${activePath === destination.path ? "active" : ""}">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><use href="${rootPrefix}shared/assets/interface-icons.svg#${destination.icon}"/></svg>
            <span data-i18n="${destination.key}">${destination.label}</span>
          </a>
        </li>`,
          )
          .join("")}
      </ul>

      <div class="dh-nav-right">
        <div class="dh-lang-switcher" aria-label="Language Selector">
          <button id="dh-lang-ko" class="dh-lang-btn" onclick="window.setLanguage('ko')" aria-label="한국어로 변경">KO</button>
          <button id="dh-lang-en" class="dh-lang-btn" onclick="window.setLanguage('en')" aria-label="Switch to English">EN</button>
        </div>
        <a href="https://github.com/pollux-o4/design-home" target="_blank" rel="noopener" class="dh-nav-btn" aria-label="GitHub Repository (opens in a new tab)">
          <svg aria-hidden="true" style="width:14px;height:14px;fill:currentColor" viewBox="0 0 24 24"><use href="${rootPrefix}shared/assets/interface-icons.svg#github"/></svg>
          GitHub
        </a>
      </div>
    </nav>
  `;

  function injectNav() {
    if (document.getElementById("dh-global-nav")) return;
    const container = document.createElement("div");
    container.innerHTML = navHTML.trim();
    document.body.insertBefore(container.firstChild, document.body.firstChild);
    document.dispatchEvent(new Event("dh:navigation-ready"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectNav);
  } else {
    injectNav();
  }
})();

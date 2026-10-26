/** Shared site navigation: study resources disclose; Design Library stays one click away. */
(function () {
  if (document.getElementById("dh-global-nav")) return;

  // Resolve from this script so nested pages and GitHub Pages share the same routes.
  const root = new URL("../..", document.currentScript.src);
  const href = (path) => new URL(path, root).href;
  const currentPath = location.pathname;
  const studies = [
    {
      path: "trend-style/",
      key: "nav_trends",
      label: "트렌드 스타일",
      icon: "layers",
    },
    {
      path: "ui-components/",
      key: "nav_components",
      label: "Patterns",
      icon: "grid",
    },
    {
      path: "libraries/",
      key: "nav_libraries",
      label: "Libraries",
      icon: "layers",
    },
    {
      path: "glossary/",
      key: "nav_glossary",
      label: "용어집",
      icon: "library",
    },
  ];
  const activeStudy = studies.find((item) =>
    currentPath.startsWith(new URL(item.path, root).pathname),
  );
  const inLibrary = currentPath.startsWith(
    new URL("design-library/", root).pathname,
  );
  const icon = (name) =>
    `<svg aria-hidden="true" viewBox="0 0 24 24"><use href="${href("shared/assets/interface-icons.svg")}#${name}"/></svg>`;
  const navHTML = `
    <nav id="dh-global-nav" aria-label="Global Navigation">
      <a href="${href("index.html")}" class="dh-brand" ${!activeStudy && !inLibrary ? 'aria-current="page"' : ""}>
        <span class="dh-brand-badge" aria-hidden="true">DH</span><span>Design Home</span>
      </a>
      <ul class="dh-nav-links">
        <li class="dh-study">
          <button type="button" class="dh-nav-link dh-study-toggle ${activeStudy ? "active" : ""}" id="dh-study-toggle" aria-expanded="false" aria-controls="dh-study-panel">
            <span>Design Study</span><span class="dh-disclosure-caret" aria-hidden="true"></span>
          </button>
          <ul id="dh-study-panel" class="dh-study-panel" aria-labelledby="dh-study-toggle" hidden>
            ${studies.map((item) => `<li><a href="${href(`${item.path}index.html`)}" class="dh-study-link ${activeStudy === item ? "active" : ""}" ${activeStudy === item ? 'aria-current="page"' : ""}>${icon(item.icon)}<span data-i18n="${item.key}">${item.label}</span></a></li>`).join("")}
          </ul>
        </li>
        <li><a href="${href("design-library/")}" class="dh-nav-link ${inLibrary ? "active" : ""}" ${inLibrary ? 'aria-current="page"' : ""}><span>Design Library</span></a></li>
      </ul>
      <div class="dh-nav-right">
        <div class="dh-lang-switcher" aria-label="Language Selector">
          <button type="button" id="dh-lang-ko" class="dh-lang-btn" aria-label="한국어로 변경">KO</button>
          <button type="button" id="dh-lang-en" class="dh-lang-btn" aria-label="Switch to English">EN</button>
        </div>
        <a href="https://github.com/pollux-o4/design-home" target="_blank" rel="noopener" class="dh-nav-btn" aria-label="GitHub Repository (opens in a new tab)">${icon("github")}<span>GitHub</span></a>
      </div>
    </nav>`;

  function injectNav() {
    if (document.getElementById("dh-global-nav")) return;
    const container = document.createElement("div");
    container.innerHTML = navHTML.trim();
    const nav = container.firstChild;
    const skipLink = document.querySelector("body > .skip-link");
    if (skipLink) skipLink.after(nav);
    else document.body.prepend(nav);
    const toggle = nav.querySelector("#dh-study-toggle");
    const panel = nav.querySelector("#dh-study-panel");
    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
    }
    toggle.addEventListener("click", () => setOpen(panel.hidden));
    panel.addEventListener("focusin", (event) => {
      event.target.closest("a")?.scrollIntoView({ block: "nearest" });
    });
    nav.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !panel.hidden) {
        event.preventDefault();
        setOpen(false);
        toggle.focus();
      }
    });
    nav.addEventListener("focusout", (event) => {
      if (!nav.contains(event.relatedTarget)) setOpen(false);
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".dh-study")) setOpen(false);
    });
    window.addEventListener("pageshow", () => setOpen(false));
    for (const language of ["ko", "en"]) {
      nav
        .querySelector(`#dh-lang-${language}`)
        .addEventListener("click", () => window.setLanguage?.(language));
    }
    document.dispatchEvent(new Event("dh:navigation-ready"));
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", injectNav);
  else injectNav();
})();

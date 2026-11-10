/** Shared site navigation: study resources disclose; Design System Library stays one click away. */
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
  const inLibrary = currentPath.startsWith(new URL("design-library/", root).pathname);
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
        <li><a href="${href("design-library/")}" class="dh-nav-link ${inLibrary ? "active" : ""}" ${inLibrary ? 'aria-current="page"' : ""}><span>Design System Library</span></a></li>
      </ul>
      <div class="dh-nav-right">
        <div class="dh-theme-switcher">
          <button type="button" id="dh-theme-toggle" class="dh-theme-toggle" aria-expanded="false" aria-controls="dh-theme-panel"><span class="sr-only" data-i18n="theme_label">색상 테마</span><span id="dh-theme-current" aria-hidden="true">시스템</span><span class="dh-disclosure-caret" aria-hidden="true"></span></button>
          <div id="dh-theme-panel" class="dh-theme-panel" role="group" aria-label="색상 테마" hidden>
            <button type="button" data-theme-choice="system" aria-pressed="true"><span data-i18n="theme_system">시스템</span><span aria-hidden="true">✓</span></button>
            <button type="button" data-theme-choice="light" aria-pressed="false"><span data-i18n="theme_light">라이트</span><span aria-hidden="true">✓</span></button>
            <button type="button" data-theme-choice="dark" aria-pressed="false"><span data-i18n="theme_dark">다크</span><span aria-hidden="true">✓</span></button>
          </div>
        </div>
        <div class="dh-lang-switcher" aria-label="Language Selector">
          <button type="button" id="dh-lang-ko" class="dh-lang-btn" aria-label="KO · 한국어로 변경">KO</button>
          <button type="button" id="dh-lang-en" class="dh-lang-btn" aria-label="EN · Switch to English">EN</button>
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
    const themeToggle = nav.querySelector("#dh-theme-toggle");
    const themePanel = nav.querySelector("#dh-theme-panel");
    const themeChoices = [...themePanel.querySelectorAll("[data-theme-choice]")];
    const setThemeOpen = (open) => {
      themePanel.hidden = !open;
      themeToggle.setAttribute("aria-expanded", String(open));
    };
    const updateTheme = () => {
      const preference = window.getTheme?.() ?? "system";
      for (const choice of themeChoices)
        choice.setAttribute("aria-pressed", String(choice.dataset.themeChoice === preference));
      nav.querySelector("#dh-theme-current").textContent = themeChoices.find(
        (choice) => choice.dataset.themeChoice === preference,
      ).firstElementChild.textContent;
      themePanel.setAttribute(
        "aria-label",
        nav.querySelector('[data-i18n="theme_label"]').textContent,
      );
      themeToggle.setAttribute(
        "aria-label",
        `${themePanel.getAttribute("aria-label")}: ${nav.querySelector("#dh-theme-current").textContent}`,
      );
    };
    themeToggle.addEventListener("click", () => setThemeOpen(themePanel.hidden));
    themeChoices.forEach((choice) =>
      choice.addEventListener("click", () => {
        window.setTheme?.(choice.dataset.themeChoice);
        setThemeOpen(false);
        themeToggle.focus();
      }),
    );
    nav.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !themePanel.hidden) {
        event.preventDefault();
        setThemeOpen(false);
        themeToggle.focus();
      }
    });
    nav.addEventListener("focusout", (event) => {
      if (!event.relatedTarget?.closest?.(".dh-theme-switcher")) setThemeOpen(false);
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".dh-theme-switcher")) setThemeOpen(false);
    });
    document.addEventListener("dh:theme-change", updateTheme);
    document.addEventListener("dh:language-change", updateTheme);
    updateTheme();
    document.dispatchEvent(new Event("dh:navigation-ready"));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", injectNav);
  else injectNav();
})();

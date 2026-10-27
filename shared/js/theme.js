/** Applies the persisted display preference before the page is rendered. */
(function () {
  const storageKey = "dh_theme";
  const preferences = new Set(["system", "light", "dark"]);
  const root = document.documentElement;
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

  function getTheme() {
    const stored = localStorage.getItem(storageKey);
    return preferences.has(stored) ? stored : "system";
  }

  function resolvedTheme(preference = getTheme()) {
    return preference === "system"
      ? systemTheme.matches
        ? "dark"
        : "light"
      : preference;
  }

  function applyTheme(preference = getTheme()) {
    if (preference === "system") root.removeAttribute("data-theme");
    else root.dataset.theme = preference;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", resolvedTheme(preference) === "dark" ? "#161618" : "#f5f5f7");
    document.dispatchEvent(
      new CustomEvent("dh:theme-change", {
        detail: { preference, resolved: resolvedTheme(preference) },
      }),
    );
  }

  window.getTheme = getTheme;
  window.setTheme = (preference) => {
    if (!preferences.has(preference)) return;
    if (preference === "system") localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey, preference);
    applyTheme(preference);
  };

  systemTheme.addEventListener("change", () => {
    if (getTheme() === "system") applyTheme();
  });
  applyTheme();
})();

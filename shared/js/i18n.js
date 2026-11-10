import english from "./messages/en.js";

const originals = new WeakMap();
let currentLanguage = localStorage.getItem("dh_lang") || "ko";

function applyLanguage(language) {
  if (!["ko", "en"].includes(language)) return;
  currentLanguage = language;
  localStorage.setItem("dh_lang", language);
  document.documentElement.lang = language;
  for (const element of document.querySelectorAll("[data-i18n]")) {
    if (!originals.has(element)) originals.set(element, element.innerHTML);
    element.innerHTML =
      language === "en"
        ? (english[element.dataset.i18n] ?? originals.get(element))
        : originals.get(element);
  }
  for (const option of ["ko", "en"]) {
    const button = document.getElementById(`dh-lang-${option}`);
    if (!button) continue;
    button.classList.toggle("active", option === language);
    if (option === language) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  }
  document.dispatchEvent(new Event("dh:language-change"));
}

window.setLanguage = applyLanguage;
document.addEventListener("dh:navigation-ready", () => applyLanguage(currentLanguage));
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => applyLanguage(currentLanguage), {
    once: true,
  });
} else {
  applyLanguage(currentLanguage);
}

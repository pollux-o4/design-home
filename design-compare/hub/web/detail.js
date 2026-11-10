import { readRoute, routeUrl, navigate } from "./navigation.js";
import { renderContext } from "./context.js";
import { bindClipboard } from "../../../shared/js/clipboard.js";
const $ = (selector) => document.querySelector(selector);

export function createDetailView(source) {
  function applyTab() {
    const guide = readRoute().params.get("view") === "guide";
    $("#preview-panel").hidden = guide;
    $("#guide-panel").hidden = !guide;
    $("#show-preview").setAttribute("aria-pressed", String(!guide));
    $("#show-guide").setAttribute("aria-pressed", String(guide));
  }
  function setViewport(mode) {
    $("#preview").classList.toggle("mobile", mode === "mobile");
    for (const option of ["desktop", "mobile"]) {
      $(`#${option}`).setAttribute("aria-pressed", String(mode === option));
    }
  }
  for (const [id, view] of [
    ["show-preview", "preview"],
    ["show-guide", "guide"],
  ]) {
    $(`#${id}`).addEventListener("click", () => {
      const route = readRoute(),
        params = new URLSearchParams(route.params);
      params.set("view", view);
      history.replaceState(history.state, "", routeUrl(route.category, route.id, params));
      applyTab();
    });
  }
  for (const mode of ["desktop", "mobile"]) {
    $(`#${mode}`).addEventListener("click", () => setViewport(mode));
  }
  bindClipboard(
    $("#copy"),
    $("#copy-status"),
    () => $("#command").textContent,
    "명령을 직접 선택해 복사하세요.",
  );

  return {
    async show({ category, id }, current) {
      const design = await source.detail(category, id);
      if (!current()) return;
      const actual = design.kind === "component" ? "components" : "trends";
      if (category !== "work" && category !== actual) {
        navigate(actual, id, readRoute().params, true);
        return;
      }
      setViewport("desktop");
      renderContext(design);
      applyTab();
      $("#copy-status").textContent = "";
      $("#title").focus({ preventScroll: true });
      document.title = `${design.title} · Design System Library`;
    },
  };
}

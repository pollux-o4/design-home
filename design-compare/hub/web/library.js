import { getJSON } from "./api.js";
import { readRoute, routeUrl, navigate } from "./navigation.js";
import { renderResults, renderContext } from "./render.js";
import { renderFacets } from "./facets.js";
const $ = (selector) => document.querySelector(selector);
export function createLibraryView() {
  const origins = new Map();
  let debounce;
  function applyTab() {
    const guide = readRoute().params.get("view") === "guide";
    $("#preview-panel").hidden = guide;
    $("#guide-panel").hidden = !guide;
    $("#show-preview").setAttribute("aria-pressed", String(!guide));
    $("#show-guide").setAttribute("aria-pressed", String(guide));
  }
  for (const [id, view] of [
    ["show-preview", "preview"],
    ["show-guide", "guide"],
  ])
    $(`#${id}`).addEventListener("click", () => {
      const route = readRoute(),
        params = new URLSearchParams(route.params);
      params.set("view", view);
      history.replaceState(
        history.state,
        "",
        routeUrl(route.category, route.id, params),
      );
      applyTab();
    });
  $("#search").addEventListener("submit", (event) => {
    event.preventDefault();
    const route = readRoute(),
      params = new URLSearchParams(route.params),
      query = $("#query").value.trim();
    query ? params.set("q", query) : params.delete("q");
    navigate(route.category, null, params, true);
  });
  $("#query").addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => $("#search").requestSubmit(), 250);
  });
  for (const mode of ["desktop", "mobile"])
    $(`#${mode}`).addEventListener("click", () => {
      $("#preview").classList.toggle("mobile", mode === "mobile");
      for (const option of ["desktop", "mobile"])
        $(`#${option}`).setAttribute("aria-pressed", String(mode === option));
    });
  $("#copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText($("#command").textContent);
      $("#copy-status").textContent = "복사됨";
    } catch {
      $("#copy-status").textContent = "명령을 직접 선택해 복사하세요.";
    }
  });
  return {
    async show({ category, id, params }, current) {
      clearTimeout(debounce);
      if (id) {
        const data = await getJSON(
          category === "work"
            ? `/api/components?id=${encodeURIComponent(id)}`
            : `/api/context?id=${encodeURIComponent(id)}`,
        );
        if (!current()) return;
        const actual = data.kind === "component" ? "components" : "trends";
        if (category !== "work" && category !== actual) {
          navigate(actual, id, params, true);
          return;
        }
        const design =
          category === "work"
            ? {
                ...data,
                id: data.referenceId,
                kind: "work",
                summary: data.description,
                previewPath: data.conditions.url,
                capture: data.conditions,
                sourceFiles: (data.sources ?? []).map((path) => ({ path })),
                constraints: [],
                structure: [],
                interactions: [],
              }
            : data;
        renderContext(design);
        applyTab();
        $("#copy-status").textContent = "";
        $("#title").focus({ preventScroll: true });
        document.title = `${design.title} · Design Library`;
        return;
      }
      const query = params.get("q") ?? "",
        tags = params.getAll("tag");
      $("#query").value = query;
      $("#query").placeholder =
        category === "components"
          ? "모달, 입력, 알림…"
          : category === "work"
            ? "작업물 이름 또는 용도…"
            : "미니멀, 다크, 입체…";
      $("#count").textContent = "불러오는 중…";
      $("#results").replaceChildren();
      $("#filters").hidden = category === "work";
      $("#filters").open = tags.length > 0;
      let result;
      if (category === "work") {
        const data = await getJSON("/api/components");
        result = {
          results: data.references
            .filter(
              (item) =>
                item.mode === "live" &&
                item.status === "ready" &&
                !item.transient &&
                (!query || `${item.title} ${item.description}`.includes(query)),
            )
            .map((item) => ({
              ...item,
              kind: "work",
              summary: item.description,
            })),
        };
      } else
        result = await getJSON(
          `/api/search?kind=${category === "components" ? "component" : "trend"}&q=${encodeURIComponent(query)}${tags.map((tag) => `&tag=${encodeURIComponent(tag)}`).join("")}`,
        );
      if (!current()) return;
      if (category !== "work")
        renderFacets(result, (tag) => {
          const next = new URLSearchParams(params),
            chosen = new Set(tags);
          chosen.has(tag) ? chosen.delete(tag) : chosen.add(tag);
          next.delete("tag");
          for (const value of chosen) next.append("tag", value);
          navigate(category, null, next, true);
        });
      $("#filter-count").textContent = tags.length
        ? `${tags.length}개 선택`
        : "";
      renderResults(result, (itemId) => {
        origins.set(category, { id: itemId, scroll: window.scrollY });
        navigate(category, itemId, params);
      });
      const origin = origins.get(category);
      if (origin) {
        [...document.querySelectorAll(".design-card")]
          .find((card) => card.dataset.id === origin.id)
          ?.focus({ preventScroll: true });
        window.scrollTo({ top: origin.scroll, behavior: "instant" });
      }
    },
  };
}

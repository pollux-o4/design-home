import { categories, libraries, libraryById } from "./catalog.js";
import { createCategoryView } from "./category-view.js";
import { renderComparison } from "./comparison.js";
import { readRoute, routeUrl, matches, comparisonLimit } from "./route.js";
const $ = (selector) => document.querySelector(selector);
let state = readRoute(),
  lastCompare = "";
const views = categories.map((category) => {
  const items = libraries.filter((item) => item.category === category.id);
  const view = createCategoryView(category, items, {
    onToggle: (open) => navigate({ category: open ? category.id : "" }),
    onCompare: toggleCompare,
  });
  $("#categories").append(view.element);
  return view;
});
function navigate(patch, replace = false) {
  const next = { ...state, ...patch };
  history[replace ? "replaceState" : "pushState"](null, "", routeUrl(next));
  update();
}
function toggleCompare(id) {
  const selected = state.compare.includes(id);
  if (!selected && state.compare.length === comparisonLimit) return;
  navigate({
    compare: selected
      ? state.compare.filter((value) => value !== id)
      : [...state.compare, id],
  });
  $("#status").textContent =
    `${libraryById.get(id).name} ${selected ? "비교에서 제거했습니다." : "비교에 추가했습니다."} (${state.compare.length}/${comparisonLimit})`;
}
function update(initial = false) {
  state = readRoute();
  if ($("#library-search").value !== state.query)
    $("#library-search").value = state.query;
  $("#reset-search").hidden = !state.query;
  const count = views.reduce(
    (sum, view) => sum + view.update(state, initial),
    0,
  );
  $("#empty").hidden = count > 0;
  $("#comparison").hidden = !state.compare.length;
  $("#show-comparison").hidden = !state.compare.length;
  $("#show-comparison").textContent = `비교 보기 (${state.compare.length})`;
  $("#comparison-hint").textContent =
    state.compare.length === 1
      ? "하나 더 선택하면 차이를 나란히 살펴볼 수 있습니다. 최대 3개까지 비교합니다."
      : `${state.compare.length}개 선택 · 최대 3개. 다른 역할의 도구는 서로 조합할 수도 있습니다.`;
  const key = state.compare.join(",");
  if (key !== lastCompare) {
    const focused = document.activeElement;
    const restoringFocus = $("#comparison-content").contains(focused);
    renderComparison(
      $("#comparison-content"),
      state.compare.map((id) => libraryById.get(id)),
      toggleCompare,
    );
    if (restoringFocus)
      ($("#comparison-content button") ?? $("#library-search")).focus();
    lastCompare = key;
  }
}
$("#library-search").addEventListener("input", (event) =>
  navigate(
    {
      query: event.target.value,
      category:
        libraries.find(
          (item) =>
            item.category === state.category &&
            matches(item, event.target.value),
        )?.category ??
        libraries.find((item) => matches(item, event.target.value))?.category ??
        "",
    },
    true,
  ),
);
$("#reset-search").addEventListener("click", () => {
  navigate({ query: "" });
  $("#library-search").focus();
});
$("#clear-comparison").addEventListener("click", () => {
  navigate({ compare: [] });
  $("#library-search").focus();
  $("#status").textContent = "비교 목록을 비웠습니다.";
});
window.addEventListener("hashchange", () => update());
window.addEventListener("popstate", () => update());
window.addEventListener("pagehide", () =>
  views.forEach((view) => view.dispose()),
);
update(true);

$("#show-comparison").addEventListener("click", () => {
  $("#comparison").scrollIntoView({
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
    block: "start",
  });
  $("#compare-title").tabIndex = -1;
  $("#compare-title").focus({ preventScroll: true });
});

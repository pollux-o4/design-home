import { createOverview } from "./pattern-overview.js";
import { createSampleGrid } from "./sample-card.js";

export function createSearchView({
  state,
  catalog,
  model,
  navigate,
  focusSearch,
}) {
  const element = document.createDocumentFragment();
  const topics = model.search(state.query, state.view);
  const results = catalog.filter(
    catalog.modules.flatMap(catalog.components),
    state.query,
  );
  if (results.length) {
    const title = document.createElement("h2");
    title.className = "artboard-title";
    title.textContent = `검색 결과 · ${results.length}`;
    element.append(title, createSampleGrid(results));
  } else if (topics.length) {
    element.append(createOverview(topics, state.view));
  } else {
    const empty = document.createElement("div");
    empty.className = "empty-results";
    const title = document.createElement("h2");
    title.textContent = "검색 결과가 없습니다";
    const text = document.createElement("p");
    text.textContent = `'${state.query}' 와 일치하는 패턴이 없습니다.`;
    const reset = document.createElement("button");
    reset.id = "reset-search";
    reset.className = "ui-btn ui-btn-primary";
    reset.textContent = "검색 초기화";
    reset.addEventListener("click", () => {
      navigate({ ...state, query: "" });
      focusSearch();
    });
    empty.append(title, text, reset);
    element.append(empty);
  }
  return element;
}

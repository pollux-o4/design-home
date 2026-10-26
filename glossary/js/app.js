import { motionDemos } from "./motion-demos.js";
import { uxDemos } from "./ux-demos.js";
import { createGlossary, categories } from "./catalog.js";
import { readRoute, routeHref } from "./route.js";
import { visual } from "./visual.js";
import { mount } from "../../ui-components/js/samples/runtime.js";

const patterns = window.CanvasCatalog.create(window.ComponentModules);
const catalog = {
  find: (id) =>
    motionDemos.find((item) => item.id === id) ||
    uxDemos.find((item) => item.id === id) ||
    patterns.find(id),
};
const entries = createGlossary(catalog);
const search = document.querySelector("#term-search");
const list = document.querySelector("#list-view");
const detail = document.querySelector("#detail-view");
const container = document.querySelector("#categories");
const status = document.querySelector("#route-status");
let state,
  disposeDemo = () => {},
  expanded = "",
  lastList;
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
function link(text, route, className) {
  const node = el("a", className, text);
  node.href = routeHref(route);
  return node;
}
function button(text, className, action) {
  const node = el("button", className, text);
  node.type = "button";
  node.addEventListener("click", action);
  return node;
}
function navigate(route, replace = false) {
  const url = routeHref(route);
  if (location.hash === url) return;
  if (replace) {
    history.replaceState(null, "", url);
    render();
  } else location.hash = url;
}
function demo(entry, large = false, initialExample = state.example) {
  const root = el("section", "example");
  root.setAttribute("aria-label", `${entry.title} 체험`);
  const top = el("div", "example-toolbar");
  const label = el("span", "example-label", "직접 해보기");
  const reset = button("↺ 다시 시작", "quiet-button", () => show(selected));
  const stage = el("div", "example-stage");
  const choices = el("div", "example-choices");
  choices.setAttribute("role", "group");
  choices.setAttribute("aria-label", "체험 예시 선택");
  let selected = entry.samples.includes(initialExample)
      ? initialExample
      : entry.samples[0],
    dispose = () => {};
  function show(id) {
    dispose();
    selected = id;
    root.dataset.example = id;
    const fullLink = root.querySelector(".detail-link");
    if (fullLink)
      fullLink.href = routeHref({
        ...state,
        category: entry.category,
        id: entry.id,
        example: id,
      });
    if (large) {
      state = { ...state, example: id };
      history.replaceState(null, "", routeHref(state));
    }
    stage.replaceChildren();
    const definition = catalog.find(id);
    const sample = el("div", "example-content");
    sample.innerHTML = definition.render();
    stage.append(sample);
    dispose = definition.mount
      ? definition.mount(sample.firstElementChild)
      : mount(sample.firstElementChild, definition.behavior);
    choices
      .querySelectorAll("button")
      .forEach((item) =>
        item.setAttribute("aria-pressed", String(item.dataset.sample === id)),
      );
  }
  if (entry.samples.length > 1) {
    entry.samples.forEach((id) => {
      const choice = button(catalog.find(id).title, "example-choice", () =>
        show(id),
      );
      choice.dataset.sample = id;
      choices.append(choice);
    });
  }
  top.append(label, reset);
  root.append(top);
  if (choices.childElementCount) root.append(choices);
  root.append(stage);
  const bottom = el("div", "example-bottom");
  bottom.append(
    el("span", "simulation-note", "학습용 예시 · 실제 데이터에 영향 없음"),
  );
  if (!large)
    bottom.append(
      link(
        "전체 화면으로 보기 ↗",
        { ...state, category: entry.category, id: entry.id },
        "detail-link",
      ),
    );
  root.append(bottom);
  show(selected);
  disposeDemo = () => dispose();
  return root;
}
function openInline(entry, row, trigger, initialExample = "") {
  const wasOpen = expanded === entry.id;
  disposeDemo();
  disposeDemo = () => {};
  container.querySelectorAll(".expanded-row").forEach((panel) => {
    panel.hidden = true;
    panel.firstElementChild.replaceChildren();
  });
  container.querySelectorAll("[data-expand]").forEach((node) => {
    node.setAttribute("aria-expanded", "false");
    node.querySelector(".try-label").textContent = "체험";
  });
  expanded = wasOpen ? "" : entry.id;
  if (wasOpen) return;
  const extra = document.getElementById(`example-${entry.id}`);
  extra.hidden = false;
  extra.firstElementChild.append(demo(entry, false, initialExample));
  trigger.setAttribute("aria-expanded", "true");
  trigger.querySelector(".try-label").textContent = "접기";
}
function table(items) {
  const table = el("table", "terms-table");
  const caption = el("caption", "sr-only", "용어, 뜻, 시각적 예시와 체험");
  const head = el("thead");
  const labels = el("tr");
  ["용어", "한 줄 뜻", "예시"].forEach((title) => {
    const cell = el("th", "", title);
    cell.scope = "col";
    labels.append(cell);
  });
  head.append(labels);
  const body = el("tbody");
  for (const entry of items) {
    const row = el("tr", "term-row");
    row.dataset.term = entry.id;
    const name = el("th", "term-name");
    name.scope = "row";
    const title = link(
      entry.title,
      { ...state, category: entry.category, id: entry.id, example: "" },
      "term-link",
    );
    const english = el("span", "term-english", entry.term);
    english.lang = "en";
    name.append(title, english);
    const definition = el("td", "term-definition", entry.desc);
    const preview = el("td", "term-preview");
    const trigger = button("", "try-button", () =>
      openInline(entry, row, trigger),
    );
    trigger.dataset.expand = entry.id;
    trigger.setAttribute("aria-label", `${entry.title} 예시 체험`);
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", `example-${entry.id}`);
    trigger.append(visual(entry.visual), el("span", "try-label", "체험"));
    preview.append(trigger);
    row.append(name, definition, preview);
    const extra = el("tr", "expanded-row");
    extra.id = `example-${entry.id}`;
    extra.hidden = true;
    const extraCell = el("td");
    extraCell.colSpan = 3;
    extra.append(extraCell);
    body.append(row, extra);
  }
  table.append(caption, head, body);
  return table;
}
function renderList() {
  const query = state.query.trim().toLocaleLowerCase();
  const filtered = entries.filter((entry) =>
    [entry.title, entry.term, entry.desc]
      .join(" ")
      .toLocaleLowerCase()
      .includes(query),
  );
  search.value = state.query;
  document.querySelector("#clear-search").hidden = !state.query;
  document.querySelector("#term-count").textContent = filtered.length;
  document.querySelector("#empty-state").hidden = filtered.length !== 0;
  container.replaceChildren();
  for (const category of categories) {
    const items = filtered.filter((entry) => entry.category === category.id);
    if (!items.length) continue;
    const section = el("section", `term-category category-${category.id}`);
    const heading = el("h2");
    const isOpen = state.category === category.id || Boolean(query);
    const toggle = button("", "category-toggle", () => {
      // Search reveals matching categories; choosing a category exits search into that list.
      navigate({
        category: state.category === category.id && !query ? "" : category.id,
        query: "",
      });
    });
    toggle.id = `category-${category.id}`;
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-controls", `panel-${category.id}`);
    const copy = el("span", "category-copy");
    copy.append(
      el("span", "category-title", category.title),
      el("span", "category-subtitle", category.subtitle),
    );
    toggle.append(
      el("span", "category-mark", category.mark),
      copy,
      el("span", "category-count", String(items.length)),
      el("span", "category-chevron", isOpen ? "−" : "+"),
    );
    heading.append(toggle);
    const panel = el("div", "category-panel");
    panel.id = `panel-${category.id}`;
    panel.hidden = !isOpen;
    if (isOpen) panel.append(table(items));
    section.append(heading, panel);
    container.append(section);
  }
  status.textContent = state.invalid
    ? "찾을 수 없는 용어 주소입니다. 용어집에서 다시 선택하세요."
    : `용어 ${filtered.length}개`;
  if (state.invalid) {
    const notice = el(
      "p",
      "route-notice",
      "이 주소의 용어를 찾을 수 없어요. 아래에서 다시 찾아보세요.",
    );
    container.prepend(notice);
  }
}
function renderDetail(entry) {
  detail.replaceChildren();
  const back = link(
    "← " + categories.find((item) => item.id === entry.category).title,
    { category: entry.category, query: state.query },
    "back-link",
  );
  const header = el("header", "detail-heading");
  const label = el(
    "p",
    "eyebrow",
    `${entry.category.toUpperCase()} / GLOSSARY`,
  );
  const title = el("h1", "", entry.title);
  title.tabIndex = -1;
  const english = el("p", "detail-english", entry.term);
  english.lang = "en";
  header.append(
    label,
    title,
    english,
    el("p", "detail-definition", entry.desc),
  );
  detail.append(back, header, demo(entry, true));
  const footer = el("div", "detail-resources");
  const source = el("a", "", "공식 자료 ↗");
  source.href = entry.reference;
  source.target = "_blank";
  source.rel = "noopener noreferrer";
  source.setAttribute("aria-label", `${entry.title} 공식 자료 (새 탭)`);
  const patterns = el("a", "", "Patterns에서 보기 ↗");
  patterns.href = `../ui-components/index.html?component=${encodeURIComponent(entry.samples.find((id) => !id.startsWith("ux-")) || entry.samples[0])}`;
  if (entry.category !== "motion") footer.append(patterns);
  footer.append(source);
  detail.append(footer);
  title.focus({ preventScroll: true });
  window.scrollTo(0, 0);
  status.textContent = `${entry.title} 체험 화면`;
}
function render() {
  const previous = state;
  state = readRoute(location.hash, entries);
  const activeId = document.activeElement?.id;
  if (state.id && !previous?.id)
    lastList = {
      scroll: scrollY,
      expanded,
      example: container.querySelector(".example")?.dataset.example,
    };
  disposeDemo();
  disposeDemo = () => {};
  expanded = "";
  list.hidden = Boolean(state.id);
  detail.hidden = !state.id;
  const entry = entries.find((item) => item.id === state.id);
  document.title = `${entry ? entry.title + " · " : ""}용어집 · Design Home`;
  if (entry) {
    container.replaceChildren();
    renderDetail(entry);
  } else {
    detail.replaceChildren();
    renderList();
    if (previous?.id && lastList) {
      const trigger = container.querySelector(
        `[data-expand="${lastList.expanded || previous.id}"]`,
      );
      if (trigger && lastList.expanded) {
        const entry = entries.find((item) => item.id === lastList.expanded);
        if (entry)
          openInline(entry, trigger.closest("tr"), trigger, lastList.example);
      }
      trigger?.focus({ preventScroll: true });
      window.scrollTo(0, lastList.scroll);
    } else if (activeId?.startsWith("category-")) {
      document.getElementById(activeId)?.focus({ preventScroll: true });
    }
  }
}
search.addEventListener("input", () =>
  navigate({ ...state, id: "", query: search.value }, true),
);
search.form.addEventListener("submit", (event) => event.preventDefault());
function clearSearch() {
  navigate({ ...state, query: "" }, true);
  search.focus();
}
document.querySelector("#clear-search").addEventListener("click", clearSearch);
document.querySelector("#reset-search").addEventListener("click", clearSearch);
document.addEventListener("keydown", (event) => {
  if (
    event.key === "/" &&
    !event.target.closest("input,textarea,select,[contenteditable]") &&
    !document.querySelector("dialog[open],[popover]:popover-open")
  ) {
    if (state.id) return;
    event.preventDefault();
    search.focus();
  }
  if (event.key === "Escape" && document.activeElement === search)
    clearSearch();
});
window.addEventListener("hashchange", render);
window.addEventListener("pagehide", () => disposeDemo());
window.addEventListener("pageshow", (event) => {
  if (event.persisted) render();
});
document.querySelector(".skip-link").addEventListener("click", (event) => {
  event.preventDefault();
  document.querySelector("#main-content").focus();
});
render();

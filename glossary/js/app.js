import { motionDemos } from "./motion-demos.js";
import { uxDemos } from "./ux-demos.js";
import { createGlossary, categories } from "./catalog.js";
import { readRoute, routeHref } from "./route.js";
import { visual } from "./visual.js";
import { mount } from "../../ui-components/js/samples/runtime.js";
import { localizeGlossary } from "./localization.js";
import { renderGlossaryList } from "./list-view.js";

const patterns = window.CanvasCatalog.create(window.ComponentModules);
const catalog = {
  find: (id) =>
    motionDemos.find((item) => item.id === id) ||
    uxDemos.find((item) => item.id === id) ||
    patterns.find(id),
};
const entries = createGlossary(catalog);
const localization = localizeGlossary(entries, document.querySelector("#main-content"));
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
  let selected = entry.samples.includes(initialExample) ? initialExample : entry.samples[0],
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
      .forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.sample === id)));
  }
  if (entry.samples.length > 1) {
    entry.samples.forEach((id) => {
      const choice = button(catalog.find(id).title, "example-choice", () => show(id));
      choice.dataset.sample = id;
      choices.append(choice);
    });
  }
  top.append(label, reset);
  root.append(top);
  if (choices.childElementCount) root.append(choices);
  root.append(stage);
  const bottom = el("div", "example-bottom");
  bottom.append(el("span", "simulation-note", "학습용 예시 · 실제 데이터에 영향 없음"));
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
function renderList() {
  renderGlossaryList({
    state,
    entries,
    categories,
    search,
    container,
    status,
    el,
    button,
    link,
    visual,
    navigate,
    onExpand: openInline,
  });
}

function renderDetail(entry) {
  detail.replaceChildren();
  const back = link(
    "← " + categories.find((item) => item.id === entry.category).title,
    { category: entry.category, query: state.query },
    "back-link",
  );
  const header = el("header", "detail-heading");
  const label = el("p", "eyebrow", `${entry.category.toUpperCase()} / GLOSSARY`);
  const title = el("h1", "", entry.title);
  title.tabIndex = -1;
  const english = el("p", "detail-english", entry.term);
  english.lang = "en";
  header.append(label, title, english, el("p", "detail-definition", entry.desc));
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
    if (
      previous &&
      !previous.id &&
      state.category &&
      previous.category !== state.category &&
      !state.query &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const panel = document.getElementById(`panel-${state.category}`);
      if (panel && !panel.hidden) {
        const height = panel.getBoundingClientRect().height;
        panel.style.overflow = "hidden";
        const animation = panel.animate(
          [
            { height: "0px", opacity: 0 },
            { height: `${height}px`, opacity: 1 },
          ],
          { duration: 280, easing: "cubic-bezier(.22,1,.36,1)" },
        );
        animation.onfinish = () => {
          panel.style.overflow = "";
        };
      }
    }
    if (previous?.id && lastList) {
      const trigger = container.querySelector(
        `[data-expand="${lastList.expanded || previous.id}"]`,
      );
      if (trigger && lastList.expanded) {
        const entry = entries.find((item) => item.id === lastList.expanded);
        if (entry) openInline(entry, trigger.closest("tr"), trigger, lastList.example);
      }
      trigger?.focus({ preventScroll: true });
      window.scrollTo(0, lastList.scroll);
    } else if (activeId?.startsWith("category-")) {
      document.getElementById(activeId)?.focus({ preventScroll: true });
    }
  }
  localization.update();
}
search.addEventListener("input", () => navigate({ ...state, id: "", query: search.value }, true));
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
  if (event.key === "Escape" && document.activeElement === search) clearSearch();
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

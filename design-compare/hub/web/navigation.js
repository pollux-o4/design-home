import { bindClipboard } from "../../../shared/js/clipboard.js";
import { staticMode } from "./api.js";
export function readRoute() {
  const [path, query = ""] = location.hash.slice(1).split("?");
  const parts = (path ?? "").split("/").filter(Boolean);
  const category = Object.hasOwn(sections, parts[0]) ? parts[0] : "trends";
  let id;
  try {
    id = parts[1] ? decodeURIComponent(parts[1]) : null;
  } catch {
    id = null;
  }
  return { category, id, params: new URLSearchParams(query) };
}
export function routeUrl(category, id, params = new URLSearchParams()) {
  const query = params.toString();
  return `#/${category}${id ? `/${encodeURIComponent(id)}` : ""}${query ? `?${query}` : ""}`;
}
export function navigate(category, id, params, replace = false) {
  const url = routeUrl(category, id, params);
  history[replace ? "replaceState" : "pushState"](
    { hub: true, from: location.hash },
    "",
    url,
  );
  window.dispatchEvent(new Event("hubnavigate"));
}

const sections = {
  trends: [
    "디자인 트렌드",
    "화면의 색, 질감, 분위기를 살펴보세요.",
    "TREND LIBRARY",
    "전체 트렌드",
  ],
  components: [
    "컴포넌트",
    "입력, 탐색, 피드백에 필요한 조작 요소를 찾으세요.",
    "COMPONENT LIBRARY",
    "전체 컴포넌트",
  ],
  work: [
    "등록된 작업",
    "연결된 작업물을 열고 구현 정보를 확인하세요.",
    "YOUR WORK",
    "등록된 작업물",
  ],
  activity: [
    "최근 AI 호출",
    "준비부터 검수까지, 전달된 자료를 흐름대로 확인하세요.",
    "REVIEW JOURNAL",
    "최근 10건",
  ],
  accessibility: [
    "접근성 점검",
    "색 대비와 기본 UI 신호를 확인하고 프로젝트에 적용하세요.",
    "QUALITY CHECKS",
    "접근성 점검",
  ],
};
const $ = (selector) => document.querySelector(selector);
function panels(active) {
  for (const name of [
    "library-list",
    "detail",
    "activity-section",
    "activity-detail",
    "accessibility-section",
  ])
    $(`#${name}`).hidden = name !== active;
  $("#error").hidden = true;
}
function setLoading(active) {
  const main = document.querySelector('main');
  main.setAttribute('aria-busy', String(active));
  main.classList.toggle('is-loading', active);
}
export function startNavigation(show) {
  let generation = 0;
  async function update() {
    setLoading(true);
    const version = ++generation,
      route = readRoute(),
      current = () => version === generation;
    const { category, id, params } = route,
      [title, description, eyebrow, listTitle] = sections[category];
    document.title = `${title} · Design System Library`;
    for (const link of document.querySelectorAll(".app-header nav a"))
      link.setAttribute(
        "aria-current",
        link.hash === `#/${category}` ? "page" : "false",
      );
    $("#screen-title").textContent = title;
    $("#screen-description").textContent = description;
    $("#eyebrow").textContent = eyebrow;
    $("#list-title").textContent = listTitle;
    $("#screen-heading").hidden = !!id;
    $("#detail-toolbar").hidden = !id;
    $("#parent-crumb").textContent =
      category === "activity" ? "호출 기록" : title;
    $("#parent-crumb").href = routeUrl(category, null, params);
    $("#link-status").textContent = "";
    $("#preview").src = "about:blank";
    panels(
      category === "accessibility"
        ? "accessibility-section"
        : category === "activity"
        ? id
          ? "activity-detail"
          : "activity-section"
        : id
          ? "detail"
          : "library-list",
    );
    try {
      if (staticMode && ["work", "activity"].includes(category)) throw new Error("등록 작업과 호출 기록은 로컬 Design System Library에서 확인하세요.");
      await show(route, current);
      if (current() && id) window.scrollTo({ top: 0, behavior: "instant" });
    } catch (error) {
      if (current()) {
        panels(null);
        $("#error").hidden = false;
        $("#error").textContent = error.message;
      }
    } finally {
      if (current()) {
        setLoading(false);
      }
    }
  }
  $("#back").addEventListener("click", () => {
    const route = readRoute();
    const params = new URLSearchParams(route.params);
    params.delete("view");
    navigate(route.category, null, params, true);
  });
  bindClipboard($("#copy-link"), $("#link-status"), () => location.href,
    '주소 표시줄의 링크를 복사하세요.');
  window.addEventListener("hashchange", update);
  window.addEventListener("hubnavigate", update);
  update();
}

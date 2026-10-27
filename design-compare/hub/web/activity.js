import { element } from "./dom.js";
import { getJSON } from "./api.js";
const labels = {
  brief: "작업 전 자료",
  link: "작업물 등록",
  compare: "비교 검수",
  search: "자료 검색",
  context: "자료 조회",
  inventory: "후보 수집",
  inspect: "세부 조회",
  register: "기준 등록",
};
const states = {
  prepared: "준비 완료",
  partial: "일부 준비",
  "no-match": "일치 자료 없음",
  pass: "검사 통과",
  fail: "차이 발견",
  error: "실행 오류",
  linked: "등록 완료",
};
export const activityTitle = (entry) =>
  `${labels[entry.command] ?? entry.command} · ${states[entry.output.status] ?? entry.output.status}`;
function fileUrl(entry, name) {
  return `/api/activity/${entry.id}/files/${encodeURIComponent(name)}`;
}
function imageFigure(entry, image) {
  const figure = element("figure"),
    img = element("img");
  img.alt = image.label;
  img.src = fileUrl(entry, image.name);
  const link = element("a");
  link.href = img.src;
  link.target = "_blank";
  link.rel = "noopener";
  link.append(img);
  figure.append(link, element("figcaption", image.label));
  const item = entry.output.items?.find(
    (item) => item.imagePath === image.path,
  );
  if (item) {
    figure.append(
      element("p", item.guidance.summary),
      element(
        "p",
        `선택 근거: ${item.reasons.map((reason) => reason.matched).join(" · ")}`,
      ),
    );
    const guidance = element("ul");
    for (const constraint of item.guidance.constraints ?? [])
      guidance.append(element("li", constraint));
    figure.append(guidance);
  }
  return figure;
}
function renderDetail(entry) {
  const container = document.querySelector("#activity-detail");
  container.replaceChildren();
  const card = element("article", null, "activity-detail");
  card.dataset.activityId = entry.id;
  card.append(
    element("p", "REVIEW JOURNAL", "eyebrow"),
    element("h1", activityTitle(entry)),
    element(
      "p",
      `${new Date(entry.createdAt).toLocaleString("ko-KR")} · 작업 ${entry.taskId.slice(0, 8)}`,
      "muted",
    ),
  );
  const intent = entry.output.intent ?? entry.output.metadata?.title;
  if (intent) card.append(element("p", intent));
  if (entry.output.message) card.append(element("p", entry.output.message));
  for (const failure of entry.output.failures ?? [])
    card.append(element("p", `${failure.title}: ${failure.message}`));
  const images = element("div", null, "activity-images"),
    figures = entry.images.map((image) => imageFigure(entry, image));
  figures.forEach((figure) => images.append(figure));
  let index = 0;
  if (figures.length) {
    const controls = element("div", null, "image-controls"),
      previous = element("button", "←"),
      next = element("button", "→"),
      counter = element("span");
    previous.type = next.type = "button";
    previous.setAttribute("aria-label", "이전 이미지");
    next.setAttribute("aria-label", "다음 이미지");
    function update() {
      figures.forEach((figure, position) =>
        figure.classList.toggle("current-image", position === index),
      );
      counter.textContent = `${index + 1} / ${figures.length}`;
      previous.disabled = index === 0;
      next.disabled = index === figures.length - 1;
    }
    previous.addEventListener("click", () => {
      index--;
      update();
    });
    next.addEventListener("click", () => {
      index++;
      update();
    });
    update();
    controls.append(previous, counter, next);
    card.append(controls, images);
  }
  if ((entry.files ?? []).includes("index.html")) {
    const link = element("a", "비교 보고서 열기 ↗", "outline-link");
    link.href = fileUrl(entry, "index.html");
    link.target = "_blank";
    link.rel = "noopener";
    card.append(link);
  }
  const payload = element("details", null, "handoff");
  payload.append(
    element("summary", "AI에 전달한 결과"),
    element("pre", entry.text ?? JSON.stringify(entry.output, null, 2)),
  );
  card.append(payload);
  container.append(card);
}
export function createActivityView() {
  let entries = [];
  async function load(current = () => true) {
    const data = await getJSON("/api/activity");
    if (!current()) return;
    entries = data.entries;
    const list = document.querySelector("#activity-list");
    list.replaceChildren();
    document.querySelector("#activity-status").textContent = entries.length
      ? `최근 ${entries.length}건 · CLI가 전달한 자료`
      : "아직 CLI 호출 기록이 없습니다.";
    for (const entry of entries) {
      const card = element("article", null, "activity-card");
      card.dataset.activityId = entry.id;
      const summary = element("div");
      summary.append(
        element("strong", activityTitle(entry)),
        element(
          "p",
          entry.output.intent ??
            entry.output.metadata?.title ??
            new Date(entry.createdAt).toLocaleString("ko-KR"),
        ),
      );
      const link = element("a", "기록 보기", "outline-link");
      link.href = `#/activity/${entry.id}`;
      card.append(summary, link);
      list.append(card);
    }
  }
  document
    .querySelector("#refresh-activity")
    .addEventListener("click", async () => {
      try {
        await load();
      } catch (error) {
        document.querySelector("#activity-status").textContent = error.message;
      }
    });
  return {
    async show(route, current) {
      if (!route.id) {
        await load(current);
        return;
      }
      const entry = await getJSON(
        `/api/activity/${encodeURIComponent(route.id)}`,
      );
      if (!current()) return;
      if (!entries.length) {
        const history = await getJSON("/api/activity");
        if (!current()) return;
        entries = history.entries;
      }
      renderDetail(entry);
      document.title = `${activityTitle(entry)} · Design System Library`;
      const steps = entries
        .filter((item) => item.taskId === entry.taskId)
        .reverse();
      if (steps.length > 1) {
        const nav = element("nav", null, "task-steps");
        nav.setAttribute("aria-label", "같은 작업의 단계");
        for (const step of steps) {
          const link = element("a", labels[step.command] ?? step.command);
          link.href = `#/activity/${step.id}`;
          link.setAttribute(
            "aria-current",
            step.id === entry.id ? "step" : "false",
          );
          nav.append(link);
        }
        document.querySelector("#activity-detail").prepend(nav);
      }
      document
        .querySelector("#activity-detail h1")
        .setAttribute("tabindex", "-1");
      document
        .querySelector("#activity-detail h1")
        .focus({ preventScroll: true });
    },
  };
}

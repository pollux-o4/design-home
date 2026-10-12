import { announce } from "./lifecycle.js";
function choices(root, scope, choose) {
  const buttons = [...root.querySelectorAll("[data-view]")];
  const select = (button) => {
    buttons.forEach((item) =>
      item.setAttribute("aria-pressed", String(item === button)),
    );
    choose(button.dataset.view, button.textContent);
  };
  buttons.forEach((button) => scope.on(button, "click", () => select(button)));
  select(buttons[0]);
}
export function layoutGrid(root, scope) {
  const grid = root.querySelector("[data-grid]");
  const buttons = [...root.querySelectorAll("[data-columns]")];
  buttons.forEach((button) =>
    scope.on(button, "click", () => {
      grid.dataset.columns = button.dataset.columns;
      buttons.forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
      announce(root, `${button.dataset.columns}열로 배치했습니다.`);
    }),
  );
}
export function layoutStack(root, scope) {
  const stack = root.querySelector("[data-stack]");
  const gap = root.querySelector("[data-gap]");
  const align = root.querySelector("[data-align]");
  scope.on(gap, "input", () => {
    stack.style.gap = `${gap.value}px`;
    announce(root, `간격 ${gap.value}px`);
  });
  scope.on(align, "change", () => {
    stack.style.alignItems =
      align.value === "start" ? "flex-start" : align.value;
    announce(root, `${align.selectedOptions[0].textContent} 정렬`);
  });
}
export function layoutSplit(root, scope) {
  const ratio = root.querySelector("[data-ratio]");
  scope.on(ratio, "input", () => {
    root
      .querySelector("[data-split]")
      .style.setProperty("--lp-ratio", `${ratio.value}%`);
    root.querySelector("[data-ratio-label]").textContent = `${ratio.value}%`;
  });
}
const notes = {
  light: [
    "01 / LIGHT",
    "오후의 빛",
    "창가를 지나가는 햇빛. 잠깐 멈춰 익숙한 장면을 다시 바라봅니다.",
  ],
  walk: [
    "02 / WALK",
    "느린 산책",
    "목적지를 정하지 않고 걷는 시간. 작은 골목에서 새로운 풍경을 발견합니다.",
  ],
  desk: [
    "03 / SPACE",
    "작업의 자리",
    "필요한 것만 남긴 책상. 생각에 집중할 수 있는 자리를 만듭니다.",
  ],
};
export function layoutMasterDetail(root, scope) {
  choices(root, scope, (key) => {
    const [kicker, title, copy] = notes[key];
    root.querySelector("[data-detail-kicker]").textContent = kicker;
    root.querySelector("[data-detail-title]").textContent = title;
    root.querySelector("[data-detail-copy]").textContent = copy;
    announce(root, `${title} 상세`);
  });
}
let adaptiveMenuSequence = 0;
export function layoutAdaptiveSidebar(root, scope) {
  const menu = root.querySelector("[data-adaptive-menu]");
  const toggle = root.querySelector("[data-menu-toggle]");
  const compact = matchMedia("(max-width: 480px)");
  menu.id = `layout-adaptive-menu-${++adaptiveMenuSequence}`;
  toggle.setAttribute("aria-controls", menu.id);
  let open = false;
  function update() {
    const hiding = compact.matches && !open;
    const restoreFocus = hiding && menu.contains(document.activeElement);
    menu.hidden = hiding;
    if (restoreFocus) toggle.focus();
    toggle.setAttribute("aria-expanded", String(!menu.hidden));
    toggle.textContent = open ? "메뉴 닫기" : "메뉴 열기";
  }
  const copy = {
    overview: "오늘의 새로운 기록을 확인하세요.",
    saved: "다시 보고 싶은 이야기를 한곳에 모았습니다.",
    settings: "집중하기 좋은 나만의 환경을 구성하세요.",
  };
  scope.on(toggle, "click", () => {
    open = !open;
    update();
  });
  scope.on(compact, "change", update);
  choices(root, scope, (key, title) => {
    root.querySelector("[data-adaptive-title]").textContent = title;
    root.querySelector("[data-adaptive-copy]").textContent = copy[key];
    if (compact.matches && open) {
      open = false;
      update();
      toggle.focus();
    }
    announce(root, `${title} 화면`);
  });
  update();
}
const metricSeries = {
  week: {
    views: [120, 180, 145, 235, 280, 210, 310],
    saves: [12, 19, 15, 28, 34, 23, 38],
    labels: ["월요일", "일요일"],
  },
  month: {
    views: [780, 940, 1160, 1390],
    saves: [82, 108, 139, 174],
    labels: ["1주", "4주"],
  },
};
export function layoutDashboard(root, scope) {
  const period = root.querySelector("[data-period]");
  const metric = root.querySelector("[data-metric]");
  function update() {
    const series = metricSeries[period.value];
    const values = series[metric.value];
    const total = values.reduce((sum, value) => sum + value, 0);
    const label = metric.selectedOptions[0].textContent;
    root.querySelector("[data-metric-label]").textContent = `총 ${label}`;
    root.querySelector("[data-total]").textContent =
      total.toLocaleString("ko-KR");
    root.querySelector("[data-change]").textContent =
      `첫 구간 대비 마지막 구간 +${Math.round((values.at(-1) / values[0] - 1) * 100)}%`;
    root.querySelector("[data-period-start]").textContent = series.labels[0];
    root.querySelector("[data-period-end]").textContent = series.labels[1];
    const bars = root.querySelector("[data-bars]");
    bars.replaceChildren();
    values.forEach((value, index) => {
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      const stride = 320 / values.length;
      const height = (value / Math.max(...values)) * 100;
      Object.entries({
        x: index * stride + 5,
        y: 110 - height,
        width: stride - 10,
        height,
        rx: 5,
      }).forEach(([name, number]) => rect.setAttribute(name, number));
      bars.append(rect);
    });
    root
      .querySelector("svg")
      .setAttribute(
        "aria-label",
        `${period.selectedOptions[0].textContent} ${label}: ${values.join(", ")}`,
      );
    announce(
      root,
      `${period.selectedOptions[0].textContent} ${label} ${total.toLocaleString("ko-KR")}`,
    );
  }
  scope.on(period, "change", update);
  scope.on(metric, "change", update);
  update();
}
export function layoutStickyPanel(root, scope) {
  const button = root.querySelector("[data-save-plan]");
  let saved = false;
  scope.on(button, "click", () => {
    saved = !saved;
    button.textContent = saved ? "저장 취소" : "계획 저장";
    button.setAttribute("aria-pressed", String(saved));
    announce(
      root,
      saved ? "주말 계획을 저장했습니다." : "계획 저장을 취소했습니다.",
    );
  });
  button.setAttribute("aria-pressed", "false");
}
export function layoutBottomNavigation(root, scope) {
  const screens = {
    today: ["오늘의 발견", "익숙한 하루에서 새로운 순간을 찾아보세요."],
    collection: [
      "좋아하는 모음",
      "오래 간직하고 싶은 이야기들이 모여 있습니다.",
    ],
    profile: ["나의 작은 공간", "기록하고, 돌아보고, 다음 순간을 준비합니다."],
  };
  choices(root, scope, (key) => {
    const [title, copy] = screens[key];
    root.querySelector("[data-bottom-title]").textContent = title;
    root.querySelector("[data-bottom-copy]").textContent = copy;
    root.querySelector(".lp-mobile").dataset.screen = key;
    announce(root, title);
  });
}

import { createScope } from "../../ui-components/js/samples/lifecycle.js";
const define = (id, title, html, setup) => ({
  id: `ux-${id}`,
  title,
  render: () => `<div class="sample ux-experiment" data-sample-id="ux-${id}">${html}</div>`,
  mount(root) {
    const scope = createScope(root);
    setup(root, scope);
    return scope.dispose;
  },
});
export const uxDemos = [
  define(
    "fitts",
    "크기와 거리 바꾸기",
    `
    <div class="experiment-setting"><label for="target-size">대상 크기</label><input id="target-size" type="range" min="28" max="80" value="48"><output for="target-size">48px</output></div>
    <div class="experiment-setting"><label for="target-distance">이동 거리</label><input id="target-distance" type="range" min="10" max="75" value="55"><output for="target-distance">55%</output></div>
    <div class="target-field"><span class="target-start" aria-hidden="true">↗</span><span class="target-path" aria-hidden="true"></span><button class="target-button" type="button" aria-label="대상 선택">＋</button></div>
    <p class="experiment-hint">가까이, 크게. 누르기 쉬워지는지 확인하세요.</p><p role="status" data-status class="sample-status"></p>`,
    (root, scope) => {
      const inputs = root.querySelectorAll("input");
      const field = root.querySelector(".target-field");
      const update = () => {
        const [size, distance] = [...inputs].map((input) => input.value);
        field.style.setProperty("--target-size", `${size}px`);
        field.style.setProperty("--target-distance", `${distance}%`);
        root
          .querySelectorAll("output")
          .forEach(
            (output, index) => (output.textContent = inputs[index].value + (index ? "%" : "px")),
          );
      };
      inputs.forEach((input) => scope.on(input, "input", update));
      scope.on(
        root.querySelector("button"),
        "click",
        () =>
          (root.querySelector("[data-status]").textContent =
            "대상을 선택했습니다. 크기와 거리를 바꿔 다시 눌러보세요."),
      );
      update();
    },
  ),
  define(
    "hick",
    "선택지 묶어 보기",
    `
    <div class="experiment-toggle"><span>선택지를 그룹으로</span><button type="button" role="switch" aria-checked="false" aria-label="선택지 그룹화">끔</button></div>
    <div class="choice-field"></div><p class="experiment-hint">선택지가 많을 때, 먼저 범위를 좁혀 보세요.</p><p role="status" data-status class="sample-status"></p>`,
    (root, scope) => {
      const groups = {
        "따뜻한 음료": ["아메리카노", "라테", "카푸치노", "홍차"],
        "차가운 음료": ["콜드브루", "아이스티", "레모네이드", "스무디"],
      };
      const field = root.querySelector(".choice-field");
      const toggle = root.querySelector("[role=switch]");
      const choice = (text) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = text;
        button.className = "drink-choice";
        return button;
      };
      function render() {
        field.replaceChildren();
        if (toggle.getAttribute("aria-checked") === "true") {
          Object.entries(groups).forEach(([name, drinks]) => {
            const group = document.createElement("details");
            const heading = document.createElement("summary");
            heading.textContent = name;
            const options = document.createElement("div");
            options.className = "drink-options";
            drinks.forEach((drink) => options.append(choice(drink)));
            group.append(heading, options);
            field.append(group);
          });
        } else
          Object.values(groups)
            .flat()
            .forEach((drink) => field.append(choice(drink)));
      }
      scope.on(toggle, "click", () => {
        const on = toggle.getAttribute("aria-checked") !== "true";
        toggle.setAttribute("aria-checked", String(on));
        toggle.textContent = on ? "켬" : "끔";
        render();
      });
      scope.on(field, "click", (event) => {
        const option = event.target.closest(".drink-choice");
        if (option) root.querySelector("[data-status]").textContent = `${option.textContent} 선택`;
      });
      render();
    },
  ),
  define(
    "proximity",
    "간격으로 묶기",
    `
    <div class="experiment-toggle"><span>관련 항목끼리 가까이</span><button type="button" role="switch" aria-checked="false" aria-label="관련 항목 묶기">끔</button></div>
    <div class="proximity-field"><div><span>이름</span><b>김디자인</b></div><div><span>이메일</span><b>hello@example.test</b></div><div><span>알림</span><b>이메일 수신</b></div></div>
    <p class="experiment-hint">간격만 바꿔도, 무엇이 한 묶음인지 달라집니다.</p>`,
    (root, scope) => {
      const toggle = root.querySelector("button");
      scope.on(toggle, "click", () => {
        const on = toggle.getAttribute("aria-checked") !== "true";
        toggle.setAttribute("aria-checked", String(on));
        toggle.textContent = on ? "켬" : "끔";
        root.querySelector(".proximity-field").classList.toggle("is-grouped", on);
      });
    },
  ),
];

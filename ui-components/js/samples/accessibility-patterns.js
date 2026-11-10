import { announce } from "./lifecycle.js";

export function accessibleSkip(root, scope) {
  const target = root.querySelector(".a11y-main");
  scope.on(root.querySelector(".a11y-skip"), "click", (event) => {
    event.preventDefault();
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: "nearest" });
    announce(root, "반복 메뉴를 건너뛰고 본문으로 이동했습니다.");
  });
  scope.on(root, "click", (event) => {
    const menu = event.target.closest("[data-skip-menu]");
    if (menu)
      root.querySelector("[data-skip-title]").textContent = `${menu.dataset.skipMenu}의 기록`;
    if (event.target.closest("[data-skip-action]")) announce(root, "본문의 기록을 열었습니다.");
  });
}
export function accessibleListbox(root, scope) {
  const listbox = root.querySelector('[role="listbox"]');
  const options = [...listbox.querySelectorAll('[role="option"]')];
  const selected = new Set([0]);
  let active = 0,
    typed = "",
    lastTyped = 0;
  function update() {
    listbox.setAttribute("aria-activedescendant", options[active].id);
    options.forEach((option, index) => {
      option.setAttribute("aria-selected", String(selected.has(index)));
      option.dataset.active = String(index === active);
    });
    root.querySelector("[data-listbox-output]").textContent =
      [...selected]
        .sort()
        .map((index) => options[index].textContent.split(" · ")[0].trim())
        .join(" · ") || "선택 없음";
  }
  function toggle(index) {
    if (selected.has(index)) selected.delete(index);
    else selected.add(index);
    update();
    announce(root, `${selected.size}개 패널을 선택했습니다.`);
  }
  scope.on(listbox, "click", (event) => {
    const option = event.target.closest('[role="option"]');
    if (!option) return;
    active = options.indexOf(option);
    listbox.focus({ preventScroll: true });
    toggle(active);
  });
  scope.on(listbox, "keydown", (event) => {
    if (event.isComposing) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
      event.preventDefault();
      options.forEach((_, index) => selected.add(index));
      update();
      announce(root, "모든 패널을 선택했습니다.");
      return;
    }
    if (["ArrowDown", "ArrowUp", "Home", "End", " "].includes(event.key)) {
      event.preventDefault();
      if (event.key === " ") {
        toggle(active);
        return;
      }
      active =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? options.length - 1
            : Math.max(
                0,
                Math.min(options.length - 1, active + (event.key === "ArrowDown" ? 1 : -1)),
              );
      update();
      options[active].scrollIntoView({ block: "nearest" });
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = performance.now();
      typed = now - lastTyped > 700 ? event.key : typed + event.key;
      lastTyped = now;
      const index = options.findIndex((option) =>
        option.textContent.trim().toLowerCase().startsWith(typed.toLowerCase()),
      );
      if (index >= 0) {
        event.preventDefault();
        active = index;
        update();
      }
    }
  });
  update();
}
export function accessibleTextScale(root, scope) {
  const input = root.querySelector("[data-text-scale]");
  scope.on(input, "input", () => {
    root.querySelector("[data-scale-output]").value = `${input.value}%`;
    root
      .querySelector("[data-reflow]")
      .style.setProperty("--a11y-scale", Number(input.value) / 100);
  });
  scope.on(root.querySelector("[data-reflow-action]"), "click", () =>
    announce(root, "확대된 글자에서도 버튼을 사용할 수 있습니다."),
  );
}
function luminance(hex) {
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
export function accessibleContrast(root, scope) {
  const foreground = root.querySelector("[data-foreground]"),
    background = root.querySelector("[data-background]");
  function update() {
    const preview = root.querySelector("[data-contrast-preview]");
    preview.style.color = foreground.value;
    preview.style.backgroundColor = background.value;
    const light = luminance(foreground.value),
      dark = luminance(background.value);
    const ratio = (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05);
    root.querySelector("[data-contrast-ratio]").value = `${ratio.toFixed(2)}:1`;
    const result = root.querySelector("[data-contrast-result]");
    result.textContent = ratio >= 4.5 ? "일반 텍스트 AA 기준 충족" : "일반 텍스트 AA 기준 미달";
    result.dataset.pass = String(ratio >= 4.5);
    announce(root, `대비 ${ratio.toFixed(2)} 대 1. ${result.textContent}`);
  }
  scope.on(foreground, "input", update);
  scope.on(background, "input", update);
  update();
}

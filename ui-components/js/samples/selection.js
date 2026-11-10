import { announce } from "./lifecycle.js";
/* One selection Command serves tabs, segmented controls and local menus. */
export function selection(root, scope) {
  const buttons = [...root.querySelectorAll("[data-choice]")];
  const panel = root.querySelector("[data-panel]");
  function select(button, focus = false) {
    for (const item of buttons) {
      const selected = item === button;
      item.classList.toggle("active", selected);
      if (item.getAttribute("role") === "tab") {
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
      } else item.setAttribute("aria-pressed", String(selected));
    }
    if (panel && button.id) panel.setAttribute("aria-labelledby", button.id);
    if (panel) panel.textContent = button.dataset.content || `${button.textContent.trim()} 선택됨`;
    if (focus) button.focus();
  }
  scope.on(root, "click", (event) => {
    const button = event.target.closest("[data-choice]");
    if (buttons.includes(button)) select(button);
  });
  scope.on(root, "keydown", (event) => {
    const visible = buttons.filter((button) => button.checkVisibility());
    const index = visible.indexOf(event.target);
    if (index < 0 || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? visible.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + visible.length) % visible.length;
    select(visible[next], true);
  });
  select(buttons.find((button) => button.classList.contains("active")) || buttons[0]);
}
export function toggle(root, scope) {
  const input = root.querySelector("input");
  scope.on(input, "change", () =>
    announce(root, input.checked ? "알림이 켜졌습니다." : "알림이 꺼졌습니다."),
  );
}
export function chips(root, scope) {
  scope.on(root, "click", (event) => {
    const button = event.target.closest("[data-remove]");
    if (!button) return;
    const chip = button.closest(".ui-chip");
    const title = chip.querySelector("span").textContent;
    chip.remove();
    (root.querySelector("[data-remove]") || root.querySelector("[data-add-chip]")).focus();
    announce(root, `${title} 필터 삭제됨`);
  });
  const add = root.querySelector("[data-add-chip]");
  const initial = root.querySelector("[data-chips]").innerHTML;
  scope.on(add, "click", () => {
    root.querySelector("[data-chips]").innerHTML = initial;
    announce(root, "필터가 복원되었습니다.");
  });
}

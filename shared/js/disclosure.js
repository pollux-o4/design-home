import { icon } from "./icons.js";
/* Each disclosure owns its animation; callers choose which single item stays open. */
export function createDisclosure({ id, title, subtitle, onToggle }) {
  const element = document.createElement("section");
  element.className = "pattern-disclosure";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "pattern-summary";
  button.id = `summary-${id}`;
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", `panel-${id}`);
  const label = document.createElement("span");
  label.className = "pattern-summary-label";
  const heading = document.createElement("span");
  heading.className = "pattern-summary-title";
  heading.textContent = title;
  label.append(heading);
  if (subtitle) {
    const hint = document.createElement("span");
    hint.className = "pattern-summary-hint";
    hint.textContent = subtitle;
    label.append(hint);
  }
  const chevron = icon("chevron");
  chevron.classList.add("pattern-summary-chevron");
  button.append(label, chevron);
  const panel = document.createElement("div");
  panel.className = "pattern-panel";
  panel.id = `panel-${id}`;
  panel.hidden = true;
  panel.inert = true;
  panel.setAttribute("role", "region");
  panel.setAttribute("aria-labelledby", button.id);
  const content = document.createElement("div");
  content.className = "pattern-panel-body";
  panel.append(content);
  element.append(button, panel);
  button.addEventListener("click", () => onToggle(!open));
  let open = false,
    animation;
  function setOpen(next, animate = true) {
    if (open === next) return;
    open = next;
    button.setAttribute("aria-expanded", String(next));
    if (!next && panel.contains(document.activeElement)) button.focus();
    const height = panel.hidden ? 0 : panel.getBoundingClientRect().height;
    animation?.cancel();
    panel.hidden = false;
    panel.inert = !next;
    if (!animate || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      panel.hidden = !next;
      return;
    }
    animation = panel.animate(
      [
        { height: `${height}px`, opacity: next ? 0 : 1 },
        { height: `${next ? panel.scrollHeight : 0}px`, opacity: next ? 1 : 0 },
      ],
      {
        duration: 240,
        easing: getComputedStyle(element).getPropertyValue("--ui-ease").trim(),
      },
    );
    const current = animation;
    current.finished
      .then(() => {
        if (animation === current) {
          panel.hidden = !open;
          animation = null;
        }
      })
      .catch(() => {});
  }
  return {
    element,
    button,
    panel,
    content,
    setOpen,
    settled: () => animation?.finished.catch(() => {}) ?? Promise.resolve(),
    dispose: () => animation?.cancel(),
  };
}

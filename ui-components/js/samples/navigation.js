import { slides, sections, projects } from "./data.js";
import { announce } from "./lifecycle.js";
export function carousel(root, scope) {
  let index = 0;
  const dots = root.querySelector("[data-dots]");
  slides.forEach((slide, i) => {
    const button = document.createElement("button");
    button.className = "slide-dot";
    button.setAttribute("aria-label", `${i + 1}번째 슬라이드`);
    scope.on(button, "click", () => show(i));
    dots.append(button);
  });
  function show(next) {
    index = (next + slides.length) % slides.length;
    root.querySelector("[data-slide-title]").textContent = slides[index].title;
    root.querySelector("[data-slide-desc]").textContent = slides[index].desc;
    root.querySelector("[data-slide-label]").textContent = slides[index].label;
    dots
      .querySelectorAll("button")
      .forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
    announce(root, `${index + 1} / ${slides.length}`);
  }
  scope.on(root, "click", (event) => {
    const button = event.target.closest("[data-direction]");
    if (button) show(index + Number(button.dataset.direction));
  });
  show(0);
}
export function pagination(root, scope) {
  let page = 1;
  const list = root.querySelector("[data-page-items]");
  const buttons = [...root.querySelectorAll("[data-page]")];
  const last = Math.ceil(projects.length / 2);
  function show(next) {
    page = Math.max(1, Math.min(last, next));
    list.replaceChildren();
    projects.slice((page - 1) * 2, page * 2).forEach((title) => {
      const item = document.createElement("li");
      item.textContent = title;
      list.append(item);
    });
    buttons.forEach((button) => {
      const active = Number(button.dataset.page) === page;
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
      button.disabled =
        button.dataset.page === "prev"
          ? page === 1
          : button.dataset.page === "next"
            ? page === last
            : false;
    });
    announce(root, `${page} / ${last} 페이지`);
  }
  scope.on(root, "click", (event) => {
    const button = event.target.closest("[data-page]");
    if (button)
      show(
        button.dataset.page === "prev"
          ? page - 1
          : button.dataset.page === "next"
            ? page + 1
            : Number(button.dataset.page),
      );
  });
  show(1);
}
export function integrated(root, scope) {
  const main = root.querySelector("[data-main-menu]");
  const sub = root.querySelector("[data-sub-menu]");
  let current;
  function chooseItem(button) {
    sub
      .querySelectorAll("button")
      .forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    root.querySelector("[data-view-title]").textContent = button.textContent;
    root.querySelector("[data-view-desc]").textContent = current.desc;
  }
  function chooseSection(key) {
    current = sections[key];
    main
      .querySelectorAll("button")
      .forEach((button) =>
        button.setAttribute("aria-pressed", String(button.dataset.section === key)),
      );
    sub.replaceChildren();
    current.items.forEach((label) => {
      const button = document.createElement("button");
      button.className = "menu-button";
      button.type = "button";
      button.textContent = label;
      scope.on(button, "click", () => chooseItem(button));
      sub.append(button);
    });
    chooseItem(sub.firstElementChild);
  }
  for (const [key, section] of Object.entries(sections)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "menu-button";
    button.dataset.section = key;
    button.textContent = section.label;
    scope.on(button, "click", () => chooseSection(key));
    main.append(button);
  }
  chooseSection("dashboard");
}

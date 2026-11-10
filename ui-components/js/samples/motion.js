import { announce } from "./lifecycle.js";
export function like(root, scope) {
  const button = root.querySelector("[data-like]");
  const output = root.querySelector("output");
  scope.on(button, "click", () => {
    const liked = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(liked));
    button.classList.toggle("liked", liked);
    output.value = (1240 + Number(liked)).toLocaleString();
    announce(root, liked ? "좋아요가 반영되었습니다." : "좋아요가 취소되었습니다.");
  });
}
export function reorder(root, scope) {
  const list = root.querySelector(".ui-drag-list");
  let dragged;
  function move(item, target, after) {
    if (!target || target === item) return;
    list.insertBefore(item, after ? target.nextSibling : target);
    announce(
      root,
      `${item.querySelector("[data-title]").textContent}, ${[...list.children].indexOf(item) + 1}번째로 이동`,
    );
  }
  scope.on(list, "dragstart", (event) => {
    dragged = event.target.closest(".ui-drag-item");
    event.dataTransfer.setData("text/plain", dragged.dataset.item);
    dragged.classList.add("dragging");
  });
  scope.on(list, "dragover", (event) => event.preventDefault());
  scope.on(list, "drop", (event) => {
    event.preventDefault();
    const target = event.target.closest(".ui-drag-item");
    if (dragged && target)
      move(
        dragged,
        target,
        event.clientY > target.getBoundingClientRect().top + target.offsetHeight / 2,
      );
  });
  scope.on(list, "dragend", () => {
    dragged?.classList.remove("dragging");
    dragged = null;
  });
  scope.on(list, "keydown", (event) => {
    const item = event.target.closest(".ui-drag-item");
    if (!item || !event.altKey || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    move(
      item,
      event.key === "ArrowDown" ? item.nextElementSibling : item.previousElementSibling,
      event.key === "ArrowDown",
    );
    item.focus();
  });
  scope.on(list, "click", (event) => {
    const button = event.target.closest("[data-move]");
    if (!button) return;
    const item = button.closest(".ui-drag-item");
    const down = button.dataset.move === "down";
    move(item, down ? item.nextElementSibling : item.previousElementSibling, down);
    button.focus();
  });
}

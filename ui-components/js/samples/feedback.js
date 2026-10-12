import { announce } from "./lifecycle.js";
/* Feedback Command keeps status text, optional Undo and expiry in one place. */
export function notify(
  message,
  { action, actionLabel = "실행 취소", kind = "success" } = {},
) {
  let stack = document.getElementById("toast-container");
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "toast-container";
    stack.setAttribute("aria-label", "알림");
    document.body.append(stack);
  }
  while (stack.children.length >= 3) stack.firstElementChild.remove();
  const toast = document.createElement("div");
  toast.className = `ui-toast ${kind}`;
  const text = document.createElement("span");
  text.setAttribute("role", kind === "error" ? "alert" : "status");
  text.textContent = message;
  toast.append(text);
  if (action) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "toast-action";
    button.textContent = actionLabel;
    button.addEventListener("click", () => {
      action();
      remove();
    });
    toast.append(button);
  }
  const dismiss = document.createElement("button");
  dismiss.type = "button";
  dismiss.className = "toast-dismiss";
  dismiss.setAttribute("aria-label", "알림 닫기");
  dismiss.textContent = "×";
  dismiss.addEventListener("click", remove);
  toast.append(dismiss);
  stack.append(toast);
  let timer;
  function remove() {
    clearTimeout(timer);
    if (toast.contains(document.activeElement))
      document.querySelector(".component-body button")?.focus();
    toast.remove();
  }
  function start() {
    clearTimeout(timer);
    timer = setTimeout(remove, action ? 10000 : 4000);
  }
  toast.addEventListener("mouseenter", () => clearTimeout(timer));
  toast.addEventListener("focusin", () => clearTimeout(timer));
  toast.addEventListener("mouseleave", start);
  toast.addEventListener("focusout", start);
  start();
  return remove;
}
export function toast(root, scope) {
  scope.on(root, "click", (event) => {
    const button = event.target.closest("[data-notify]");
    if (button)
      scope.own(notify(button.dataset.notify, { kind: button.dataset.kind }));
  });
}
export function snackbar(root, scope) {
  const item = root.querySelector("[data-undo-item]");
  const button = root.querySelector("[data-delete]");
  scope.on(button, "click", () => {
    item.hidden = true;
    button.disabled = true;
    announce(root, "프로젝트가 삭제되었습니다.");
    scope.own(
      notify("프로젝트가 삭제되었습니다.", {
        action: () => {
          item.hidden = false;
          button.disabled = false;
          announce(root, "프로젝트가 복원되었습니다.");
          button.focus();
        },
      }),
    );
  });
}
export function empty(root, scope) {
  scope.on(root.querySelector("button"), "click", () => {
    root.querySelector("[data-empty-title]").textContent = "첫 번째 리포트";
    root.querySelector("[data-empty-desc]").textContent =
      "새 리포트가 생성되었습니다.";
    root.querySelector("button").disabled = true;
    root.querySelector("button").textContent = "생성 완료";
  });
}
export function retry(root, scope) {
  let attempts = 0;
  const button = root.querySelector("button");
  scope.on(button, "click", () => {
    button.disabled = true;
    announce(root, "다시 연결하는 중…");
    scope.later(() => {
      attempts++;
      const ok = attempts > 1;
      announce(
        root,
        ok
          ? "연결되었습니다. 데이터를 사용할 수 있습니다."
          : "아직 연결할 수 없습니다. 한 번 더 시도해주세요.",
      );
      button.disabled = ok;
      button.textContent = ok ? "연결 완료" : "다시 시도";
    }, 350);
  });
}
export function progress(root, scope) {
  const button = root.querySelector("button"),
    bar = root.querySelector("progress"),
    output = root.querySelector("output");
  let pending;
  function update(value) {
    bar.value = value;
    output.value = `${value}%`;
    if (value < 100) pending = scope.later(() => update(value + 20), 160);
    else {
      button.disabled = false;
      button.textContent = "다시 실행";
      announce(root, "업로드가 완료되었습니다.");
    }
  }
  scope.on(button, "click", () => {
    scope.cancel(pending);
    button.disabled = true;
    announce(root, "업로드 중…");
    update(0);
  });
}

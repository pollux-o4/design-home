import { notify } from "./feedback.js";
export function dialog(root, scope) {
  const dialog = root.querySelector("dialog");
  const trigger = root.querySelector("[data-open-dialog]");
  const form = dialog.querySelector("form");
  scope.on(trigger, "click", () => dialog.showModal());
  scope.on(dialog, "close", () => {
    if (trigger.isConnected) trigger.focus();
  });
  scope.on(dialog, "click", (event) => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        dialog.close();
    }
  });
  scope.on(form, "submit", (event) => {
    const action = event.submitter?.value;
    if (action === "cancel") return;
    event.preventDefault();
    if (!form.reportValidity()) return;
    dialog.close(action);
    const name = dialog.querySelector("input")?.value;
    scope.own(
      notify(
        name
          ? `${name} 프로젝트가 생성되었습니다.`
          : action === "delete"
            ? "항목이 삭제되었습니다."
            : action === "save"
              ? "설정이 저장되었습니다."
              : "확인했습니다.",
      ),
    );
  });
  scope.own(() => {
    if (dialog.open) dialog.close();
  });
}
export function popover(root, scope) {
  const panel = root.querySelector("[popover]");
  scope.own(() => {
    try {
      panel.hidePopover();
    } catch {}
  });
}

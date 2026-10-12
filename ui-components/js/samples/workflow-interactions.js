import { announce } from "./lifecycle.js";
export function inlineEdit(root, scope) {
  const form = root.querySelector("form");
  const input = form.querySelector("input");
  const name = root.querySelector("[data-name]");
  const edit = root.querySelector('[data-action="edit"]');
  function close(message) {
    input.removeAttribute("aria-invalid");
    form.hidden = true;
    edit.hidden = false;
    edit.focus();
    announce(root, message);
  }
  scope.on(edit, "click", () => {
    input.value = name.textContent;
    input.removeAttribute("aria-invalid");
    form.hidden = false;
    edit.hidden = true;
    input.focus();
    input.select();
  });
  scope.on(form, "submit", (event) => {
    event.preventDefault();
    if (!input.value.trim()) {
      input.setAttribute("aria-invalid", "true");
      announce(root, "프로젝트 이름을 입력하세요.");
      input.focus();
      return;
    }
    name.textContent = input.value.trim();
    close("프로젝트 이름을 저장했습니다.");
  });
  scope.on(input, "input", () => input.removeAttribute("aria-invalid"));
  scope.on(root.querySelector('[data-action="cancel"]'), "click", () =>
    close("변경을 취소했습니다."),
  );
  scope.on(input, "keydown", (event) => {
    if (event.key === "Escape") close("변경을 취소했습니다.");
  });
}
export function bulkSelect(root, scope) {
  const all = root.querySelector("[data-all]");
  const items = [...root.querySelectorAll("[data-item]")];
  const archive = root.querySelector('[data-action="archive"]');
  const undo = root.querySelector('[data-action="undo"]');
  let archived = [];
  function update() {
    const visible = items.filter((input) => !input.closest("label").hidden);
    const selected = visible.filter((input) => input.checked);
    all.checked = !!visible.length && selected.length === visible.length;
    all.indeterminate = !!selected.length && selected.length !== visible.length;
    all.disabled = !visible.length;
    archive.disabled = !selected.length;
    undo.disabled = !archived.length;
    announce(root, `${selected.length}개 선택 · ${visible.length}개 항목`);
  }
  scope.on(all, "change", () => {
    items
      .filter((input) => !input.closest("label").hidden)
      .forEach((input) => (input.checked = all.checked));
    update();
  });
  items.forEach((input) => scope.on(input, "change", update));
  scope.on(archive, "click", () => {
    archived = items.filter(
      (input) => input.checked && !input.closest("label").hidden,
    );
    archived.forEach((input) => {
      input.closest("label").hidden = true;
      input.checked = false;
    });
    update();
    announce(root, `${archived.length}개 보관했습니다. 되돌릴 수 있습니다.`);
  });
  scope.on(undo, "click", () => {
    archived.forEach((input) => (input.closest("label").hidden = false));
    archived = [];
    update();
    announce(root, "보관을 되돌렸습니다.");
  });
  update();
}
export function commandPalette(root, scope) {
  const dialog = root.querySelector("dialog");
  const trigger = root.querySelector('[data-action="open"]');
  const search = dialog.querySelector("input");
  const list = dialog.querySelector("[data-commands]");
  const result = root.querySelector("[data-command-result]");
  const commands = ["프로젝트 보기", "활동 보기", "설정 보기"];
  let selected = 0;
  function execute(label) {
    result.textContent = label.replace(" 보기", "");
    root.querySelector("[data-command-content]").textContent = {
      "프로젝트 보기": "진행 중인 프로젝트 3개 · 오늘 검토할 화면 2개",
      "활동 보기": "최근 활동: 디자인 검토 완료 · 새로운 의견 2개",
      "설정 보기": "작업 환경: 시스템 테마 · 알림 켜짐",
    }[label];
    dialog.close();
    announce(root, `${label} 명령을 실행했습니다.`);
  }
  function render() {
    list.replaceChildren();
    selected = 0;
    commands
      .filter((label) => label.includes(search.value.trim()))
      .forEach((label) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "workflow-command";
        button.textContent = label;
        list.append(button);
      });
    if (!list.children.length) {
      const empty = document.createElement("p");
      empty.textContent = "일치하는 명령이 없습니다.";
      list.append(empty);
    }
    highlight();
  }
  function highlight() {
    [...list.querySelectorAll("button")].forEach((button, index) => {
      button.dataset.selected = String(index === selected);
    });
  }
  scope.on(trigger, "click", () => {
    search.value = "";
    render();
    dialog.showModal();
    search.focus();
  });
  scope.on(search, "input", render);
  scope.on(list, "focusin", (event) => {
    const buttons = [...list.querySelectorAll("button")];
    const index = buttons.indexOf(event.target);
    if (index >= 0) {
      selected = index;
      highlight();
    }
  });
  scope.on(list, "click", (event) => {
    const button = event.target.closest("button");
    if (button) execute(button.textContent);
  });
  scope.on(dialog, "keydown", (event) => {
    const buttons = [...list.querySelectorAll("button")];
    if (!buttons.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const current = buttons.indexOf(document.activeElement);
      selected =
        current < 0
          ? event.key === "ArrowDown"
            ? 0
            : buttons.length - 1
          : (current + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) %
            buttons.length;
      buttons[selected].focus();
      highlight();
    }
    if (event.key === "Enter" && event.target === search) {
      event.preventDefault();
      execute(buttons[selected].textContent);
    }
  });
  scope.on(dialog, "close", () => trigger.focus());
  scope.own(() => {
    if (dialog.open) dialog.close();
  });
}

import { announce } from "./lifecycle.js";

export function dataSortTable(root, scope) {
  const body = root.querySelector("tbody");
  let sortKey = null;
  let direction = 1;
  scope.on(root, "click", (event) => {
    const button = event.target.closest("[data-sort]");
    if (!button) return;
    direction = sortKey === button.dataset.sort ? -direction : 1;
    sortKey = button.dataset.sort;
    const rows = [...body.rows];
    rows.sort(
      (a, b) =>
        direction *
        (sortKey === "name"
          ? a.dataset.name.localeCompare(b.dataset.name)
          : Number(a.dataset[sortKey]) - Number(b.dataset[sortKey])),
    );
    body.append(...rows);
    root
      .querySelectorAll("thead th")
      .forEach((header) => header.removeAttribute("aria-sort"));
    button
      .closest("th")
      .setAttribute("aria-sort", direction === 1 ? "ascending" : "descending");
    announce(
      root,
      `${button.textContent.trim()} ${direction === 1 ? "오름차순" : "내림차순"} 정렬`,
    );
  });
}

export function dataTree(root, scope) {
  scope.on(root, "click", (event) => {
    const button = event.target.closest("[data-document]");
    if (!button) return;
    root
      .querySelectorAll("[data-document]")
      .forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
    root.querySelector("[data-detail-title]").textContent =
      button.dataset.document;
    root.querySelector("[data-detail-description]").textContent =
      button.dataset.description;
  });
}

export function dataFieldGroup(root, scope) {
  scope.on(root, "input", () => {
    const name =
      root.querySelector('[name="name"]').value.trim() || "이름 미입력";
    const email =
      root.querySelector('[name="email"]').value.trim() || "이메일 미입력";
    root.querySelector("[data-preview]").textContent = `${name} · ${email}`;
  });
}

export function dataCombobox(root, scope) {
  const input = root.querySelector('[role="combobox"]');
  const list = root.querySelector('[role="listbox"]');
  const options = [...list.querySelectorAll('[role="option"]')];
  let visible = options;
  let active = -1;
  function close() {
    list.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    root.querySelector("[data-empty]").hidden = true;
    active = -1;
  }
  function highlight(index) {
    active = index;
    options.forEach((option) =>
      option.classList.toggle("dp-option-active", option === visible[active]),
    );
    if (visible[active]) {
      input.setAttribute("aria-activedescendant", visible[active].id);
      visible[active].scrollIntoView({ block: "nearest" });
    } else input.removeAttribute("aria-activedescendant");
  }
  function open() {
    visible = options.filter((option) =>
      option.dataset.option
        .toLowerCase()
        .includes(input.value.toLowerCase().trim()),
    );
    options.forEach((option) => {
      option.hidden = !visible.includes(option);
    });
    list.hidden = !visible.length;
    root.querySelector("[data-empty]").hidden = Boolean(visible.length);
    input.setAttribute("aria-expanded", String(Boolean(visible.length)));
    highlight(-1);
    announce(
      root,
      visible.length
        ? `${visible.length}개의 도구. 방향키로 선택하세요.`
        : "일치하는 도구가 없습니다.",
    );
  }
  function choose(option) {
    input.value = option.dataset.option;
    options.forEach((item) =>
      item.setAttribute("aria-selected", String(item === option)),
    );
    close();
    announce(root, `${input.value} 선택 완료`);
    input.focus();
  }
  scope.on(input, "focus", open);
  scope.on(input, "click", () => {
    if (list.hidden) open();
  });
  scope.on(input, "input", () => {
    options.forEach((option) => option.setAttribute("aria-selected", "false"));
    open();
  });
  scope.on(input, "keydown", (event) => {
    if (event.isComposing) return;
    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      if (list.hidden) open();
      if (visible.length)
        highlight(
          active < 0
            ? event.key === "ArrowDown"
              ? 0
              : visible.length - 1
            : (active + (event.key === "ArrowDown" ? 1 : -1) + visible.length) %
                visible.length,
        );
    } else if (event.key === "Enter" && !list.hidden && active >= 0) {
      event.preventDefault();
      choose(visible[active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") close();
  });
  scope.on(list, "pointerdown", (event) => event.preventDefault());
  scope.on(list, "click", (event) => {
    const option = event.target.closest("[data-option]");
    if (option) choose(option);
  });
  scope.on(document, "pointerdown", (event) => {
    if (!root.contains(event.target)) close();
  });
  scope.on(root, "focusout", (event) => {
    if (!root.contains(event.relatedTarget)) close();
  });
}

export function dataFormStepper(root, scope) {
  const form = root.querySelector("form");
  const panels = [...form.querySelectorAll("[data-form-step]")];
  const steps = [...form.querySelectorAll(".dp-steps li")];
  const next = form.querySelector("[data-form-next]");
  const back = form.querySelector("[data-form-back]");
  const reset = form.querySelector("[data-form-reset]");
  let current = 0;
  function show(index, focus = true) {
    current = index;
    panels.forEach((panel, i) => {
      panel.hidden = i !== index;
    });
    steps.forEach((step, i) => {
      if (i === index) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
    });
    back.hidden = index === 0;
    next.textContent = index === 2 ? "신청 완료" : "다음";
    if (index === 2)
      form.querySelector("[data-review]").textContent =
        `${form.elements.name.value} · ${form.elements.email.value} · ${form.elements.plan.value}`;
    announce(root, "");
    if (focus) panels[index].querySelector("h3").focus();
  }
  scope.on(form, "submit", (event) => {
    event.preventDefault();
    const invalid = [...panels[current].querySelectorAll("input, select")].find(
      (input) =>
        !input.validity.valid || (input.name === "name" && !input.value.trim()),
    );
    if (invalid) {
      invalid.setAttribute("aria-invalid", "true");
      announce(
        root,
        invalid.name === "email"
          ? "올바른 이메일을 입력해주세요."
          : "이름을 입력해주세요.",
      );
      invalid.focus();
      return;
    }
    if (current < 2) show(current + 1);
    else {
      next.hidden = true;
      back.hidden = true;
      reset.hidden = false;
      announce(
        root,
        `${form.elements.name.value}님, ${form.elements.plan.value} 신청이 완료되었습니다.`,
      );
      reset.focus();
    }
  });
  scope.on(form, "input", (event) => {
    event.target.removeAttribute("aria-invalid");
  });
  scope.on(back, "click", () => show(current - 1));
  scope.on(reset, "click", () => {
    form.reset();
    form
      .querySelectorAll("[aria-invalid]")
      .forEach((input) => input.removeAttribute("aria-invalid"));
    next.hidden = false;
    reset.hidden = true;
    show(0);
  });
}

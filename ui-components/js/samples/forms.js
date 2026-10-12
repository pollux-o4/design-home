import { announce } from "./lifecycle.js";
export function stepper(root, scope) {
  const output = root.querySelector("output");
  const minus = root.querySelector('[data-step="-1"]');
  const update = (value) => {
    output.value = String(Math.max(1, Math.min(99, value)));
    minus.disabled = Number(output.value) === 1;
  };
  scope.on(root, "click", (event) => {
    const button = event.target.closest("[data-step]");
    if (button) update(Number(output.value) + Number(button.dataset.step));
  });
  update(1);
}
export function range(root, scope) {
  const input = root.querySelector("input");
  scope.on(input, "input", () => {
    root.querySelector("output").value = `${input.value}%`;
  });
}
export function datetime(root, scope) {
  const input = root.querySelector("input");
  scope.on(input, "change", () =>
    announce(
      root,
      input.value
        ? `선택 일시: ${input.value.replace("T", " ")}`
        : "일시를 선택하세요.",
    ),
  );
}
export function upload(root, scope) {
  const input = root.querySelector("input");
  const zone = root.querySelector("[data-drop-zone]");
  const filename = root.querySelector("[data-filename]");
  const reset = root.querySelector("[data-reset-file]");
  function show(file) {
    filename.textContent = file
      ? `${file.name} · ${(file.size / 1024).toFixed(1)} KB`
      : "선택한 파일이 없습니다.";
    reset.hidden = !file;
    announce(
      root,
      file
        ? "파일 선택 완료. 이 데모는 서버로 전송하지 않습니다."
        : "파일 선택이 취소되었습니다.",
    );
  }
  scope.on(input, "change", () => show(input.files[0]));
  scope.on(reset, "click", () => {
    input.value = "";
    show(null);
  });
  scope.on(zone, "dragover", (event) => {
    event.preventDefault();
    zone.classList.add("drag-over");
  });
  scope.on(zone, "dragleave", () => zone.classList.remove("drag-over"));
  scope.on(zone, "drop", (event) => {
    event.preventDefault();
    zone.classList.remove("drag-over");
    const file = event.dataTransfer.files[0];
    const selected = new DataTransfer();
    if (file) selected.items.add(file);
    input.files = selected.files;
    show(file);
  });
}
export function validation(root, scope) {
  const form = root.querySelector("form");
  const input = root.querySelector("input");
  scope.on(form, "submit", (event) => {
    event.preventDefault();
    const valid = input.validity.valid;
    input.setAttribute("aria-invalid", String(!valid));
    announce(
      root,
      valid
        ? "올바른 이메일입니다. 저장되었습니다."
        : "이메일 형식을 확인해주세요. 예: name@company.com",
    );
    if (!valid) input.focus();
  });
  scope.on(input, "input", () => {
    input.removeAttribute("aria-invalid");
    announce(root, "");
  });
}
export function password(root, scope) {
  const input = root.querySelector("input");
  const button = root.querySelector("button");
  scope.on(button, "click", () => {
    const visible = input.type === "password";
    input.type = visible ? "text" : "password";
    button.setAttribute("aria-pressed", String(visible));
    button.textContent = visible ? "숨기기" : "표시";
  });
}
export function searchable(root, scope) {
  const input = root.querySelector("input");
  const items = [...root.querySelectorAll("[data-result]")];
  scope.on(input, "input", () => {
    let count = 0;
    for (const item of items) {
      item.hidden = !item.textContent
        .toLowerCase()
        .includes(input.value.trim().toLowerCase());
      if (!item.hidden) count++;
    }
    announce(root, count ? `${count}개의 결과` : "일치하는 결과가 없습니다.");
  });
}

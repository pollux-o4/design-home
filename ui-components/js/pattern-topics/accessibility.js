export default {
  id: "accessibility",
  title: "접근성",
  term: "Accessibility",
  desc: "같은 패턴을 키보드·포커스·레이블 관점으로 확인합니다.",
  groups: [
    {
      id: "keyboard",
      title: "키보드 탐색",
      desc: "방향키·단축키·직접 조작의 대안.",
      ids: [
        "tab-bar",
        "drag-drop-reorder",
        "popover",
        "a11y-skip-link",
        "a11y-multi-listbox",
        "input-combobox",
      ],
    },
    {
      id: "forms",
      title: "레이블과 상태 안내",
      desc: "입력 목적과 오류, 선택 상태를 전달합니다.",
      ids: ["text-input", "form-validation", "radio", "toggle-switch", "form-stepper"],
    },
    {
      id: "focus",
      title: "포커스와 레이어",
      desc: "배경 차단·Escape·닫은 뒤 포커스 복귀.",
      ids: ["modal", "drawer", "interaction-command-palette"],
    },
    {
      id: "visual",
      title: "읽기와 시각적 표현",
      desc: "글자 200% 확대와 실제 색 대비를 확인합니다.",
      ids: ["a11y-text-scale", "a11y-contrast"],
    },
  ],
};

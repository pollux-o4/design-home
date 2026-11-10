export default {
  id: "interaction",
  title: "인터랙션",
  term: "Interaction",
  desc: "사용자의 조작에 어떤 동작으로 응답할지 정합니다.",
  groups: [
    {
      id: "states",
      title: "조작과 상태",
      desc: "호버·포커스·눌림·비활성화.",
      ids: [
        "hover-focus-active",
        "disabled-state",
        "micro-interaction",
        "interaction-inline-edit",
        "feedback-autosave",
      ],
    },
    {
      id: "manipulation",
      title: "직접 조작",
      desc: "드래그와 버튼, 키보드로 순서를 바꿉니다.",
      ids: [
        "drag-drop-reorder",
        "motion-card-tilt",
        "motion-swipe-stack",
        "interaction-bulk-select",
      ],
    },
    {
      id: "commands",
      title: "명령과 빠른 실행",
      desc: "짧은 메뉴에서 검색 가능한 명령 팔레트까지.",
      ids: ["popover", "interaction-command-palette"],
    },
  ],
};

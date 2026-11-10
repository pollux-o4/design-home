export default {
  id: "motion",
  title: "모션·애니메이션",
  term: "Motion & Animation",
  desc: "리듬과 탄성부터 공간의 연결, 스크롤과 감각적인 표현까지. 기본 원리를 익히고 고급 변형으로 확장합니다.",
  groups: [
    {
      id: "adaptive",
      title: "상태에 맞게 변형하기",
      desc: "같은 요소가 현재 상태와 조작에 맞춰 변합니다.",
      ids: ["morph-action", "morph-island"],
    },
    {
      id: "foundations",
      title: "타이밍과 리듬",
      desc: "속도 곡선·순차 등장·감쇠 스프링.",
      ids: ["motion-easing", "motion-stagger", "motion-spring"],
    },
    {
      id: "transitions",
      title: "화면과 레이아웃 전환",
      desc: "겹침과 방향, 카드와 상세 사이의 연속성.",
      ids: ["motion-crossfade", "motion-page-slide", "motion-flip", "motion-shared-element"],
    },
    {
      id: "spatial",
      title: "스크롤과 깊이",
      desc: "등장·진행·패럴랙스로 스크롤에 응답합니다.",
      ids: ["motion-scroll-reveal", "motion-scroll-progress", "motion-parallax"],
    },
    {
      id: "responses",
      title: "조작에 반응하는 움직임",
      desc: "가벼운 반응부터 카드 기울기와 스와이프까지.",
      ids: [
        "micro-interaction",
        "hover-focus-active",
        "toggle-switch",
        "motion-card-tilt",
        "motion-swipe-stack",
      ],
    },
    {
      id: "expressive",
      title: "감각적인 표현",
      desc: "SVG·숫자·타이포그래피·빛·궤도·완료의 순간.",
      ids: [
        "motion-svg-draw",
        "motion-counter",
        "motion-text-reveal",
        "motion-gradient",
        "motion-orbit",
        "motion-success-burst",
      ],
    },
    {
      id: "loading",
      title: "진행을 표현하는 움직임",
      desc: "회전·흐름·진행률. 기다리는 시간의 피드백.",
      ids: ["spinner", "skeleton-ui", "progress-bar"],
    },
  ],
};

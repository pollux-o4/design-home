const patterns = [
  ["motion-easing", "이징 곡선", "Easing Curves", "같은 거리의 여러 속도 곡선을 비교합니다."],
  ["motion-stagger", "순차적 등장", "Staggered Reveal", "요소가 시간차를 두고 차례로 나타납니다."],
  ["motion-spring", "스프링", "Damped Spring", "탄성과 감쇠를 가진 움직임입니다."],
  [
    "motion-flip",
    "FLIP 레이아웃 전환",
    "FLIP Layout Transition",
    "이전 위치와 다음 위치를 연결해 재배치합니다.",
  ],
  ["motion-crossfade", "크로스페이드", "Crossfade", "두 장면을 겹치며 전환합니다."],
  [
    "motion-shared-element",
    "공유 요소 전환",
    "Shared Element Transition",
    "같은 요소가 화면 사이를 이어 줍니다.",
  ],
  [
    "motion-scroll-reveal",
    "스크롤 등장",
    "Scroll Reveal",
    "스크롤 위치에서 필요한 콘텐츠를 드러냅니다.",
  ],
  [
    "motion-scroll-progress",
    "스크롤 진행률",
    "Scroll-linked Progress",
    "읽은 위치를 진행 막대로 보여줍니다.",
  ],
  [
    "motion-parallax",
    "패럴랙스",
    "Layered Parallax",
    "레이어를 서로 다른 속도로 움직여 깊이를 만듭니다.",
  ],
  ["motion-card-tilt", "카드 틸트", "Perspective Tilt", "포인터를 따라 원근감 있게 기울어집니다."],
  [
    "motion-page-slide",
    "방향성 화면 전환",
    "Directional Page Transition",
    "앞뒤 탐색 방향을 움직임으로 설명합니다.",
  ],
  [
    "motion-swipe-stack",
    "스와이프 카드 스택",
    "Swipe Card Stack",
    "카드를 넘겨 다음 항목으로 이동합니다.",
  ],
  [
    "motion-svg-draw",
    "SVG 선 그리기",
    "SVG Path Drawing",
    "선이 그려지며 기호나 일러스트를 완성합니다.",
  ],
  [
    "motion-counter",
    "카운트업",
    "Animated Metric / Count-up",
    "수치의 변화를 연속적인 숫자로 보여줍니다.",
  ],
  [
    "motion-text-reveal",
    "텍스트 리빌",
    "Staggered Typography Reveal",
    "단어 또는 문장이 순서대로 나타납니다.",
  ],
  [
    "motion-gradient",
    "애니메이티드 메쉬 그라디언트",
    "Animated Mesh Gradient",
    "색과 빛의 위치가 변하며 분위기를 만듭니다.",
  ],
  [
    "motion-orbit",
    "오비트 구성",
    "Orbital Product Composition",
    "중심 요소 주위를 궤도로 움직입니다.",
  ],
  [
    "motion-success-burst",
    "컨페티",
    "Success Burst / Confetti",
    "완료 순간에 짧은 파티클을 터뜨립니다.",
  ],
  [
    "morph-action",
    "상태 모핑",
    "State-driven Morphing Action",
    "버튼이 진행과 완료 상태로 변합니다.",
  ],
  [
    "morph-island",
    "적응형 상태 아일랜드",
    "Adaptive Status Island",
    "작은 상태 표시가 조작 영역으로 확장됩니다.",
  ],
];
const patternVisuals = {
  "motion-easing": "easing",
  "motion-stagger": "stagger",
  "motion-spring": "spring",
  "motion-flip": "layout-flip",
  "motion-crossfade": "crossfade",
  "motion-shared-element": "shared",
  "motion-scroll-reveal": "scroll-reveal",
  "motion-scroll-progress": "scroll-progress",
  "motion-parallax": "parallax",
  "motion-card-tilt": "tilt",
  "motion-page-slide": "page-slide",
  "motion-swipe-stack": "swipe-stack",
  "motion-svg-draw": "svg-draw",
  "motion-counter": "counter",
  "motion-text-reveal": "text-reveal",
  "motion-gradient": "gradient",
  "motion-orbit": "orbit",
  "motion-success-burst": "confetti",
  "morph-action": "morph-action",
  "morph-island": "morph-island",
};

export function createPatternMotionEntries(catalog) {
  return patterns.map(([id, title, term, desc]) => {
    const definition = catalog.find(id);
    if (!definition) throw new Error(`Missing motion glossary sample: ${id}`);
    return {
      ...definition,
      id: `glossary-${id}`,
      category: "motion",
      title,
      term,
      desc,
      visual: `motion-${patternVisuals[id]}`,
      samples: [id],
    };
  });
}

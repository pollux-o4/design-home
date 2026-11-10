(function () {
  const { define, register } = window.CanvasSamples;
  const status = '<p class="sample-status" data-status role="status"></p>';
  const action = (label = "다시 재생") =>
    `<button class="ui-btn" data-motion-play>${label}</button>`;
  register(
    "motion-expressive",
    "표현적인 모션",
    "형태, 빛, 타이포그래피에 의미 있는 움직임을 더합니다.",
    [
      {
        title: "표현과 완성",
        desc: "작은 순간부터 제품의 첫인상까지.",
        components: [
          define({
            id: "motion-svg-draw",
            level: "basic",
            title: "선을 따라 나타나기",
            term: "SVG Path Drawing",
            desc: "연속적인 선이 그려지며 심볼을 완성합니다.",
            behavior: "svgDraw",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dashoffset",
            html: `<div class="motion-stage expressive-stage expressive-draw"><svg viewBox="0 0 240 150" aria-label="산과 떠오르는 해" role="img"><path data-draw pathLength="1" d="M32 114 L88 40 L132 102 L162 64 L208 114 Z M110 43 A24 24 0 1 1 155 43"/></svg><span class="expressive-caption">A line. A landscape.</span></div>${action()}${status}`,
          }),
          define({
            id: "motion-counter",
            level: "basic",
            title: "숫자의 변화",
            term: "Animated Metric / Count-up",
            desc: "실제 수치의 변화량을 부드러운 카운트로 전달합니다.",
            behavior: "metricCounter",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame",
            html: `<div class="motion-stage expressive-stage expressive-metric"><span class="expressive-caption">이번 달의 걸음</span><strong data-metric aria-hidden="true">8,420</strong><span data-metric-summary class="sample-muted">이번 달 8,420 걸음</span><span class="expressive-metric-line"></span></div>${action("다음 목표로")}${status}`,
          }),
          define({
            id: "motion-text-reveal",
            level: "basic",
            title: "문장의 등장",
            term: "Staggered Typography Reveal",
            desc: "단어마다 약간의 간격을 두어 시선의 리듬을 만듭니다.",
            behavior: "textReveal",
            reference: "https://developer.mozilla.org/en-US/docs/Web/API/Element/animate",
            html: `<div class="motion-stage expressive-stage expressive-type"><p><span class="expressive-reader" lang="en">Make room for wonder.</span><span aria-hidden="true" data-word>Make room</span><span aria-hidden="true" data-word>for <em>wonder.</em></span></p><span class="expressive-caption">작은 여백, 새로운 가능성.</span></div>${action()}${status}`,
          }),
          define({
            id: "motion-gradient",
            level: "advanced",
            title: "빛의 흐름",
            term: "Animated Mesh Gradient",
            desc: "빛의 위치와 혼합을 바꿔 장면의 분위기를 전환합니다.",
            behavior: "meshGradient",
            reference: "https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient",
            html: `<div class="motion-stage expressive-stage expressive-mesh" data-mesh><span class="mesh-light mesh-light-a" data-light></span><span class="mesh-light mesh-light-b" data-light></span><span class="mesh-light mesh-light-c" data-light></span><div class="mesh-copy"><span>COLOR STUDY</span><strong>빛을 담은<br>새로운 순간.</strong></div></div><button class="ui-btn" data-motion-play aria-pressed="false">분위기 전환</button>${status}`,
          }),
          define({
            id: "motion-orbit",
            level: "advanced",
            title: "궤도 위의 구성",
            term: "Orbital Product Composition",
            desc: "중심 제품 주위의 요소가 깊이와 공간감을 만듭니다.",
            behavior: "productOrbit",
            reference: "https://developer.mozilla.org/en-US/docs/Web/API/Animation/pause",
            html: `<div class="motion-stage expressive-stage expressive-orbit"><div class="orbit-track" data-orbit><span class="orbit-satellite orbit-satellite-a"></span><span class="orbit-satellite orbit-satellite-b"></span><span class="orbit-satellite orbit-satellite-c"></span></div><div class="orbit-product"><span>O</span><small>STUDIO</small></div><span class="expressive-caption">Designed to move you.</span></div><div class="sample-row">${action("궤도 재생")}<button class="ui-btn" data-motion-pause disabled>일시 정지</button></div>${status}`,
          }),
          define({
            id: "motion-success-burst",
            level: "advanced",
            title: "완료의 순간",
            term: "Success Burst / Confetti",
            desc: "작업 완료를 한 번의 짧은 축하 효과로 강조합니다.",
            behavior: "successBurst",
            reference: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API",
            html: `<div class="motion-stage expressive-stage expressive-success"><svg class="success-particles" viewBox="0 0 240 180" aria-hidden="true">${Array.from({ length: 12 }, (_, index) => `<rect data-particle x="117" y="87" width="6" height="6" rx="2" class="particle-${index % 3}"/>`).join("")}</svg><div class="success-seal" data-seal><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M11 20 L17 26 L29 13"/></svg></div><strong data-success-label>마지막 한 단계.</strong></div>${action("작업 완료하기")}${status}`,
          }),
        ],
      },
    ],
  );
})();

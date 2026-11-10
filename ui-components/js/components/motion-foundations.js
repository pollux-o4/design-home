(function () {
  const { define: d, register } = window.CanvasSamples;
  const reference = "https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API";
  const status = '<p class="sample-status" data-status role="status"></p>';
  const replay = '<button class="ui-btn ui-btn-primary" data-replay>다시 재생</button>';
  register(
    "motion-foundations",
    "움직임의 원리와 전환",
    "속도와 리듬, 공간의 연결을 직접 비교합니다.",
    [
      {
        title: "움직임의 원리",
        desc: "타이밍을 바꾸면 같은 이동도 다르게 느껴집니다.",
        components: [
          d({
            id: "motion-easing",
            title: "속도 곡선 비교",
            term: "Easing Curves",
            level: "basic",
            reference,
            desc: "같은 거리와 시간. 일정한 속도와 부드러운 감속을 비교하세요.",
            behavior: "motionEasing",
            html: `<div class="motion-stage mf-stage mf-curves">${["Linear", "Ease in-out", "Ease out"].map((name, index) => `<div class="mf-lane"><span>${name}</span><div class="mf-track"><span class="mf-dot" data-curve="${index}"></span></div></div>`).join("")}</div>${replay}${status}`,
          }),
          d({
            id: "motion-stagger",
            title: "순차적 등장",
            term: "Staggered Reveal",
            level: "basic",
            reference,
            desc: "한 번에 보여주기보다 순서대로. 콘텐츠의 읽는 흐름을 만듭니다.",
            behavior: "motionStagger",
            html: `<div class="motion-stage mf-stage mf-stagger">${["새로운 관점", "섬세한 디테일", "자연스러운 흐름"].map((title, index) => `<div class="mf-reveal" data-reveal><span class="mf-number">0${index + 1}</span><strong>${title}</strong><span class="mf-mini-line"></span></div>`).join("")}</div>${replay}${status}`,
          }),
          d({
            id: "motion-spring",
            title: "스프링의 여운",
            term: "Damped Spring",
            level: "advanced",
            reference,
            desc: "반동과 감쇠를 조절하며 탄성 있는 움직임을 살펴보세요.",
            behavior: "motionSpring",
            html: `<div class="motion-stage mf-stage mf-spring"><div class="mf-spring-anchor"></div><div class="mf-spring-orb" data-orb><span>Flow</span></div></div><label class="ui-form-group">감쇠 <input type="range" min="3" max="12" value="6" data-damping aria-label="스프링 감쇠"></label>${replay}${status}`,
          }),
        ],
      },
      {
        title: "공간과 콘텐츠의 전환",
        desc: "변화 전후의 관계를 움직임으로 설명합니다.",
        components: [
          d({
            id: "motion-flip",
            title: "이어지는 레이아웃",
            term: "FLIP Layout Transition",
            level: "advanced",
            reference,
            desc: "실제 카드 순서를 바꾸면서 원래 위치와 새 위치를 연결합니다.",
            behavior: "motionFlip",
            html: `<div class="motion-stage mf-stage"><div class="mf-flip-grid" data-flip-grid>${["Ocean", "Forest", "Dawn", "Stone"].map((name, index) => `<div class="mf-tile mf-tone-${index}" data-tile><span>0${index + 1}</span><strong>${name}</strong></div>`).join("")}</div></div><button class="ui-btn ui-btn-primary" data-reorder>순서 바꾸기</button>${status}`,
          }),
          d({
            id: "motion-crossfade",
            title: "겹쳐지는 콘텐츠",
            term: "Crossfade",
            level: "basic",
            reference,
            desc: "두 장면을 잠깐 겹쳐 시선의 흐름을 끊지 않고 전환합니다.",
            behavior: "motionCrossfade",
            html: `<div class="motion-stage mf-stage mf-crossfade"><div class="mf-scene mf-ocean" data-scene><span>01 / OCEAN</span><strong>고요한 파랑.</strong></div><div class="mf-scene mf-forest" data-scene hidden><span>02 / FOREST</span><strong>깊어진 초록.</strong></div></div><button class="ui-btn ui-btn-primary" data-next>장면 전환</button>${status}`,
          }),
          d({
            id: "motion-shared-element",
            title: "카드에서 상세로",
            term: "Shared Element Transition",
            level: "advanced",
            reference,
            desc: "같은 시각 요소가 확장되어 콘텐츠의 위치와 관계를 유지합니다.",
            behavior: "motionSharedElement",
            html: `<div class="motion-stage mf-stage mf-shared"><div class="mf-shared-art" data-shared-art><span>FIELD NOTES</span><strong>빛이 머무는 곳.</strong></div><div class="mf-shared-copy" data-detail hidden><p>차분한 색과 여백으로 장면을 더 가까이 살펴보세요.</p><button class="ui-btn" data-close>상세 닫기</button></div><button class="ui-btn ui-btn-primary" data-open aria-expanded="false">자세히 보기</button></div>${status}`,
          }),
        ],
      },
    ],
  );
})();

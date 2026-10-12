(function () {
  const { define: d, register } = CanvasSamples;
  const controls = (previous = "이전", next = "다음") =>
    `<div class="sample-row spatial-controls"><button class="ui-btn" data-previous>${previous}</button><button class="ui-btn ui-btn-primary" data-next>${next}</button></div>`;
  const status = '<p class="sample-status" data-status role="status"></p>';
  const reference =
    "https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API";
  register(
    "motion-spatial",
    "공간과 움직임",
    "스크롤과 방향, 깊이로 이어지는 경험.",
    [
      {
        title: "공간과 탐색",
        desc: "사용자의 조작을 따라 움직입니다.",
        components: [
          d({
            id: "motion-scroll-reveal",
            level: "basic",
            title: "스크롤 등장",
            term: "Scroll Reveal",
            desc: "아래로 스크롤하면 글과 도형이 순서대로 드러납니다.",
            behavior: "spatialScrollReveal",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API",
            html: `<div class="motion-stage spatial-scroll reveal-scroll" tabindex="0" role="region" aria-label="스크롤 등장 데모"><p class="spatial-scroll-intro">천천히 내려보세요.<br><small>작은 발견이 이어집니다.</small></p>${["고요한 시작", "새로운 균형", "넓어진 시선"].map((text, index) => `<section class="spatial-reveal-item" data-reveal><span class="spatial-orb orb-${index}"></span><h4>${text}</h4><p>필요한 순간에 모습을 드러냅니다.</p></section>`).join("")}</div>${status}`,
          }),
          d({
            id: "motion-scroll-progress",
            level: "basic",
            title: "스크롤 진행률",
            term: "Scroll-linked Progress",
            desc: "실제 읽은 위치를 상단의 진행 막대로 안내합니다.",
            behavior: "spatialScrollProgress",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop",
            html: `<div class="motion-stage spatial-reading"><div class="spatial-progress" role="progressbar" aria-label="읽기 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span data-progress></span></div><div class="spatial-scroll reading-scroll" tabindex="0" role="region" aria-label="읽기 진행률 데모">${["시작하기", "균형을 찾다", "세부를 다듬다", "끝까지 이어지다"].map((title, index) => `<section><small>CHAPTER 0${index + 1}</small><h4>${title}</h4><p>한 번에 하나의 생각에 집중하세요. 여백은 다음 이야기를 받아들일 시간을 줍니다.</p><span class="reading-line"></span></section>`).join("")}</div><output data-reading-output>0%</output></div>`,
          }),
          d({
            id: "motion-parallax",
            level: "advanced",
            title: "깊이 있는 스크롤",
            term: "Layered Parallax",
            desc: "서로 다른 속도로 움직이는 풍경. 이 안에서 스크롤하세요.",
            behavior: "spatialParallax",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/CSS/transform",
            html: `<div class="motion-stage spatial-scroll parallax-scroll" tabindex="0" role="region" aria-label="패럴랙스 풍경 데모"><div class="parallax-stage"><span class="parallax-sun" data-depth="0.15"></span><span class="parallax-ridge ridge-back" data-depth="0.3"></span><span class="parallax-ridge ridge-front" data-depth="0.55"></span><div class="parallax-caption"><small>EXPLORE THE QUIET</small><h4>깊이를 따라.</h4><p>아래로 스크롤</p></div></div><div class="parallax-space"></div></div>`,
          }),
          d({
            id: "motion-card-tilt",
            level: "advanced",
            title: "입체 카드",
            term: "Perspective Tilt",
            desc: "포인터를 움직이거나 방향 버튼으로 카드의 깊이를 살펴보세요.",
            behavior: "spatialCardTilt",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/CSS/perspective",
            html: `<div class="motion-stage tilt-stage" data-tilt-stage><div class="spatial-tilt-card" data-tilt-card><small>FORM / LIGHT</small><span class="tilt-art"></span><strong>다른 각도.<br>새로운 시선.</strong></div></div><div class="sample-row spatial-controls" aria-label="카드 기울이기"><button class="ui-btn" data-tilt="left" aria-label="왼쪽으로 기울이기">←</button><button class="ui-btn" data-tilt="up" aria-label="위로 기울이기">↑</button><button class="ui-btn" data-tilt="down" aria-label="아래로 기울이기">↓</button><button class="ui-btn" data-tilt="right" aria-label="오른쪽으로 기울이기">→</button><button class="ui-btn" data-tilt="reset">초기화</button></div>${status}`,
          }),
          d({
            id: "motion-page-slide",
            level: "basic",
            title: "방향이 있는 화면 전환",
            term: "Directional Page Transition",
            desc: "앞으로 갈 때와 돌아올 때의 방향을 구분합니다.",
            behavior: "spatialPageSlide",
            reference,
            html: `<div class="motion-stage spatial-page-stage"><div class="spatial-page" data-page><small data-page-count>01 / 03</small><span class="page-art"></span><h4 data-page-title>발견하기</h4><p data-page-desc>새로운 아이디어를 만나세요.</p></div></div>${controls()}${status}`,
          }),
          d({
            id: "motion-swipe-stack",
            level: "advanced",
            title: "넘기는 카드 스택",
            term: "Swipe Card Stack",
            desc: "카드를 좌우로 넘기거나 버튼으로 다음 작품을 발견하세요.",
            behavior: "spatialSwipeStack",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events",
            html: `<div class="motion-stage spatial-stack-stage"><span class="spatial-stack-shadow"></span><article class="spatial-stack-card" data-swipe-card><small data-stack-count>01 / 04</small><span class="stack-art"></span><h4 data-stack-title>빛의 리듬</h4><p>FORM STUDIES</p></article></div>${controls()}${status}`,
          }),
        ],
      },
    ],
  );
})();

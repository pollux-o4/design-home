(function () {
  const { define, register } = CanvasSamples;
  const status = '<p class="sample-status" data-status role="status"></p>';
  const button = (key, label) =>
    `<button type="button" class="lp-choice" data-view="${key}">${label}</button>`;
  const cards = [
    "빛을 담은 기록",
    "천천히 걷는 시간",
    "작은 발견",
    "일상의 온도",
  ]
    .map(
      (title, i) =>
        `<article class="lp-tile"><span class="lp-eyebrow">0${i + 1} / JOURNAL</span><strong>${title}</strong><p>여백으로 이어지는 이야기.</p></article>`,
    )
    .join("");
  const sample = (definition) =>
    define({
      ...definition,
      reference:
        definition.reference ??
        "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout",
      html: definition.html + status,
    });
  register(
    "layout-patterns",
    "화면 구조와 탐색",
    "콘텐츠의 관계와 화면의 밀도를 조절합니다.",
    [
      {
        title: "화면 구조",
        desc: "단순한 배치에서 연결된 작업 공간까지.",
        components: [
          sample({
            id: "layout-grid",
            title: "반응형 그리드",
            term: "Responsive Grid",
            level: "basic",
            behavior: "layoutGrid",
            desc: "열 수를 바꿔 카드 배치와 읽는 흐름을 비교하세요.",
            html: `<div class="lp-controls" aria-label="그리드 열 수"><button class="lp-choice" data-columns="1" aria-pressed="false">1열</button><button class="lp-choice" data-columns="2" aria-pressed="true">2열</button></div><div class="lp-grid" data-grid>${cards}</div>`,
          }),
          sample({
            id: "layout-stack",
            title: "스택과 여백",
            term: "Stack Layout",
            level: "basic",
            behavior: "layoutStack",
            desc: "간격과 정렬을 바꾸며 콘텐츠의 리듬을 만들어보세요.",
            html: `<div class="lp-controls"><label>간격 <input type="range" min="8" max="32" step="4" value="16" data-gap></label><label>정렬 <select data-align><option value="stretch">채우기</option><option value="start">왼쪽</option><option value="center">가운데</option></select></label></div><div class="lp-stack" data-stack><span class="lp-eyebrow">A QUIET MOMENT</span><h3>일상에 여유를.</h3><p>한 줄의 제목, 짧은 설명.<br>그 사이의 여백을 살펴보세요.</p><span class="lp-stack-note">나만의 속도로, 하나씩.</span></div>`,
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout",
          }),
          sample({
            id: "layout-split",
            title: "분할 화면",
            term: "Split View",
            level: "basic",
            behavior: "layoutSplit",
            desc: "두 영역의 비율을 조절하세요. 좁은 화면에서는 세로로 이어집니다.",
            html: `<label class="lp-controls">왼쪽 영역 <input type="range" min="30" max="65" value="40" data-ratio><output data-ratio-label>40%</output></label><div class="lp-split" data-split><section><span class="lp-eyebrow">COLLECTION</span><h3>이번 주의 기록</h3><p>작은 순간들을 모았습니다.</p></section><section><span class="lp-eyebrow">FEATURED</span><h3>오후의 빛</h3><p>조용한 시간에 새롭게 보이는 익숙한 풍경.</p></section></div>`,
          }),
          sample({
            id: "layout-master-detail",
            title: "목록과 상세",
            term: "Master–Detail",
            level: "advanced",
            behavior: "layoutMasterDetail",
            desc: "목록을 선택하면 같은 화면에서 상세 내용을 확인합니다.",
            html: `<div class="lp-master"><nav class="lp-menu" aria-label="기록 선택">${button("light", "오후의 빛")}${button("walk", "느린 산책")}${button("desk", "작업의 자리")}</nav><article class="lp-detail"><span class="lp-eyebrow" data-detail-kicker></span><h3 data-detail-title></h3><p data-detail-copy></p><span class="lp-detail-note">목록의 맥락을 유지하면서 읽기</span></article></div>`,
            reference:
              "https://developer.apple.com/design/human-interface-guidelines/split-views",
          }),
          sample({
            id: "layout-adaptive-sidebar",
            title: "적응형 사이드바",
            term: "Adaptive Sidebar",
            level: "advanced",
            behavior: "layoutAdaptiveSidebar",
            desc: "넓은 화면에서는 나란히, 좁은 화면에서는 메뉴를 펼쳐 탐색합니다.",
            html: `<div class="lp-adaptive"><button type="button" class="lp-menu-toggle ui-btn" data-menu-toggle aria-expanded="false">메뉴 열기</button><nav class="lp-menu" data-adaptive-menu aria-label="작업 공간">${button("overview", "둘러보기")}${button("saved", "저장한 기록")}${button("settings", "환경 설정")}</nav><section class="lp-detail"><span class="lp-eyebrow">WORKSPACE</span><h3 data-adaptive-title>둘러보기</h3><p data-adaptive-copy>오늘의 새로운 기록을 확인하세요.</p></section></div>`,
            reference:
              "https://developer.apple.com/design/human-interface-guidelines/sidebars",
          }),
          sample({
            id: "layout-dashboard",
            title: "요약 대시보드",
            term: "Dashboard",
            level: "advanced",
            behavior: "layoutDashboard",
            desc: "기간과 지표를 선택하면 요약 수치와 실제 차트가 함께 바뀝니다.",
            html: `<div class="lp-dashboard"><div class="lp-controls"><label>기간 <select data-period><option value="week">이번 주</option><option value="month">이번 달</option></select></label><label>지표 <select data-metric><option value="views">조회</option><option value="saves">저장</option></select></label></div><div class="lp-metric"><span data-metric-label>총 조회</span><strong data-total></strong><small data-change></small></div><svg class="lp-chart" viewBox="0 0 320 110" role="img" aria-label="기간별 조회 막대 차트"><g data-bars></g></svg><div class="lp-chart-caption"><span data-period-start></span><span data-period-end></span></div></div>`,
            reference:
              "https://developer.apple.com/design/human-interface-guidelines/charts",
          }),
          sample({
            id: "layout-sticky-panel",
            title: "고정 요약 패널",
            term: "Sticky Action Panel",
            level: "advanced",
            behavior: "layoutStickyPanel",
            desc: "내용을 스크롤해도 선택한 항목과 저장 동작은 계속 보입니다.",
            html: `<div class="lp-reader" data-reader tabindex="0" role="region" aria-label="스크롤 가능한 여행 계획"><div class="lp-sticky"><strong>주말의 서울</strong><button class="ui-btn ui-btn-primary" data-save-plan>계획 저장</button></div><article class="lp-itinerary">${[
              [
                "01 / MORNING",
                "고요한 시작",
                "한적한 골목에서 커피를 마시고 작은 서점을 둘러보세요.",
              ],
              [
                "02 / AFTERNOON",
                "도시를 걷다",
                "공원을 지나 전시 공간으로. 걷는 동안 계절의 변화를 느껴보세요.",
              ],
              [
                "03 / EVENING",
                "하루의 마무리",
                "창가에 앉아 오늘의 기록을 정리합니다.",
              ],
            ]
              .map(
                ([k, t, p]) =>
                  `<section><span class="lp-eyebrow">${k}</span><h3>${t}</h3><p>${p}</p></section>`,
              )
              .join("")}</article></div>`,
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/CSS/position",
          }),
          sample({
            id: "navigation-bottom-bar",
            title: "하단 탐색",
            term: "Bottom Navigation",
            level: "basic",
            behavior: "layoutBottomNavigation",
            desc: "엄지손가락 가까이 있는 탐색으로 주요 화면을 전환합니다.",
            html: `<div class="lp-mobile"><article class="lp-mobile-content"><span class="lp-eyebrow">YOUR SPACE</span><h3 data-bottom-title></h3><p data-bottom-copy></p><div class="lp-mobile-art" aria-hidden="true"></div></article><nav class="lp-bottom" aria-label="주요 화면">${button("today", "오늘")}${button("collection", "모음")}${button("profile", "내 공간")}</nav></div>`,
            reference:
              "https://developer.apple.com/design/human-interface-guidelines/tab-bars",
          }),
        ],
      },
    ],
  );
})();

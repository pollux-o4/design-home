(function () {
  const { define: d, register } = window.CanvasSamples;
  const choices = (items) =>
    items
      .map(
        ([label, content], index) =>
          `<button class="${index === 0 ? "active" : ""}" data-choice data-content="${content}">${label}</button>`,
      )
      .join("");
  register("navigation", "화면 이동과 구조", "이동할 위치와 현재 위치를 분명하게.", [
    {
      title: "구조와 메뉴",
      desc: "선택하면 콘텐츠도 함께 바뀝니다.",
      components: [
        d({
          id: "gnb-bar",
          reference:
            "https://developer.apple.com/design/human-interface-guidelines/navigation-and-search",
          title: "메인 내비게이션",
          term: "Global Navigation (GNB)",
          desc: "현재 메뉴와 해당 화면의 내용을 함께 표시합니다.",
          behavior: "selection",
          html: `<nav class="sample-nav" aria-label="샘플 메인 메뉴"><strong>Studio</strong><div class="ui-segmented">${choices(
            [
              ["개요", "오늘의 프로젝트를 한눈에 확인하세요."],
              ["프로젝트", "진행 중인 프로젝트 3개가 있습니다."],
              ["분석", "이번 주 방문이 12% 늘었습니다."],
            ],
          )}</div></nav><p class="sample-panel" data-panel></p>`,
        }),
        d({
          id: "lnb-sidebar",
          reference: "https://developer.apple.com/design/human-interface-guidelines/sidebars",
          title: "사이드바",
          term: "Persistent Sidebar",
          desc: "본문 옆에 계속 보이는 탐색 영역. 메뉴를 바꿔도 패널은 닫히지 않습니다.",
          behavior: "selection",
          html: `<div class="sidebar-demo"><aside class="sidebar-demo-nav"><nav class="sample-stack" aria-label="샘플 사이드바"><details class="ui-disclosure" open><summary>업무</summary><div class="sample-stack">${choices(
            [
              ["실시간 지표", "실시간 지표를 표시합니다."],
              ["매출 리포트", "이번 달 매출 리포트입니다."],
            ],
          )}</div></details><details class="ui-disclosure"><summary>프로젝트</summary><div class="sample-stack">${choices(
            [
              ["웹 앱", "웹 앱 프로젝트를 선택했습니다."],
              ["모바일", "모바일 프로젝트를 선택했습니다."],
            ],
          )}</div></details></nav></aside><section class="sidebar-demo-content"><span class="sample-muted">WORKSPACE</span><h3>프로젝트 현황</h3><p data-panel role="status"></p></section></div>`,
        }),
        d({
          id: "breadcrumb-interactive",
          reference: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/nav",
          title: "경로 탐색",
          term: "Breadcrumb",
          desc: "상위 경로를 선택하고 현재 위치를 확인합니다.",
          behavior: "selection",
          html: `<nav class="sample-breadcrumb" aria-label="샘플 경로">${choices([
            ["홈", "홈으로 이동했습니다."],
            ["프로젝트", "프로젝트 목록입니다."],
            ["Design System", "Design System 상세 화면입니다."],
          ])}</nav><p class="sample-status" data-panel role="status"></p>`,
        }),
        d({
          id: "integrated-nav-demo",
          reference: "https://developer.apple.com/design/human-interface-guidelines/sidebars",
          title: "연결된 내비게이션",
          term: "App Shell / Navigation Layout",
          desc: "메인·하위 메뉴·본문이 같은 데이터에서 구성됩니다.",
          behavior: "integrated",
          html: `<div class="integrated-layout"><nav class="integrated-main" data-main-menu aria-label="샘플 상위 메뉴"></nav><div class="integrated-body"><nav class="integrated-sub" data-sub-menu aria-label="샘플 하위 메뉴"></nav><section class="integrated-view"><h3 data-view-title></h3><p class="sample-muted" data-view-desc></p></section></div></div>`,
        }),
      ],
    },
    {
      title: "콘텐츠 탐색",
      desc: "탭·슬라이드·목록을 가볍게 탐색합니다.",
      components: [
        d({
          id: "tab-bar",
          reference:
            "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/tab_role",
          title: "탭",
          term: "Tabs",
          desc: "방향키·Home·End로 전환할 수 있습니다.",
          behavior: "selection",
          html: `<div class="ui-tabs" role="tablist" aria-label="프로젝트 상태">${[
            ["전체", "전체 프로젝트 6개"],
            ["진행 중", "진행 중인 프로젝트 3개"],
            ["완료", "완료한 프로젝트 3개"],
          ]
            .map(
              ([label, content], index) =>
                `<button class="ui-tab ${index === 0 ? "active" : ""}" id="status-tab-${index}" role="tab" aria-controls="status-panel" data-choice data-content="${content}">${label}</button>`,
            )
            .join(
              "",
            )}</div><div class="sample-panel" id="status-panel" role="tabpanel" data-panel aria-labelledby="status-tab-0"></div>`,
        }),
        d({
          id: "carousel",
          reference: "https://developer.apple.com/design/human-interface-guidelines/page-controls",
          title: "캐러셀",
          term: "Carousel",
          desc: "이전·다음과 직접 선택. 자동 재생으로 읽기를 방해하지 않습니다.",
          behavior: "carousel",
          html: `<section class="sample-slide" aria-roledescription="캐러셀" aria-label="디자인 하이라이트"><span class="ui-badge ui-badge-info" data-slide-label></span><h3 data-slide-title></h3><p data-slide-desc></p></section><div class="sample-between"><div class="sample-row" data-dots></div><div class="sample-row"><button class="ui-btn ui-btn-secondary" data-direction="-1" aria-label="이전 슬라이드">이전</button><button class="ui-btn ui-btn-secondary" data-direction="1" aria-label="다음 슬라이드">다음</button></div></div><p class="sample-status" data-status role="status"></p>`,
        }),
        d({
          id: "pagination",
          reference: "https://developer.apple.com/design/human-interface-guidelines/page-controls",
          title: "페이지네이션",
          term: "Pagination",
          desc: "목록과 페이지 상태가 함께 갱신됩니다.",
          behavior: "pagination",
          html: `<ul class="sample-list" data-page-items></ul><nav class="sample-row pagination" aria-label="샘플 페이지"><button data-page="prev" aria-label="이전 페이지">‹</button>${[1, 2, 3].map((page) => `<button data-page="${page}" class="page-num-btn" aria-label="${page}페이지">${page}</button>`).join("")}<button data-page="next" aria-label="다음 페이지">›</button></nav><p class="sample-status" data-status role="status"></p>`,
        }),
        d({
          id: "infinite-scroll",
          reference: "https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API",
          title: "더 보기와 무한 스크롤",
          term: "Infinite Scroll / Load More",
          desc: "진행·완료·초기화 상태를 갖춘 목록. 최대 10개.",
          behavior: "feed",
          html: `<div class="sample-between"><strong>데이터 피드</strong><span class="sample-status" id="infinite-scroll-status" role="status"></span></div><div class="sample-feed" id="infinite-scroll-list" tabindex="0" aria-label="데이터 피드 목록"></div><div class="sample-row"><button class="ui-btn ui-btn-primary" id="btn-load-more">더 보기 (+2)</button><button class="ui-btn ui-btn-secondary" id="btn-reset-infinite">초기화</button></div>`,
        }),
      ],
    },
  ]);
})();

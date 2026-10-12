(function () {
  const { define: d, register, icon } = CanvasSamples;
  const status = '<p class="sample-status" data-status role="status"></p>';
  register(
    "accessibility-patterns",
    "접근 가능한 경험",
    "키보드와 시각적 표현을 직접 확인합니다.",
    [
      {
        title: "이동과 선택",
        desc: "필요한 곳으로 이동하고, 포커스와 선택을 구분합니다.",
        components: [
          d({
            id: "a11y-skip-link",
            title: "본문으로 바로 이동",
            term: "Skip Link / Bypass Blocks",
            level: "basic",
            reference: "https://www.w3.org/WAI/WCAG21/Techniques/general/G1",
            desc: "반복 메뉴를 건너뛰고 본문으로 포커스를 옮깁니다.",
            behavior: "accessibleSkip",
            html: `<div class="a11y-skip-stage"><a class="a11y-skip" href="#a11y-main-content">본문으로 건너뛰기 ${icon("arrow")}</a><nav aria-label="건너뛰기 예제 메뉴"><button class="ui-btn" data-skip-menu="오늘">오늘</button><button class="ui-btn" data-skip-menu="보관함">보관함</button></nav><section class="a11y-main" id="a11y-main-content" tabindex="-1" aria-label="건너뛰기 예제 본문"><p class="a11y-kicker">YOUR SPACE</p><h4 data-skip-title>오늘의 기록</h4><p>메뉴를 반복해서 지나가지 않고,<br>이곳부터 읽고 조작하세요.</p><button class="ui-btn" data-skip-action>기록 열기</button></section></div>${status}`,
          }),
          d({
            id: "a11y-multi-listbox",
            title: "포커스와 다중 선택",
            term: "Multi-select Listbox",
            level: "advanced",
            reference: "https://www.w3.org/WAI/ARIA/apg/patterns/listbox/",
            desc: "방향키로 이동하고 Space로 선택합니다. 이동과 선택은 독립적입니다.",
            behavior: "accessibleListbox",
            html: `<div class="a11y-listbox" role="listbox" tabindex="0" aria-label="작업 패널 선택" aria-multiselectable="true">${["Design · 디자인", "Prototype · 프로토타입", "Inspect · 검사", "Publish · 게시"].map((title, index) => `<div role="option" id="a11y-panel-${index}" aria-selected="${index === 0}" data-option="${index}"><span>${title}</span>${icon("check")}</div>`).join("")}</div><p class="a11y-hint">↑ ↓ 이동 · Space 선택 · Home / End · Ctrl/⌘A 전체 선택</p><div class="a11y-selection"><span>선택한 패널</span><output data-listbox-output>Design</output></div>${status}`,
          }),
        ],
      },
      {
        title: "읽기와 시각적 표현",
        desc: "글자 확대와 실제 색 대비를 확인합니다.",
        components: [
          d({
            id: "a11y-text-scale",
            title: "확대해도 유지되는 화면",
            term: "Text Resize / Reflow",
            level: "basic",
            reference:
              "https://www.w3.org/WAI/WCAG21/Understanding/resize-text",
            desc: "글자를 200%까지 확대해도 내용과 조작이 잘리지 않습니다.",
            behavior: "accessibleTextScale",
            html: `<label class="ui-form-group">글자 크기 <output data-scale-output>100%</output><input type="range" min="100" max="200" step="25" value="100" data-text-scale aria-label="예제 글자 크기"></label><article class="a11y-reflow" data-reflow><p class="a11y-kicker">ROOM TO READ</p><h4>읽기 좋은 여백.</h4><p>확대된 글자가 다음 줄로 흐르고, 버튼도 내용에 맞춰 자랍니다.</p><button data-reflow-action>자세히 살펴보기</button></article>${status}`,
          }),
          d({
            id: "a11y-contrast",
            title: "색 대비 확인",
            term: "Color Contrast / Contrast Ratio",
            level: "advanced",
            reference:
              "https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum",
            desc: "색을 바꾸며 실제 대비율과 일반 텍스트의 4.5:1 기준을 확인합니다.",
            behavior: "accessibleContrast",
            html: `<div class="a11y-colors"><label>글자 색<input type="color" value="#1d1d1f" data-foreground aria-label="대비 예제 글자 색"></label><label>배경 색<input type="color" value="#ffffff" data-background aria-label="대비 예제 배경 색"></label></div><div class="a11y-contrast-preview" data-contrast-preview><span>작은 디테일도</span><strong>선명하게.</strong><p>읽기 쉬운 색의 조합을 찾아보세요.</p></div><div class="a11y-contrast-result"><output data-contrast-ratio></output><span data-contrast-result></span></div>${status}`,
          }),
        ],
      },
    ],
  );
})();

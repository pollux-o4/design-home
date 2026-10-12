(function () {
  const { define: d, register } = CanvasSamples;
  const projects = [
    { name: "Studio", members: 8, progress: 72 },
    { name: "Atlas", members: 12, progress: 94 },
    { name: "Bloom", members: 4, progress: 38 },
  ];
  function table(sortable = false) {
    const columns = [
      ["name", "프로젝트"],
      ["members", "참여자"],
      ["progress", "진행률"],
    ];
    return `<div class="dp-table-wrap"><div class="dp-table-scroll" data-scroll-region tabindex="0" role="region" aria-label="프로젝트 표. 좁은 화면에서는 가로로 스크롤하세요."><table class="dp-table"><caption>팀 프로젝트 현황</caption><thead><tr>${columns.map(([key, label]) => `<th scope="col">${sortable ? `<button type="button" data-sort="${key}">${label}<svg class="dp-sort-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 12V4m-2 2 2-2 2 2m4-2v8m-2-2 2 2 2-2"/></svg></button>` : label}</th>`).join("")}</tr></thead><tbody>${projects.map(({ name, members, progress }) => `<tr data-name="${name}" data-members="${members}" data-progress="${progress}"><th scope="row">${name}</th><td>${members}명</td><td>${progress}%</td></tr>`).join("")}</tbody></table></div><p class="dp-table-hint sample-muted">좌우로 스크롤해 모든 열을 확인하세요.</p></div>`;
  }
  register(
    "data-patterns",
    "데이터와 복합 입력",
    "정보를 읽고, 좁히고, 단계적으로 완성합니다.",
    [
      {
        title: "데이터와 폼",
        desc: "작동하는 복합 패턴.",
        components: [
          d({
            id: "data-table",
            title: "데이터 표",
            term: "Data Table",
            level: "basic",
            desc: "행과 열의 관계를 명확하게 읽고, 좁은 화면에서는 표 안에서 스크롤합니다.",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/table",
            html: table(),
          }),
          d({
            id: "data-sort-table",
            title: "정렬 가능한 표",
            term: "Sortable Table",
            level: "advanced",
            desc: "열 제목으로 이름·참여자·진행률을 오름차순과 내림차순으로 정렬합니다.",
            reference:
              "https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/",
            behavior: "dataSortTable",
            html: `${table(true)}<p class="sample-status" data-status role="status">열 제목을 눌러 정렬하세요.</p>`,
          }),
          d({
            id: "data-tree",
            title: "계층 탐색",
            term: "Hierarchical Disclosure List",
            level: "advanced",
            desc: "폴더를 펼쳐 자료를 선택하면 상세 내용이 바뀝니다. 네이티브 접이식 목록입니다.",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details",
            behavior: "dataTree",
            html: `<div class="dp-hierarchy"><details open><summary>Design System <span>2개</span></summary><ul><li><button type="button" data-document="색상 토큰" data-description="배경·텍스트·액션에 사용되는 의미 기반 색상입니다." aria-pressed="true">색상 토큰</button></li><li><button type="button" data-document="타이포그래피" data-description="제목과 본문의 읽기 흐름을 만드는 글자 크기와 간격입니다." aria-pressed="false">타이포그래피</button></li></ul></details><details><summary>제품 가이드 <span>1개</span></summary><ul><li><button type="button" data-document="온보딩" data-description="처음 방문한 사용자가 핵심 기능을 발견하는 흐름입니다." aria-pressed="false">온보딩</button></li></ul></details></div><section class="sample-panel" aria-live="polite"><h3 data-detail-title>색상 토큰</h3><p data-detail-description>배경·텍스트·액션에 사용되는 의미 기반 색상입니다.</p></section>`,
          }),
          d({
            id: "form-field-group",
            title: "연관 입력 그룹",
            term: "Fieldset / Field Group",
            level: "basic",
            desc: "연관된 연락처 입력을 묶고 작성한 내용을 함께 확인합니다.",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset",
            behavior: "dataFieldGroup",
            html: `<fieldset class="dp-fieldset sample-stack"><legend>연락처 정보</legend><label class="ui-form-group">이름<input class="ui-input" name="name" autocomplete="name" value="김민서"></label><label class="ui-form-group">이메일<input class="ui-input" type="email" name="email" autocomplete="email" value="minseo@example.com"></label></fieldset><output class="sample-panel" data-preview aria-live="polite">김민서 · minseo@example.com</output>`,
          }),
          d({
            id: "input-combobox",
            title: "검색 선택 입력",
            term: "Editable Combobox",
            level: "advanced",
            desc: "검색어로 선택지를 좁힙니다. 방향키로 이동하고 Enter로 선택합니다.",
            reference: "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/",
            behavior: "dataCombobox",
            html: `<div class="dp-combobox"><label class="ui-form-group">협업 도구<input class="ui-input" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="data-tool-options" autocomplete="off" placeholder="도구 이름 검색"></label><ul class="dp-options" id="data-tool-options" role="listbox" aria-label="협업 도구" hidden>${["Figma", "Framer", "Notion", "Sketch"].map((name, index) => `<li role="option" id="data-tool-${index}" aria-selected="false" data-option="${name}">${name}</li>`).join("")}</ul><p class="sample-muted" data-empty hidden>일치하는 도구가 없습니다.</p></div><p class="sample-status" data-status role="status">도구를 검색하고 선택하세요.</p>`,
          }),
          d({
            id: "form-stepper",
            title: "단계별 신청",
            term: "Multi-step Form / Wizard",
            level: "advanced",
            desc: "입력 검증 후 다음 단계로 이동하고, 검토 후 신청을 완료합니다.",
            reference: "https://www.w3.org/WAI/tutorials/forms/multi-page/",
            behavior: "dataFormStepper",
            html: `<form class="sample-stack" novalidate><ol class="dp-steps" aria-label="신청 단계"><li aria-current="step">1. 연락처</li><li>2. 플랜</li><li>3. 검토</li></ol><section data-form-step="0" class="sample-stack"><h3 tabindex="-1">연락처 입력</h3><label class="ui-form-group">이름<input class="ui-input" name="name" required autocomplete="name" placeholder="이름 입력"></label><label class="ui-form-group">이메일<input class="ui-input" name="email" type="email" required autocomplete="email" placeholder="name@example.com"></label></section><section data-form-step="1" class="sample-stack" hidden><h3 tabindex="-1">플랜 선택</h3><label class="ui-form-group">사용할 플랜<select name="plan" class="ui-select"><option>Personal</option><option>Team</option></select></label><p class="sample-muted">Personal은 개인 작업, Team은 공동 작업에 적합합니다.</p></section><section data-form-step="2" class="sample-stack" hidden><h3 tabindex="-1">신청 내용 검토</h3><p class="sample-panel" data-review></p></section><div class="sample-row"><button type="button" class="ui-btn ui-btn-secondary" data-form-back hidden>이전</button><button class="ui-btn ui-btn-primary" data-form-next>다음</button><button type="button" class="ui-btn ui-btn-secondary" data-form-reset hidden>다시 신청</button></div><p class="sample-status" data-status role="status"></p></form>`,
          }),
        ],
      },
    ],
  );
})();

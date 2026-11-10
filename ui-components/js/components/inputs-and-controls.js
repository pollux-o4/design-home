(function () {
  const { define: d, register } = window.CanvasSamples;
  register(
    "inputs-and-controls",
    "입력과 선택 컨트롤",
    "입력부터 피드백까지 자연스럽게 이어지는 폼.",
    [
      {
        title: "입력",
        desc: "명확한 레이블과 즉각적인 피드백.",
        components: [
          d({
            id: "text-input",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/text",
            title: "텍스트 입력",
            term: "Text Field",
            desc: "한 줄의 정보를 입력합니다.",
            html: `<label class="ui-form-group">사용자 이메일<input type="email" class="ui-input" placeholder="name@company.com" autocomplete="email"></label>`,
          }),
          d({
            id: "textarea",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea",
            title: "여러 줄 입력",
            term: "Text Area",
            desc: "충분한 공간에서 의견을 작성합니다.",
            html: `<label class="ui-form-group">상세 피드백<textarea class="ui-textarea" placeholder="어떤 점을 개선하면 좋을까요?"></textarea></label>`,
          }),
          d({
            id: "stepper",
            reference: "https://developer.apple.com/design/human-interface-guidelines/steppers",
            title: "수량 조절",
            term: "Stepper",
            desc: "1부터 99까지. 최소값에서는 감소 버튼을 비활성화합니다.",
            behavior: "stepper",
            html: `<div class="ui-stepper" role="group" aria-label="수량"><button class="ui-stepper-btn" data-step="-1" aria-label="수량 감소">−</button><output class="ui-stepper-value" aria-live="polite">1</output><button class="ui-stepper-btn" data-step="1" aria-label="수량 증가">+</button></div>`,
          }),
          d({
            id: "slider-range",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/range",
            title: "범위 슬라이더",
            term: "Range Slider",
            desc: "키보드 방향키로도 미세하게 조절합니다.",
            behavior: "range",
            html: `<label class="ui-form-group"><span class="sample-between">불투명도<output>80%</output></span><input type="range" min="0" max="100" value="80" aria-label="불투명도"></label>`,
          }),
          d({
            id: "date-picker",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/datetime-local",
            title: "날짜와 시간",
            term: "Date / Time Picker",
            desc: "운영체제의 익숙한 날짜 선택기를 사용합니다.",
            behavior: "datetime",
            html: `<label class="ui-form-group">배포 예약 일시<input type="datetime-local" class="ui-input" value="2026-10-12T12:00"></label><p class="sample-status" data-status role="status">일시를 선택하세요.</p>`,
          }),
          d({
            id: "file-uploader",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file",
            title: "파일 선택",
            term: "File Input / Dropzone",
            desc: "클릭·키보드·드롭을 지원합니다. 서버 전송 없이 선택을 시연합니다.",
            behavior: "upload",
            html: `<div class="upload-zone" data-drop-zone><label class="ui-form-group">파일 선택<input type="file" class="ui-input"></label><p class="sample-muted">파일을 이곳에 드롭해도 됩니다.</p></div><p class="sample-filename" data-filename>선택한 파일이 없습니다.</p><button class="ui-btn ui-btn-secondary" data-reset-file hidden>선택 취소</button><p class="sample-status" data-status role="status"></p>`,
          }),
          d({
            id: "form-validation",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation",
            title: "폼 검증",
            term: "Form Validation",
            desc: "입력 오류와 성공 상태를 같은 자리에서 안내합니다.",
            behavior: "validation",
            html: `<form class="sample-stack" novalidate><label class="ui-form-group">이메일<input type="email" class="ui-input" required aria-describedby="validation-feedback" placeholder="name@company.com" autocomplete="email"></label><button class="ui-btn ui-btn-primary">저장</button><p id="validation-feedback" class="sample-status" data-status role="status"></p></form>`,
          }),
          d({
            id: "password-field",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/password",
            title: "비밀번호 표시",
            term: "Password Field",
            desc: "값과 포커스를 유지하며 표시 여부를 전환합니다.",
            behavior: "password",
            html: `<label class="ui-form-group">비밀번호<input type="password" class="ui-input" autocomplete="new-password" placeholder="비밀번호 입력"></label><button class="ui-btn ui-btn-secondary" aria-pressed="false">표시</button>`,
          }),
        ],
      },
      {
        title: "선택",
        desc: "상태가 분명한 선택과 전환.",
        components: [
          d({
            id: "checkbox",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/checkbox",
            title: "체크박스",
            term: "Checkbox",
            desc: "여러 옵션을 독립적으로 선택합니다.",
            html: `<div class="sample-stack"><label class="ui-checkbox-label"><input type="checkbox" class="ui-checkbox" checked>이메일 수신 동의</label><label class="ui-checkbox-label"><input type="checkbox" class="ui-checkbox">마케팅 정보 동의</label></div>`,
          }),
          d({
            id: "radio",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/radio",
            title: "라디오 버튼",
            term: "Radio Button",
            desc: "그룹에서 하나의 옵션만 선택합니다.",
            html: `<fieldset class="sample-stack"><legend>직무 선택</legend><label class="ui-radio-label"><input type="radio" name="sample-role" class="ui-radio" checked>개발자</label><label class="ui-radio-label"><input type="radio" name="sample-role" class="ui-radio">디자이너</label></fieldset>`,
          }),
          d({
            id: "dropdown-select",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select",
            title: "선택 드롭다운",
            term: "Select / Dropdown",
            desc: "키보드와 모바일에서도 익숙한 네이티브 선택기.",
            html: `<label class="ui-form-group">권한 등급<select class="ui-select"><option>Administrator (관리자)</option><option selected>Editor (편집자)</option><option>Viewer (열람자)</option></select></label>`,
          }),
          d({
            id: "toggle-switch",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/switch_role",
            title: "토글 스위치",
            term: "Switch / Toggle",
            desc: "설정의 켜짐과 꺼짐을 즉시 반영합니다.",
            behavior: "toggle",
            html: `<label class="sample-row"><span class="ui-toggle"><input type="checkbox" role="switch" checked><span class="ui-toggle-slider"></span></span>알림 받기</label><p class="sample-status" data-status role="status">알림이 켜졌습니다.</p>`,
          }),
          d({
            id: "segmented-control",
            reference:
              "https://developer.apple.com/design/human-interface-guidelines/segmented-controls",
            title: "분할 선택",
            term: "Segmented Control",
            desc: "연관된 보기 옵션을 하나의 컨트롤로 묶습니다.",
            behavior: "selection",
            html: `<div class="ui-segmented" role="group" aria-label="결제 주기"><button data-choice class="active" data-content="매월 12,000원 · 언제든 해지 가능">월간</button><button data-choice data-content="연간 120,000원 · 두 달 무료">연간</button></div><p class="sample-panel" data-panel></p>`,
          }),
          d({
            id: "chip-tag",
            reference: "https://developer.apple.com/design/human-interface-guidelines/token-fields",
            title: "필터 태그",
            term: "Chip / Tag",
            desc: "삭제 후 모든 필터를 다시 복원할 수 있습니다.",
            behavior: "chips",
            html: `<div class="sample-row" data-chips>${["React", "TypeScript", "Design"].map((label) => `<span class="ui-chip"><span>${label}</span><button data-remove aria-label="${label} 필터 삭제">×</button></span>`).join("")}</div><button class="ui-btn ui-btn-secondary" data-add-chip>필터 복원</button><p class="sample-status" data-status role="status"></p>`,
          }),
          d({
            id: "accordion",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details",
            title: "접이식 영역",
            term: "Accordion",
            desc: "필요할 때 상세 내용을 펼칩니다.",
            html: `<details class="ui-disclosure"><summary>서비스 아키텍처 상세 보기</summary><p>작은 모듈이 명확한 책임을 가집니다. 상태와 스타일은 각각 한 곳에서 관리합니다.</p></details>`,
          }),
          d({
            id: "searchable-list",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/search",
            title: "검색 가능한 목록",
            term: "Searchable List",
            desc: "결과 개수와 빈 상태를 바로 안내합니다.",
            behavior: "searchable",
            html: `<label class="ui-form-group">프로젝트 검색<input type="search" class="ui-input" placeholder="검색어 입력"></label><ul class="sample-list">${["Design System", "Mobile App", "Landing Page"].map((title) => `<li data-result>${title}</li>`).join("")}</ul><p class="sample-status" data-status role="status">3개의 결과</p>`,
          }),
        ],
      },
    ],
  );
})();

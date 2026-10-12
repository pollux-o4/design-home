(function () {
  const { define: d, icon: i, register } = CanvasSamples;
  register(
    "states-and-feedback",
    "상태와 피드백",
    "진행 상황과 결과를 이해하기 쉬운 언어로.",
    [
      {
        title: "진행과 복구",
        desc: "기다리는 동안에도 다음 행동이 분명합니다.",
        components: [
          d({
            id: "skeleton-ui",
            reference:
              "https://developer.apple.com/design/human-interface-guidelines/progress-indicators",
            title: "스켈레톤",
            term: "Skeleton UI",
            desc: "콘텐츠의 형태를 먼저 보여줍니다.",
            html: `<div class="sample-row" role="status" aria-label="프로필 불러오는 중"><div class="ui-skeleton ui-skeleton-circle" aria-hidden="true"></div><div class="skeleton-lines" aria-hidden="true"><div class="ui-skeleton ui-skeleton-text"></div><div class="ui-skeleton ui-skeleton-text"></div></div></div>`,
          }),
          d({
            id: "spinner",
            reference:
              "https://developer.apple.com/design/human-interface-guidelines/progress-indicators",
            title: "스피너",
            term: "Loading Spinner",
            desc: "처리 중임을 텍스트와 함께 표시합니다.",
            html: `<div class="sample-row" role="status"><span class="ui-spinner" aria-hidden="true"></span><span class="sample-muted">데이터 동기화 중…</span></div>`,
          }),
          d({
            id: "progress-bar",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress",
            title: "진행률",
            term: "Progress Bar",
            desc: "실행부터 완료까지 상태를 시연합니다.",
            behavior: "progress",
            html: `<div class="sample-between"><span>업로드 진행률</span><output>0%</output></div><progress class="sample-progress" max="100" value="0" aria-label="업로드 진행률"></progress><button class="ui-btn ui-btn-secondary">실행</button><p class="sample-status" data-status role="status"></p>`,
          }),
          d({
            id: "empty-state",
            reference:
              "https://developer.apple.com/design/human-interface-guidelines/feedback",
            title: "빈 상태",
            term: "Empty State",
            desc: "다음 행동을 제안하고 결과를 바로 표시합니다.",
            behavior: "empty",
            html: `<div class="ui-empty-state">${i("library")}<h3 data-empty-title>아직 리포트가 없습니다.</h3><p class="sample-muted" data-empty-desc>첫 번째 리포트를 만들어보세요.</p><button class="ui-btn ui-btn-primary">리포트 만들기</button></div>`,
          }),
          d({
            id: "error-retry",
            reference:
              "https://developer.apple.com/design/human-interface-guidelines/feedback",
            title: "오류와 재시도",
            term: "Error State / Retry",
            desc: "첫 시도는 실패, 다음 시도는 성공하는 복구 시나리오.",
            behavior: "retry",
            html: `<div class="sample-callout">${i("info")}<span>데이터 연결을 확인해주세요.</span></div><p class="sample-status" data-status role="status">일시적으로 연결할 수 없습니다.</p><button class="ui-btn ui-btn-secondary">다시 시도</button>`,
          }),
        ],
      },
      {
        title: "정보와 상태",
        desc: "의미 있는 색상과 명확한 텍스트.",
        components: [
          d({
            id: "alert-banner",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alert_role",
            title: "안내 배너",
            term: "Callout / Alert Banner",
            desc: "색상에만 의존하지 않는 중요한 안내.",
            html: `<aside class="sample-callout" role="note">${i("info")}<div><strong>정기 점검 안내</strong><p>매주 일요일 02:00~04:00에 일부 기능이 제한됩니다.</p></div></aside>`,
          }),
          d({
            id: "tooltip",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/tooltip_role",
            title: "도움말 툴팁",
            term: "Tooltip",
            desc: "마우스 호버와 키보드 포커스 모두에서 표시됩니다.",
            html: `<div class="ui-tooltip-wrapper"><button class="ui-btn ui-btn-secondary" aria-describedby="security-tip">${i("info")}보안 정보</button><div class="ui-tooltip-text" id="security-tip" role="tooltip">전송 데이터는 암호화됩니다.</div></div>`,
          }),
          d({
            id: "badge",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/span",
            title: "상태 배지",
            term: "Status Badge",
            desc: "읽기 쉬운 대비로 짧은 상태를 전달합니다.",
            html: `<div class="sample-row"><span class="ui-badge ui-badge-success">활성</span><span class="ui-badge ui-badge-warning">검토 중</span><span class="ui-badge ui-badge-info">대기</span></div>`,
          }),
          d({
            id: "avatar",
            reference:
              "https://developer.apple.com/design/human-interface-guidelines/images",
            title: "프로필 아바타",
            term: "Avatar",
            desc: "이니셜과 텍스트로 접속 상태를 표시합니다.",
            html: `<div class="sample-row"><span class="sample-avatar" aria-hidden="true">DH<span class="avatar-dot"></span></span><div><strong>Design Team</strong><p class="sample-muted">온라인</p></div></div>`,
          }),
        ],
      },
    ],
  );
})();

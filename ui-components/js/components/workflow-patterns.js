(function () {
  const { define, register } = window.CanvasSamples;
  const status = '<p class="sample-status" data-status role="status"></p>';
  const button = (action, label) =>
    `<button class="ui-btn" data-action="${action}">${label}</button>`;
  const shell = (content) => `<div class="workflow-panel">${content}</div>${status}`;
  const sample = (definition) => define({ ...definition, html: shell(definition.html) });
  register("workflow-patterns", "작업과 상태", "사용자의 작업을 실제 상태 변화와 연결합니다.", [
    {
      title: "작업 흐름",
      desc: "편집, 일괄 작업, 저장과 회복.",
      components: [
        sample({
          id: "interaction-inline-edit",
          title: "바로 편집",
          term: "Inline Editing",
          desc: "읽던 자리에서 이름을 수정하고 저장하거나 취소합니다.",
          level: "basic",
          behavior: "inlineEdit",
          html: `<div class="workflow-heading"><div><small>PROJECT</small><strong data-name>새로운 디자인</strong></div>${button("edit", "편집")}</div><form hidden data-editor><label class="ui-form-group">프로젝트 이름<input class="ui-input" required maxlength="40" value="새로운 디자인"></label><div class="sample-row"><button class="ui-btn" type="submit">저장</button><button class="ui-btn" type="button" data-action="cancel">취소</button></div></form>`,
          reference: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form",
        }),
        sample({
          id: "interaction-bulk-select",
          title: "일괄 선택과 실행",
          term: "Bulk Selection / Batch Actions",
          desc: "여러 항목을 선택해 보관하고 작업을 되돌립니다.",
          level: "advanced",
          behavior: "bulkSelect",
          html: `<label class="ui-checkbox-label"><input class="ui-checkbox" type="checkbox" data-all>모두 선택</label><div class="workflow-list">${["브랜드 가이드", "제품 화면", "아이콘 모음"].map((name, index) => `<label class="workflow-item"><input class="ui-checkbox" type="checkbox" data-item="${index}"><span>${name}</span></label>`).join("")}</div><div class="sample-row">${button("archive", "선택 보관")}${button("undo", "되돌리기")}</div>`,
          reference: "https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/",
        }),
        sample({
          id: "interaction-command-palette",
          title: "빠른 명령",
          term: "Command Palette",
          desc: "검색과 방향키로 필요한 작업을 바로 실행합니다.",
          level: "advanced",
          behavior: "commandPalette",
          html: `<div class="workflow-heading"><div><small>WORKSPACE</small><strong data-command-result>개요</strong></div>${button("open", "명령 열기")}</div><p class="workflow-command-content" data-command-content>프로젝트 개요에서 작업을 시작하세요.</p><dialog class="workflow-dialog" aria-label="빠른 명령"><form method="dialog" class="workflow-heading"><strong>빠른 명령</strong><button class="ui-btn" aria-label="명령 닫기">닫기</button></form><label class="ui-form-group">명령 검색<input class="ui-input" type="search" placeholder="프로젝트, 활동, 설정"></label><div data-commands class="workflow-list" role="group" aria-label="명령 결과"></div><p class="sample-muted">방향키로 선택 · Enter로 실행</p></dialog>`,
          reference: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog",
        }),
        sample({
          id: "feedback-task-steps",
          title: "단계별 작업 진행",
          term: "Multi-step Task Progress",
          desc: "준비부터 완료까지 진행을 확인하고 중단한 작업을 다시 시작합니다.",
          level: "basic",
          behavior: "taskSteps",
          html: `<ol class="workflow-steps"><li>파일 준비</li><li>형식 검사</li><li>결과 생성</li></ol><progress max="3" value="0" aria-label="작업 진행"></progress><div class="sample-row">${button("start", "작업 시작")}${button("cancel", "취소")}</div>`,
          reference: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress",
        }),
        sample({
          id: "feedback-connection",
          title: "연결 상태와 대기",
          term: "Offline / Connection State",
          desc: "오프라인에서는 작업을 대기열에 넣고 연결 후 저장합니다.",
          level: "basic",
          behavior: "connectionState",
          html: `<label class="ui-form-group">연결 시뮬레이션<select class="ui-select"><option value="online">온라인</option><option value="offline">오프라인</option></select></label><div class="workflow-heading"><span>프로젝트 변경 사항</span><strong data-connection>연결됨</strong></div><div class="sample-row">${button("save", "저장")}${button("queue", "대기열에 추가")}</div>`,
          reference: "https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine",
        }),
        sample({
          id: "feedback-optimistic",
          title: "먼저 반영하고 회복",
          term: "Optimistic UI / Rollback",
          desc: "즐겨찾기를 즉시 반영하고 저장 실패 시 이전 상태로 돌립니다.",
          level: "advanced",
          behavior: "optimisticSave",
          html: `<label class="ui-form-group">다음 저장 결과<select class="ui-select"><option value="failure">실패 시뮬레이션</option><option value="success">성공 시뮬레이션</option></select></label><div class="workflow-heading"><div><small>COLLECTION</small><strong>영감을 주는 디자인</strong></div><button class="ui-btn" data-action="favorite" aria-pressed="false">즐겨찾기</button></div>${button("retry", "다시 시도")}`,
          reference: "https://developer.apple.com/design/human-interface-guidelines/feedback",
        }),
        sample({
          id: "feedback-notification-center",
          title: "알림 모아보기",
          term: "Notification Center",
          desc: "읽지 않은 알림을 확인하고 지운 알림을 복구합니다.",
          level: "advanced",
          behavior: "notificationCenter",
          html: `<div class="workflow-heading"><strong data-count>읽지 않음 2</strong><label class="ui-checkbox-label"><input class="ui-checkbox" type="checkbox" data-unread>읽지 않음만</label></div><div class="workflow-list" data-notifications></div>${button("restore", "삭제 복구")}`,
          reference: "https://developer.apple.com/design/human-interface-guidelines/notifications",
        }),
        sample({
          id: "feedback-autosave",
          title: "자동 저장과 복구",
          term: "Autosave / Dirty State",
          desc: "입력이 끝나면 변경 사항을 저장하고 실패한 내용을 다시 저장합니다.",
          level: "advanced",
          behavior: "autosave",
          html: `<label class="ui-form-group">프로젝트 메모<textarea class="ui-textarea" data-note>새로운 아이디어를 기록하세요.</textarea></label><label class="ui-form-group">저장 결과<select class="ui-select"><option value="success">성공 시뮬레이션</option><option value="failure">실패 시뮬레이션</option></select></label>${button("retry", "저장 재시도")}<p class="sample-muted">이 카드 안에서만 저장을 시뮬레이션합니다.</p>`,
          reference: "https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout",
        }),
      ],
    },
  ]);
})();

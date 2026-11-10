(function () {
  const { define: d, icon: i, register } = window.CanvasSamples;
  const close = `<button type="submit" value="cancel" formnovalidate class="ui-btn ui-btn-secondary">취소</button>`;
  register(
    "popups-and-layers",
    "팝업과 레이어",
    "중요한 결정에는 집중을, 짧은 피드백에는 가벼움을.",
    [
      {
        title: "대화상자",
        desc: "포커스·Escape·배경 차단을 지원하는 네이티브 대화상자.",
        components: [
          d({
            id: "modal",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog",
            title: "모달",
            term: "Modal Dialog",
            desc: "프로젝트 생성과 입력 검증을 시연합니다.",
            behavior: "dialog",
            html: `<button class="ui-btn ui-btn-primary" data-open-dialog>${i("grid")}프로젝트 만들기</button><dialog class="sample-dialog" id="demo-modal" aria-labelledby="project-title"><form method="dialog" class="sample-stack"><h2 id="project-title">새 프로젝트</h2><p class="sample-muted">첫 번째 아이디어를 시작해보세요.</p><label class="ui-form-group">프로젝트 이름<input class="ui-input" name="project" placeholder="프로젝트 이름" required autofocus></label><div class="sample-actions">${close}<button value="create" class="ui-btn ui-btn-primary">생성</button></div></form></dialog>`,
          }),
          d({
            id: "confirm",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog",
            title: "확인과 취소",
            term: "Confirmation Dialog",
            desc: "되돌리기 어려운 결정을 명확하게 확인합니다.",
            behavior: "dialog",
            html: `<button class="ui-btn ui-btn-secondary" data-open-dialog>${i("trash")}항목 삭제</button><dialog class="sample-dialog" aria-labelledby="delete-title"><form method="dialog" class="sample-stack"><h2 id="delete-title">항목을 삭제할까요?</h2><p class="sample-muted">이 작업은 되돌릴 수 없습니다.</p><div class="sample-actions">${close}<button value="delete" class="ui-btn ui-btn-danger">삭제</button></div></form></dialog>`,
          }),
          d({
            id: "alert",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog",
            title: "안내 대화상자",
            term: "Alert Dialog",
            desc: "중요한 정보에 잠시 집중하도록 안내합니다.",
            behavior: "dialog",
            html: `<button class="ui-btn ui-btn-secondary" data-open-dialog>${i("info")}권한 안내</button><dialog class="sample-dialog" aria-labelledby="permission-title"><form method="dialog" class="sample-stack"><h2 id="permission-title">접근 권한이 필요합니다.</h2><p class="sample-muted">관리자에게 권한을 요청해주세요.</p><div class="sample-actions"><button value="ok" class="ui-btn ui-btn-primary">확인</button></div></form></dialog>`,
          }),
        ],
      },
      {
        title: "가벼운 피드백",
        desc: "현재 맥락을 유지하면서 결과를 알려줍니다.",
        components: [
          d({
            id: "toast",
            reference:
              "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role",
            title: "토스트",
            term: "Toast Notification",
            desc: "성공·오류 안내를 읽고 닫을 수 있습니다.",
            behavior: "toast",
            html: `<div class="sample-row"><button class="ui-btn ui-btn-primary" data-notify="정보가 저장되었습니다.">성공 알림</button><button class="ui-btn ui-btn-secondary" data-notify="저장할 수 없습니다. 다시 시도해주세요." data-kind="error">오류 알림</button></div>`,
          }),
          d({
            id: "snackbar",
            reference: "https://developer.apple.com/design/human-interface-guidelines/feedback",
            title: "실행 취소 알림",
            term: "Snackbar / Undo",
            desc: "삭제된 항목을 실제로 복원합니다.",
            behavior: "snackbar",
            html: `<div class="sample-panel" data-undo-item>Design System 프로젝트</div><button class="ui-btn ui-btn-secondary" data-delete>${i("trash")}프로젝트 삭제</button><p class="sample-status" data-status role="status"></p>`,
          }),
          d({
            id: "drawer",
            reference: "https://developer.apple.com/design/human-interface-guidelines/sheets",
            title: "드로어와 바텀 시트",
            term: "Drawer / Bottom Sheet",
            desc: "데스크톱에서는 우측, 모바일에서는 하단에서 설정을 엽니다.",
            behavior: "dialog",
            html: `<button class="ui-btn ui-btn-secondary" data-open-dialog>${i("settings")}표시 설정</button><dialog class="sample-dialog sample-drawer" aria-labelledby="drawer-title"><form method="dialog" class="sample-stack"><h2 id="drawer-title">표시 설정</h2><label class="ui-form-group">기본 보기<select class="ui-select"><option>목록</option><option>그리드</option></select></label><label class="ui-checkbox-label"><input type="checkbox" class="ui-checkbox" checked>변경 사항 자동 저장</label><div class="sample-actions">${close}<button value="save" class="ui-btn ui-btn-primary">저장</button></div></form></dialog>`,
          }),
          d({
            id: "popover",
            reference: "https://developer.mozilla.org/en-US/docs/Web/API/Popover_API",
            title: "팝오버",
            term: "Popover",
            desc: "바깥 클릭과 Escape로 닫히는 부가 정보.",
            behavior: "popover",
            html: `<button class="ui-btn ui-btn-secondary" popovertarget="profile-popover">프로필 정보</button><div id="profile-popover" popover class="sample-popover"><strong>Design Team</strong><p class="sample-muted">프로젝트 관리자 · 온라인</p><button class="ui-btn ui-btn-secondary" popovertarget="profile-popover" popovertargetaction="hide">닫기</button></div>`,
          }),
        ],
      },
    ],
  );
})();

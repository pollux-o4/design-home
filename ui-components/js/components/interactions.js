(function () {
  const { define: d, icon: i, register } = window.CanvasSamples;
  register("interactions", "움직임과 반응", "조작에는 분명한 반응. 움직임에는 절제.", [
    {
      title: "상태와 반응",
      desc: "키보드·터치·포인터에서 같은 경험.",
      components: [
        d({
          id: "hover-focus-active",
          reference: "https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes",
          title: "호버·포커스·눌림",
          term: "Hover / Focus / Active States",
          desc: "포커스는 명확하고, 눌림은 가볍게 반응합니다.",
          html: `<div class="sample-stack"><button class="ui-btn ui-btn-primary">눌러보세요</button><label class="ui-form-group">포커스 테스트<input class="ui-input" placeholder="Tab 키로 이동해보세요."></label></div>`,
        }),
        d({
          id: "disabled-state",
          reference:
            "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/disabled",
          title: "비활성화 상태",
          term: "Disabled State",
          desc: "조작할 수 없는 이유를 함께 안내합니다.",
          html: `<div class="sample-stack"><button class="ui-btn ui-btn-primary" disabled>저장할 수 없음</button><label class="ui-form-group">읽기 전용 설정<input class="ui-input" value="관리자 권한 필요" disabled></label><p class="sample-muted">관리자에게 편집 권한을 요청해주세요.</p></div>`,
        }),
        d({
          id: "micro-interaction",
          reference:
            "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-pressed",
          title: "좋아요",
          term: "Like Button / Micro-interaction",
          desc: "선택 상태와 카운트가 함께 갱신됩니다.",
          behavior: "like",
          html: `<div class="sample-row"><button class="ui-heart-btn" data-like aria-label="좋아요" aria-pressed="false">${i("heart")}</button><output aria-label="좋아요 수">1,240</output></div><p class="sample-status" data-status role="status"></p>`,
        }),
      ],
    },
    {
      title: "순서 변경",
      desc: "드래그가 어려운 환경에서도 조작할 수 있습니다.",
      components: [
        d({
          id: "drag-drop-reorder",
          reference: "https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API",
          title: "드래그와 순서 변경",
          term: "Drag and Drop / Reorder",
          desc: "드래그 또는 위·아래 버튼. Alt + 방향키도 지원합니다.",
          behavior: "reorder",
          html: `<div class="ui-drag-list" role="list" aria-label="작업 순서">${["디자인 시스템", "모듈 분리", "접근성 검증"].map((title, index) => `<div class="ui-drag-item" role="listitem" draggable="true" tabindex="0" data-item="${index}" aria-label="${title}, Alt와 방향키로 순서 변경"><span data-title>${title}</span><div class="sample-row"><button data-move="up" aria-label="${title} 위로">↑</button><button data-move="down" aria-label="${title} 아래로">↓</button></div></div>`).join("")}</div><p class="sample-status" data-status role="status"></p>`,
        }),
      ],
    },
  ]);
})();

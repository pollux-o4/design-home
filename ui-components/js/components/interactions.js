/* ==========================================================================
   Component Artboard 5: Interactions
   ========================================================================== */

(function(window) {
  window.ComponentModules = window.ComponentModules || {};

  window.ComponentModules['interactions'] = {
    id: 'interactions',
    title: 'interactions (움직임과 반응)',
    tag: 'Interactions & Motion',
    desc: '사용자 행위에 즉각 반응하는 미세 모션 및 드래그 앤 드롭 인터랙션 모음',
    groups: [
      {
        title: 'State Responses & Motion (상태 반응 및 모션 계층)',
        desc: '사용자의 마우스 호버, 클릭, 비활성화 상태 및 감성 모션 반응 모음입니다.',
        components: [
          {
            id: 'hover-focus-active',
            title: 'Hover / Focus / Active',
            desc: '마우스 올라감, 포커스, 클릭 중의 시각적 상태 변화',
            render: function() {
              return `
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                  <button class="ui-btn ui-btn-primary">Hover / Active 테스트</button>
                  <input class="ui-input" placeholder="Focus 테스트" style="width:160px;" />
                </div>
              `;
            },
            code: `<button class="ui-btn ui-btn-primary">Button</button>`
          },
          {
            id: 'disabled-state',
            title: 'Disabled State',
            desc: '권한 부족이나 미충족 조건 시 조작을 금지하는 비활성화 상태',
            render: function() {
              return `
                <div style="display:flex; gap:10px; align-items:center;">
                  <button class="ui-btn ui-btn-primary ui-btn-disabled" disabled>비활성화 버튼</button>
                  <input class="ui-input" value="입력 불가" disabled style="width:140px; opacity:0.5; cursor:not-allowed;" />
                </div>
              `;
            },
            code: `<button class="ui-btn ui-btn-primary" disabled>Disabled</button>`
          },
          {
            id: 'micro-interaction',
            title: 'Micro-interaction',
            desc: '좋아요, 카운팅 모션 등 감성적 즐거움을 제공하는 미세 반응',
            render: function() {
              return `
                <div style="display:flex; align-items:center; gap:20px;">
                  <button class="ui-heart-btn" onclick="
                    this.classList.toggle('liked');
                    showToast(this.classList.contains('liked') ? '❤️ 좋아요 반영!' : '🤍 좋아요 취소');
                  ">❤️</button>
                  
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:13px; color:#aaa;">조회수:</span>
                    <span id="counter-num" style="font-weight:700; color:#10b981; font-size:16px;">1,240</span>
                    <button class="ui-btn ui-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="
                      const c = document.getElementById('counter-num');
                      let val = parseInt(c.textContent.replace(',','')) + 1;
                      c.textContent = val.toLocaleString();
                    ">+1 증가</button>
                  </div>
                </div>
              `;
            },
            code: `<button class="ui-heart-btn">❤️</button>`
          }
        ]
      },
      {
        title: 'Drag & Drop Operations (드래그 조작 계층)',
        desc: '마우스 드래그를 통해 순서를 직관적으로 제어하는 인터랙션 모음입니다.',
        components: [
          {
            id: 'drag-drop-reorder',
            title: 'Drag & Drop / Reorder',
            desc: '요소를 드래그하여 순서를 변경하는 직접 조작 인터랙션',
            render: function() {
              return `
                <div class="ui-drag-list">
                  <div class="ui-drag-item" draggable="true">
                    <span>⋮⋮ 1. UI 디자인 시스템 가이드</span>
                    <span class="ui-badge ui-badge-info">High</span>
                  </div>
                  <div class="ui-drag-item" draggable="true">
                    <span>⋮⋮ 2. Figma Canvas 모듈 분리</span>
                    <span class="ui-badge ui-badge-success">Done</span>
                  </div>
                  <div class="ui-drag-item" draggable="true">
                    <span>⋮⋮ 3. 인터랙션 QA 검수</span>
                    <span class="ui-badge ui-badge-warning">Pending</span>
                  </div>
                </div>
              `;
            },
            code: `<div class="ui-drag-item" draggable="true">⋮⋮ Drag item</div>`
          }
        ]
      }
    ]
  };
})(window);

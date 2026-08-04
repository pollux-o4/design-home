/* ==========================================================================
   Component Artboard 1: Popups & Layers
   ========================================================================== */

(function(window) {
  window.ComponentModules = window.ComponentModules || {};

  // Global Modal Helper
  window.openDemoModal = function() {
    let modal = document.getElementById('demo-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'demo-modal';
      modal.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); z-index:99999; align-items:center; justify-content:center; padding:20px;';
      modal.innerHTML = `
        <div style="background:#1f2937; border:1px solid rgba(255,255,255,0.2); border-radius:14px; width:100%; max-width:440px; padding:28px; color:#fff; box-shadow:0 25px 50px rgba(0,0,0,0.7); animation: fadeIn 0.2s ease-out;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h3 style="font-size:18px; font-weight:700;">🚀 새 프로젝트 생성</h3>
            <button style="background:none; border:none; color:#aaa; font-size:20px; cursor:pointer;" onclick="closeDemoModal()">✕</button>
          </div>
          <p style="font-size:13px; color:#9ca3af; margin-bottom:20px; line-height:1.5;">원하시는 프로젝트 환경 설정을 입력하고 시작하세요.</p>
          <div class="ui-form-group" style="margin-bottom:16px;">
            <label class="ui-label">프로젝트 이름</label>
            <input class="ui-input" placeholder="my-awesome-app" id="demo-modal-input" />
          </div>
          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:24px;">
            <button class="ui-btn ui-btn-secondary" onclick="closeDemoModal()">취소</button>
            <button class="ui-btn ui-btn-primary" onclick="
              const val = document.getElementById('demo-modal-input').value || '새 프로젝트';
              closeDemoModal();
              showToast('🚀 ' + val + ' 프로젝트가 생성되었습니다!');
            ">생성하기</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
  };

  window.closeDemoModal = function() {
    const modal = document.getElementById('demo-modal');
    if (modal) modal.style.display = 'none';
  };

  // Global Drawer Helper
  window.openDemoDrawer = function() {
    let drawer = document.getElementById('demo-drawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'demo-drawer';
      drawer.style.cssText = 'position:fixed; top:0; right:0; width:360px; height:100vh; background:#18181c; border-left:1px solid #333; z-index:99999; transform:translateX(100%); transition:transform 0.3s cubic-bezier(0.16,1,0.3,1); padding:28px; color:#fff; box-shadow:-10px 0 30px rgba(0,0,0,0.6);';
      drawer.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid #333; padding-bottom:16px;">
          <h3 style="font-size:16px; font-weight:700;">⚙️ 상세 환경 설정 드로어</h3>
          <button style="background:none; border:none; color:#aaa; font-size:20px; cursor:pointer;" onclick="closeDemoDrawer()">✕</button>
        </div>
        <p style="font-size:13px; color:#aaa; margin-bottom:20px; line-height:1.5;">우측에서 슬라이딩되는 고급 드로어 패널 레이어입니다.</p>
        <div class="ui-form-group" style="margin-bottom:16px;">
          <label class="ui-label">시스템 테마</label>
          <select class="ui-select"><option>Dark Glass (권장)</option><option>Light Clean</option></select>
        </div>
        <div class="ui-form-group" style="margin-bottom:20px;">
          <label class="ui-label">자동 저장 간격</label>
          <select class="ui-select"><option>5분 마다</option><option>실시간</option></select>
        </div>
        <button class="ui-btn ui-btn-primary" style="width:100%;" onclick="closeDemoDrawer(); showToast('⚙️ 설정이 저장되었습니다.');">설정 완료</button>
      `;
      document.body.appendChild(drawer);
    }
    setTimeout(() => { drawer.style.transform = 'translateX(0)'; }, 10);
  };

  window.closeDemoDrawer = function() {
    const drawer = document.getElementById('demo-drawer');
    if (drawer) drawer.style.transform = 'translateX(100%)';
  };

  // Snackbar with Action helper
  window.showSnackbarWithAction = function(message, actionLabel, actionCallback) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const sb = document.createElement('div');
    sb.className = 'ui-toast';
    sb.style.background = '#111827';
    sb.style.border = '1px solid #4f46e5';
    sb.innerHTML = `
      <span>🗑️ ${message}</span>
      <button class="ui-btn ui-btn-primary" style="padding:4px 10px; font-size:11px; margin-left:auto;">${actionLabel}</button>
    `;

    const btn = sb.querySelector('button');
    btn.onclick = function() {
      if(actionCallback) actionCallback();
      sb.remove();
    };

    container.appendChild(sb);

    setTimeout(() => {
      if (sb.parentNode) {
        sb.style.opacity = '0';
        sb.style.transform = 'translateX(100%)';
        setTimeout(() => sb.remove(), 300);
      }
    }, 4500);
  };

  window.ComponentModules['popups-and-layers'] = {
    id: 'popups-and-layers',
    title: 'popups-and-layers (팝업과 레이어)',
    tag: 'Overlay & Layers',
    desc: '화면 위에 겹쳐서 뜨는 오버레이 및 대화상자 계층 모음',
    groups: [
      {
        title: 'Dialog (대화상자 계층)',
        desc: '사용자와의 소통/결정을 위해 화면 상단에 띄우는 팝업 창의 최상위 계층입니다.',
        components: [
          {
            id: 'modal',
            title: 'Modal (모달)',
            desc: '뒤쪽 메인 화면 조작을 차단(Block)하고 사용자의 의사결정을 강제하는 팝업',
            render: function() {
              return `
                <div>
                  <button class="ui-btn ui-btn-primary" onclick="openDemoModal()">
                    <span>🪟 모달 열기</span>
                  </button>
                </div>
              `;
            },
            code: `<div class="ui-modal-overlay">\n  <div class="ui-modal-content">\n    <h3>새 프로젝트 생성</h3>\n  </div>\n</div>`
          },
          {
            id: 'confirm',
            title: 'Confirm (컨펌)',
            desc: '삭제/확인 등 단일 실행 의사를 묻는 확인/취소 대화상자',
            render: function() {
              return `
                <div style="display: flex; gap: 10px; align-items: center;">
                  <button class="ui-btn ui-btn-secondary" onclick="
                    if(confirm('정말로 이 항목을 삭제하시겠습니까?')) {
                      showToast('✅ 삭제가 완료되었습니다.');
                    }
                  ">
                    <span>🗑️ Confirm 실행</span>
                  </button>
                </div>
              `;
            },
            code: `if(confirm('정말로 삭제하시겠습니까?')) {\n  // 실행 처리\n}`
          },
          {
            id: 'alert',
            title: 'Alert (경고창)',
            desc: '중요한 시스템 안내 및 위험 경고를 전달하는 단방향 대화상자',
            render: function() {
              return `
                <div style="display: flex; gap: 10px; align-items: center;">
                  <button class="ui-btn ui-btn-danger" onclick="alert('경고! 시스템 권한이 필요합니다.')">
                    <span>⚠️ Alert 실행</span>
                  </button>
                </div>
              `;
            },
            code: `<button class="ui-btn ui-btn-danger" onclick="alert('경고!')">Alert 실행</button>`
          }
        ]
      },
      {
        title: 'Non-Blocking Overlay & Floating Layers (비차단 오버레이 계층)',
        desc: '화면 조작을 막지 않고 정보나 서브 패널을 부가적으로 제공하는 레이어 모음입니다.',
        components: [
          {
            id: 'toast',
            title: 'Toast (토스트)',
            desc: '액션 버튼 없이 순수 읽기 전용 상태 안내문만 보여주고 자동 소멸하는 알림',
            render: function() {
              return `
                <div style="display: flex; gap: 8px;">
                  <button class="ui-btn ui-btn-primary" onclick="showToast('✅ 정보가 저장되었습니다.')">성공 토스트</button>
                  <button class="ui-btn ui-btn-danger" onclick="showToast('🚨 오류가 발생했습니다.')">오류 토스트</button>
                </div>
              `;
            },
            code: `showToast('✅ 성공 메시지 (Read-Only)');`
          },
          {
            id: 'snackbar',
            title: 'Snackbar (스낵바)',
            desc: '텍스트와 함께 사용자가 바로 취소할 수 있는 [실행 취소 (Undo)] 액션 버튼을 포함하는 알림',
            render: function() {
              return `
                <div>
                  <button class="ui-btn ui-btn-secondary" onclick="
                    showSnackbarWithAction('프로젝트 항목이 삭제되었습니다.', '실행 취소 (Undo)', function() {
                      showToast('↩️ 삭제가 취소되었습니다!');
                    });
                  ">
                    <span>💬 스낵바 실행 (Undo 버튼 포함)</span>
                  </button>
                </div>
              `;
            },
            code: `showSnackbarWithAction('항목이 삭제되었습니다.', 'Undo', function() {\n  // 실행 취소 처리\n});`
          },
          {
            id: 'drawer',
            title: 'Drawer / Bottom Sheet (슬라이드 드로어)',
            desc: '화면 우측 또는 하단에서 슬라이딩되어 상세 설정을 제공하는 서브 레이어',
            render: function() {
              return `
                <div>
                  <button class="ui-btn ui-btn-secondary" onclick="openDemoDrawer()">
                    <span>📑 드로어 열기</span>
                  </button>
                </div>
              `;
            },
            code: `<div class="ui-drawer">\n  <h3>상세 설정 드로어</h3>\n</div>`
          },
          {
            id: 'popover',
            title: 'Popover (팝오버)',
            desc: '특정 요소 근처에 밀착해서 부가 정보나 미니 메뉴를 보여주는 팝업 레이어',
            render: function() {
              return `
                <div style="position: relative; display: inline-block;">
                  <button class="ui-btn ui-btn-secondary" onclick="
                    const p = document.getElementById('demo-popover');
                    p.style.display = p.style.display === 'none' ? 'block' : 'none';
                  ">
                    <span>💬 Popover 열기</span>
                  </button>
                  
                  <div id="demo-popover" style="display:none; position:absolute; bottom:125%; left:50%; transform:translateX(-50%); width:220px; background:#242428; border:1px solid #444; border-radius:8px; padding:12px; color:#fff; font-size:12px; box-shadow:0 10px 25px rgba(0,0,0,0.6); z-index:100;">
                    <strong style="color:#6366f1;">프로필 빠른 정보</strong>
                    <p style="margin-top:4px; color:#bbb;">사용자의 최신 로그 및 상태를 빠르게 보여줍니다.</p>
                  </div>
                </div>
              `;
            },
            code: `<div class="ui-popover">\n  <strong>Popover Title</strong>\n</div>`
          }
        ]
      }
    ]
  };
})(window);

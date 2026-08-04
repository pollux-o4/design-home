/* ==========================================================================
   Component Artboard 3: States & Feedback
   ========================================================================== */

(function(window) {
  window.ComponentModules = window.ComponentModules || {};

  window.ComponentModules['states-and-feedback'] = {
    id: 'states-and-feedback',
    title: 'states-and-feedback (상태와 피드백)',
    tag: 'Status & Feedback',
    desc: '시스템 상태 및 실행 결과를 사용자에게 알리는 피드백 컴포넌트 모음',
    groups: [
      {
        title: 'Loading & System Status (로딩 및 진행 상태 계층)',
        desc: '비동기 데이터 수신 중이거나 처리 척도를 시각적으로 보여주는 상태 컴포넌트입니다.',
        components: [
          {
            id: 'skeleton-ui',
            title: 'Skeleton UI',
            desc: '데이터 로딩 완료 전 레이아웃 형태를 미리 보여주는 로딩 뼈대 UI',
            render: function() {
              return `
                <div style="display:flex; gap:14px; align-items:center; width:100%; max-width:280px;">
                  <div class="ui-skeleton ui-skeleton-circle"></div>
                  <div style="flex:1;">
                    <div class="ui-skeleton ui-skeleton-text" style="width:70%;"></div>
                    <div class="ui-skeleton ui-skeleton-text" style="width:40%;"></div>
                  </div>
                </div>
              `;
            },
            code: `<div class="ui-skeleton ui-skeleton-circle"></div>\n<div class="ui-skeleton ui-skeleton-text"></div>`
          },
          {
            id: 'spinner',
            title: 'Spinner (스피너 인디케이터)',
            desc: '비동기 처리나 로딩 진행 중임을 나타내는 회전 애니메이션 루프',
            render: function() {
              return `
                <div style="display:flex; align-items:center; gap:10px;">
                  <div class="ui-spinner"></div>
                  <span style="font-size:12px; color:#aaa;">데이터 동기화 중...</span>
                </div>
              `;
            },
            code: `<div class="ui-spinner"></div>`
          },
          {
            id: 'progress-bar',
            title: 'Progress Bar (진행률 바)',
            desc: '진행 상황의 정량적 비율(0~100%)을 채워지는 바 형태로 시각화',
            render: function() {
              return `
                <div style="width:100%; max-width:260px;">
                  <div style="display:flex; justify-content:space-between; font-size:12px; color:#aaa; margin-bottom:6px;">
                    <span>업로드 진행률</span>
                    <span>72%</span>
                  </div>
                  <div class="ui-progress-bar">
                    <div class="ui-progress-fill" style="width: 72%;"></div>
                  </div>
                </div>
              `;
            },
            code: `<div class="ui-progress-bar"><div class="ui-progress-fill" style="width:72%"></div></div>`
          },
          {
            id: 'empty-state',
            title: 'Empty State',
            desc: '데이터가 없을 때 사용자를 안내하고 행동(Action)을 유도하는 영역',
            render: function() {
              return `
                <div class="ui-empty-state">
                  <div class="ui-empty-icon">📂</div>
                  <div class="ui-empty-title">생성된 리포트가 없습니다</div>
                  <div class="ui-empty-desc">새로운 데이터 리포트를 생성하여 대시보드 인사이트를 확인해 보세요.</div>
                  <button class="ui-btn ui-btn-primary" style="margin-top:6px;" onclick="showToast('➕ 리포트 생성')">리포트 추가</button>
                </div>
              `;
            },
            code: `<div class="ui-empty-state">\n  <h3>데이터가 없습니다</h3>\n</div>`
          }
        ]
      },
      {
        title: 'Information & Badges (안내 및 정보 표시 계층)',
        desc: '상시 공지나 호버 안내, 사용자 등급 뱃지를 전달하는 피드백 컴포넌트입니다.',
        components: [
          {
            id: 'alert-banner',
            title: 'Alert Banner / Callout',
            desc: '화면 상단에 노출되는 시스템 정기 점검 및 주요 안내 배너',
            render: function() {
              return `
                <div style="background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:12px 16px; color:#fbbf24; font-size:13px; display:flex; align-items:center; gap:10px; width:100%; max-width:340px;">
                  <span>⚠️</span>
                  <span><strong>점검 안내:</strong> 오늘 밤 02:00 ~ 04:00 데이터베이스 정기 점검이 예정되어 있습니다.</span>
                </div>
              `;
            },
            code: `<div class="ui-callout ui-callout-warning">\n  ⚠️ 점검 안내 배너\n</div>`
          },
          {
            id: 'tooltip',
            title: 'Tooltip',
            desc: '마우스 호버 시 부연 설명을 팝업 형태로 전달',
            render: function() {
              return `
                <div class="ui-tooltip-wrapper">
                  <button class="ui-btn ui-btn-secondary">
                    <span>ℹ️ Hover me</span>
                  </button>
                  <div class="ui-tooltip-text">안전한 데이터 256-bit 암호화 보장</div>
                </div>
              `;
            },
            code: `<div class="ui-tooltip-wrapper">\n  <button>Hover me</button>\n  <div class="ui-tooltip-text">Tooltip Text</div>\n</div>`
          },
          {
            id: 'badge',
            title: 'Badge (상태 배지)',
            desc: '상태나 등급(Active, Pro, Warning 등)을 표시하는 레이블',
            render: function() {
              return `
                <div style="display:flex; gap:8px;">
                  <span class="ui-badge ui-badge-success">● Active</span>
                  <span class="ui-badge ui-badge-warning">⚡ Pro Plan</span>
                  <span class="ui-badge ui-badge-info">ℹ️ Pending</span>
                </div>
              `;
            },
            code: `<span class="ui-badge ui-badge-success">Active</span>`
          },
          {
            id: 'avatar',
            title: 'Avatar (프로필 아바타)',
            desc: '사용자의 프로필 이미지 또는 이니셜 아바타 및 접속 상태 점(Online Dot)',
            render: function() {
              return `
                <div style="position:relative; display:inline-block;">
                  <div style="width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg, #a259ff, #6366f1); display:flex; align-items:center; justify-content:center; font-weight:700; color:#fff;">PX</div>
                  <span style="position:absolute; bottom:0; right:0; width:12px; height:12px; background:#10b981; border:2px solid #18181c; border-radius:50%;"></span>
                </div>
              `;
            },
            code: `<div class="ui-avatar">PX</div>`
          }
        ]
      }
    ]
  };
})(window);

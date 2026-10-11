/* ==========================================================================
   Component Artboard 4: Navigation
   ========================================================================== */

(function(window) {
  window.ComponentModules = window.ComponentModules || {};

  window.ComponentModules['navigation'] = {
    id: 'navigation',
    beforeRender: window.NavigationFeed.resetState,
    title: 'navigation (화면 이동과 구조)',
    tag: 'Navigation & Routes',
    desc: '서비스 경로 이동 및 카테고리 탭 탐색용 네비게이션 구조 모음',
    groups: [
      {
        title: 'Global & Local Navigation (메인 & 서브 네비게이션 계층)',
        desc: '서비스 전체 또는 특정 섹션 영역의 경로 진입을 담당하는 주요 네비게이션입니다.',
        components: [
          {
            id: 'gnb-bar',
            title: 'GNB (Global Navigation Bar)',
            desc: '상단 상시 고정 최상위 메인 메뉴 바 (컴팩트 반응형 비율 최적화)',
            render: function() {
              return `
                <div class="ui-gnb-demo" style="width:100%; background:#131316; border:1px solid rgba(255,255,255,0.12); border-radius:10px; padding:8px 12px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:8px; box-shadow:0 8px 20px rgba(0,0,0,0.3);">
                  <!-- Logo & Main Menu -->
                  <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                    <div style="font-weight:800; font-size:12px; color:#818cf8; display:flex; align-items:center; gap:6px; white-space:nowrap;">
                      <span style="background:linear-gradient(135deg, #6366f1, #a855f7); color:#fff; width:22px; height:22px; border-radius:5px; display:inline-flex; align-items:center; justify-content:center; font-size:11px; font-weight:900;">S</span>
                      SaaS Console
                    </div>
                    
                    <div style="display:flex; gap:4px; background:rgba(255,255,255,0.04); padding:2px; border-radius:6px; border:1px solid rgba(255,255,255,0.06); max-width:100%; overflow-x:auto;">
                      <button type="button" class="gnb-tab-btn active" style="background:#6366f1; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:600; cursor:pointer; white-space:nowrap;" onclick="if(window.switchGnbTab) window.switchGnbTab(this, '대시보드')">대시보드</button>
                      <button type="button" class="gnb-tab-btn" style="background:transparent; color:#9ca3af; border:none; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:500; cursor:pointer; white-space:nowrap;" onclick="if(window.switchGnbTab) window.switchGnbTab(this, '프로젝트')">프로젝트</button>
                      <button type="button" class="gnb-tab-btn" style="background:transparent; color:#9ca3af; border:none; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:500; cursor:pointer; white-space:nowrap;" onclick="if(window.switchGnbTab) window.switchGnbTab(this, '데이터 분석')">데이터 분석</button>
                    </div>
                  </div>

                  <!-- Right User Actions -->
                  <div style="display:flex; align-items:center; gap:8px; margin-left:auto;">
                    <div style="position:relative; cursor:pointer;" onclick="if(window.showToast) window.showToast('🔔 신규 알림 3건이 있습니다.');">
                      <span style="font-size:14px;">🔔</span>
                      <span style="position:absolute; top:-4px; right:-4px; background:#ef4444; color:#fff; font-size:8px; font-weight:800; border-radius:10px; padding:0 3px;">3</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.06); padding:3px 8px; border-radius:16px; border:1px solid rgba(255,255,255,0.1); cursor:pointer;" onclick="if(window.showToast) window.showToast('👤 Admin 프로필 메뉴 오픈');">
                      <div style="width:18px; height:18px; border-radius:50%; background:#10b981; color:#fff; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:bold;">A</div>
                      <span style="font-size:10px; font-weight:600; color:#e5e7eb; white-space:nowrap;">Admin</span>
                    </div>
                  </div>
                </div>
              `;
            },
            code: `<nav class="ui-gnb">\n  <div class="gnb-logo">SaaS Console</div>\n  <div class="gnb-links">\n    <a class="active">대시보드</a>\n    <a>프로젝트</a>\n  </div>\n</nav>`
          },
          {
            id: 'lnb-sidebar',
            title: 'LNB / Sidebar (서브 네비게이션 트리)',
            desc: '접힘/펼침 아코디언 카테고리와 서브 메뉴 계층을 가진 측면 메뉴',
            render: function() {
              return `
                <div class="ui-lnb-demo" style="width:100%; max-width:240px; background:#18181c; border:1px solid rgba(255,255,255,0.12); border-radius:10px; padding:12px; box-shadow:0 8px 20px rgba(0,0,0,0.3);">
                  <div style="padding:4px 8px; font-size:10px; color:#71717a; font-weight:800; letter-spacing:0.5px; margin-bottom:8px;">WORKSPACES</div>
                  
                  <!-- Accordion Group 1 -->
                  <div class="lnb-group">
                    <div style="padding:8px 10px; background:rgba(99,102,241,0.18); border-radius:6px; color:#818cf8; font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:space-between; cursor:pointer;" onclick="if(window.toggleLnbSubmenu) window.toggleLnbSubmenu(this)">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span>📊</span> <span>대시보드 메인</span>
                      </div>
                      <span class="lnb-arrow" style="font-size:9px;">▲</span>
                    </div>
                    <div class="lnb-submenu" style="padding:4px 0 4px 28px; display:flex; flex-direction:column; gap:4px; margin-top:4px;">
                      <div style="padding:5px 8px; color:#6366f1; font-weight:600; font-size:11px; border-left:2px solid #6366f1; cursor:pointer;" onclick="if(window.selectLnbItem) window.selectLnbItem(this, '실시간 지표')">● 실시간 지표</div>
                      <div style="padding:5px 8px; color:#9ca3af; font-size:11px; cursor:pointer; transition:color 0.2s;" onclick="if(window.selectLnbItem) window.selectLnbItem(this, '매출 현황 리포트')">● 매출 현황 리포트</div>
                      <div style="padding:5px 8px; color:#9ca3af; font-size:11px; cursor:pointer; transition:color 0.2s;" onclick="if(window.selectLnbItem) window.selectLnbItem(this, '트래픽 로그')">● 트래픽 로그</div>
                    </div>
                  </div>

                  <!-- Accordion Group 2 -->
                  <div class="lnb-group" style="margin-top:8px;">
                    <div style="padding:8px 10px; color:#d4d4d8; font-size:12px; font-weight:600; display:flex; align-items:center; justify-content:space-between; cursor:pointer; border-radius:6px; transition:background 0.2s;" onclick="if(window.toggleLnbSubmenu) window.toggleLnbSubmenu(this)">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span>📁</span> <span>프로젝트 관리</span>
                      </div>
                      <span class="lnb-arrow" style="font-size:9px;">▼</span>
                    </div>
                    <div class="lnb-submenu" style="padding:4px 0 4px 28px; display:none; flex-direction:column; gap:4px; margin-top:4px;">
                      <div style="padding:5px 8px; color:#9ca3af; font-size:11px; cursor:pointer;" onclick="if(window.selectLnbItem) window.selectLnbItem(this, '웹 앱 프로젝트')">● 웹 앱 프로젝트</div>
                      <div style="padding:5px 8px; color:#9ca3af; font-size:11px; cursor:pointer;" onclick="if(window.selectLnbItem) window.selectLnbItem(this, '모바일 서비스')">● 모바일 서비스</div>
                    </div>
                  </div>

                  <!-- Accordion Group 3 -->
                  <div class="lnb-group" style="margin-top:8px;">
                    <div style="padding:8px 10px; color:#d4d4d8; font-size:12px; font-weight:600; display:flex; align-items:center; justify-content:space-between; cursor:pointer; border-radius:6px; transition:background 0.2s;" onclick="if(window.toggleLnbSubmenu) window.toggleLnbSubmenu(this)">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span>⚙️</span> <span>설정 & 보안</span>
                      </div>
                      <span class="lnb-arrow" style="font-size:9px;">▼</span>
                    </div>
                    <div class="lnb-submenu" style="padding:4px 0 4px 28px; display:none; flex-direction:column; gap:4px; margin-top:4px;">
                      <div style="padding:5px 8px; color:#9ca3af; font-size:11px; cursor:pointer;" onclick="if(window.selectLnbItem) window.selectLnbItem(this, '계정 프로필')">● 계정 프로필</div>
                      <div style="padding:5px 8px; color:#9ca3af; font-size:11px; cursor:pointer;" onclick="if(window.selectLnbItem) window.selectLnbItem(this, 'API 키 발급')">● API 키 발급</div>
                    </div>
                  </div>
                </div>
              `;
            },
            code: `<aside class="ui-lnb">\n  <div class="lnb-item active">실시간 지표</div>\n</aside>`
          },
          {
            id: 'breadcrumb-interactive',
            title: 'Interactive Breadcrumb (경로 탐색 바)',
            desc: '클릭 시 해당 상위/하위 위치로 활성화 경로가 즉시 이동하는 실시간 경로 안내바',
            render: function() {
              return `
                <div class="ui-breadcrumb" style="display:flex; align-items:center; gap:6px; font-size:12px; background:rgba(0,0,0,0.3); padding:8px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); flex-wrap:wrap;">
                  <span class="bc-link" style="color:#9ca3af; cursor:pointer; display:inline-flex; align-items:center; gap:4px; padding:2px 6px; border-radius:4px; transition:all 0.2s;" onclick="if(window.clickBreadcrumb) window.clickBreadcrumb(this, 'Home')">🏠 Home</span>
                  <span style="color:#4b5563;">/</span>
                  <span class="bc-link" style="color:#9ca3af; cursor:pointer; padding:2px 6px; border-radius:4px; transition:all 0.2s;" onclick="if(window.clickBreadcrumb) window.clickBreadcrumb(this, 'Projects')">Projects</span>
                  <span style="color:#4b5563;">/</span>
                  <span class="bc-link" style="color:#9ca3af; cursor:pointer; padding:2px 6px; border-radius:4px; transition:all 0.2s;" onclick="if(window.clickBreadcrumb) window.clickBreadcrumb(this, 'Analytics')">Analytics</span>
                  <span style="color:#4b5563;">/</span>
                  <span class="bc-link active" style="color:#6366f1; font-weight:700; background:rgba(99,102,241,0.15); padding:2px 8px; border-radius:4px; cursor:pointer; transition:all 0.2s;" onclick="if(window.clickBreadcrumb) window.clickBreadcrumb(this, 'Realtime Log')">Realtime Log</span>
                </div>
              `;
            },
            code: `<div class="ui-breadcrumb">\n  <a href="#">Home</a> / <a href="#">Projects</a> / <span class="active">Realtime Log</span>\n</div>`
          },
          {
            id: 'integrated-nav-demo',
            title: 'Integrated GNB + LNB App Layout (통합 네비게이션 시연)',
            desc: 'GNB 메인 메뉴 변경 시 LNB 서브 메뉴가 실시간으로 연동되는 통합 앱 구조',
            render: function() {
              return `
                <div style="width:100%; background:#111113; border:1px solid rgba(255,255,255,0.15); border-radius:10px; overflow:hidden; box-shadow:0 12px 30px rgba(0,0,0,0.5);">
                  <!-- Top GNB Bar -->
                  <div style="background:#1c1c21; padding:8px 14px; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:space-between;">
                    <div style="font-size:12px; font-weight:800; color:#818cf8;">❖ System Console</div>
                    <div style="display:flex; gap:12px; font-size:11px;">
                      <span id="integrated-gnb-1" style="color:#6366f1; font-weight:700; cursor:pointer;" onclick="if(window.switchIntegratedNav) window.switchIntegratedNav('dashboard')">대시보드</span>
                      <span id="integrated-gnb-2" style="color:#9ca3af; cursor:pointer;" onclick="if(window.switchIntegratedNav) window.switchIntegratedNav('users')">사용자 관리</span>
                      <span id="integrated-gnb-3" style="color:#9ca3af; cursor:pointer;" onclick="if(window.switchIntegratedNav) window.switchIntegratedNav('settings')">설정</span>
                    </div>
                  </div>
                  
                  <!-- Main Body: LNB + Content -->
                  <div style="display:flex; min-height:110px;">
                    <!-- Left LNB -->
                    <div id="integrated-lnb-container" style="width:130px; background:#161619; border-right:1px solid rgba(255,255,255,0.08); padding:10px; display:flex; flex-direction:column; gap:6px; font-size:11px;">
                      <div style="color:#6366f1; font-weight:600; padding:4px 6px; background:rgba(99,102,241,0.15); border-radius:4px;">● 실시간 지표</div>
                      <div style="color:#9ca3af; padding:4px 6px; cursor:pointer;" onclick="if(window.showToast) window.showToast('서브메뉴: 매출 리포트')">● 매출 리포트</div>
                      <div style="color:#9ca3af; padding:4px 6px; cursor:pointer;" onclick="if(window.showToast) window.showToast('서브메뉴: 접속 로그')">● 접속 로그</div>
                    </div>
                    
                    <!-- Right Content Area -->
                    <div style="flex:1; padding:14px; background:#0c0c0e;">
                      <div id="integrated-content-title" style="font-size:13px; font-weight:700; color:#fff; margin-bottom:4px;">📊 대시보드 뷰</div>
                      <div id="integrated-content-desc" style="font-size:11px; color:#888;">GNB 메뉴 클릭 시 LNB 서브 메뉴 항목이 동적으로 변형됩니다.</div>
                    </div>
                  </div>
                </div>
              `;
            },
            code: `<div class="app-layout">\n  <header class="gnb">...</header>\n  <div class="main">\n    <aside class="lnb">...</aside>\n    <main class="content">...</main>\n  </div>\n</div>`
          }
        ]
      },
      {
        title: 'View & Content Navigation (뷰 & 콘텐츠 탐색 계층)',
        desc: '화면 내부에서 세부 카테고리 뷰를 바꾸거나 많은 양의 콘텐츠 목록을 나누어 탐색합니다.',
        components: [
          {
            id: 'tab-bar',
            title: 'Tab Bar (카테고리 탭 바)',
            desc: '동일 페이지 내 세부 카테고리 뷰를 상호 전환하는 탭 바',
            render: function() {
              return `
                <div class="ui-tabs">
                  <div class="ui-tab active" onclick="
                    this.parentNode.querySelectorAll('.ui-tab').forEach(t=>t.classList.remove('active'));
                    this.classList.add('active');
                    if(window.showToast) window.showToast('[카테고리 탭] 전체 (All) 뷰');
                  ">전체 (All)</div>
                  <div class="ui-tab" onclick="
                    this.parentNode.querySelectorAll('.ui-tab').forEach(t=>t.classList.remove('active'));
                    this.classList.add('active');
                    if(window.showToast) window.showToast('[카테고리 탭] 진행 중 뷰');
                  ">진행 중</div>
                  <div class="ui-tab" onclick="
                    this.parentNode.querySelectorAll('.ui-tab').forEach(t=>t.classList.remove('active'));
                    this.classList.add('active');
                    if(window.showToast) window.showToast('[카테고리 탭] 완료됨 뷰');
                  ">완료됨</div>
                </div>
              `;
            },
            code: `<div class="ui-tabs">\n  <div class="ui-tab active">All</div>\n  <div class="ui-tab">Active</div>\n</div>`
          },
          {
            id: 'carousel',
            title: 'Carousel / Banner Slider (배너 슬라이더)',
            desc: '이전/다음 버튼으로 배너 콘텐츠를 좌우 전환 탐색하는 캐러셀',
            render: function() {
              return `
                <div style="width:100%; max-width:320px; position:relative;">
                  <!-- Slide Box -->
                  <div id="carousel-slide-box" style="background:linear-gradient(135deg, #4f46e5, #9333ea); border-radius:10px; padding:16px; color:#fff; min-height:100px; transition:all 0.3s ease;">
                    <div id="carousel-badge" style="display:inline-block; background:#f59e0b; color:#fff; font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px; margin-bottom:6px;">NEW 1/3</div>
                    <h4 id="carousel-title" style="font-size:13px; font-weight:700;">V2.5 업데이트 출시</h4>
                    <p id="carousel-desc" style="font-size:11px; opacity:0.85; margin-top:4px;">더욱 빨라진 피그마 캔버스 시스템을 경험해보세요.</p>
                  </div>
                  
                  <!-- Nav Controls -->
                  <div style="display:flex; align-items:center; justify-content:space-between; margin-top:8px;">
                    <div style="display:flex; gap:4px;" id="carousel-dots">
                      <span style="width:8px; height:8px; border-radius:50%; background:#6366f1; display:inline-block;"></span>
                      <span style="width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,0.2); display:inline-block;"></span>
                      <span style="width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,0.2); display:inline-block;"></span>
                    </div>
                    <div style="display:flex; gap:4px;">
                      <button type="button" class="ui-btn ui-btn-secondary" style="padding:3px 8px; font-size:11px;" onclick="if(window.stepCarousel) window.stepCarousel(-1)">◀ 이전</button>
                      <button type="button" class="ui-btn ui-btn-secondary" style="padding:3px 8px; font-size:11px;" onclick="if(window.stepCarousel) window.stepCarousel(1)">다음 ▶</button>
                    </div>
                  </div>
                </div>
              `;
            },
            code: `<div class="ui-carousel">\n  <div class="slide">Slide 1</div>\n  <button onclick="next()">Next</button>\n</div>`
          },
          {
            id: 'pagination',
            title: 'Pagination (페이지네이션)',
            desc: '정량적 1, 2, 3 페이지 번호 버튼으로 대량 데이터 분할 탐색',
            render: function() {
              return `
                <div class="ui-pagination-demo" style="display:flex; gap:6px; align-items:center;">
                  <button type="button" class="ui-btn ui-btn-secondary" style="padding:4px 10px;" onclick="if(window.switchPage) window.switchPage('prev')">◀</button>
                  <button type="button" class="page-num-btn ui-btn ui-btn-primary" style="padding:4px 10px;" onclick="if(window.switchPage) window.switchPage(1, this)">1</button>
                  <button type="button" class="page-num-btn ui-btn ui-btn-secondary" style="padding:4px 10px;" onclick="if(window.switchPage) window.switchPage(2, this)">2</button>
                  <button type="button" class="page-num-btn ui-btn ui-btn-secondary" style="padding:4px 10px;" onclick="if(window.switchPage) window.switchPage(3, this)">3</button>
                  <button type="button" class="ui-btn ui-btn-secondary" style="padding:4px 10px;" onclick="if(window.switchPage) window.switchPage('next')">▶</button>
                </div>
              `;
            },
            code: `<div class="ui-pagination">\n  <button class="active">1</button>\n  <button>2</button>\n</div>`
          },
          {
            id: 'infinite-scroll',
            title: 'Infinite Scroll (무한 스크롤 동적 로딩)',
            desc: '박스 하단 도달 시 차회 데이터를 오토 로딩하며 최대 상한(10개) 도달 시 로딩이 자동 종료되는 Best Practice 구현',
            render: function() {
              return `
                <div style="width:100%; max-width:320px; background:#121319; border:1px solid rgba(255,255,255,0.12); border-radius:10px; padding:12px; box-shadow:0 8px 24px rgba(0,0,0,0.4);">
                  <!-- Header Info -->
                  <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                    <div style="font-size:11px; font-weight:700; color:#818cf8; display:flex; align-items:center; gap:5px;">
                      <span>📜</span> <span>무한 스크롤 피드</span>
                    </div>
                    <span id="infinite-scroll-status" style="font-size:10px; font-weight:600; color:#a5b4fc; background:rgba(99,102,241,0.18); border:1px solid rgba(99,102,241,0.3); padding:2px 7px; border-radius:12px;">
                      4 / 10개 (최대 10개)
                    </span>
                  </div>
                  
                  <!-- Scrollable Container with Custom Modern Scrollbar -->
                  <div id="infinite-scroll-list" class="custom-scrollbar" style="display:flex; flex-direction:column; gap:6px; height:140px; overflow-y:auto; padding-right:4px; background:#0a0b0e; border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:8px;" onscroll="if(window.handleInfiniteScroll) window.handleInfiniteScroll(this)">
                    ${window.NavigationFeed.initialItems()}
                  </div>

                  <!-- Control Buttons -->
                  <div style="display:flex; gap:6px; margin-top:10px;">
                    <button type="button" id="btn-load-more" class="ui-btn ui-btn-primary" style="flex:1; padding:6px; font-size:11px;" onclick="if(window.triggerInfiniteScroll) window.triggerInfiniteScroll()">
                      ⚡ 수동 로딩 (+2개)
                    </button>
                    <button type="button" id="btn-reset-infinite" class="ui-btn ui-btn-secondary" style="padding:6px 10px; font-size:11px;" onclick="if(window.resetInfiniteScroll) window.resetInfiniteScroll()">
                      🔄 리셋
                    </button>
                  </div>
                </div>
              `;
            },
            code: `// 무한 스크롤 및 최대 개수 제한(Max Cap) 처리 예시\nconst MAX_ITEMS = 10;\nlet itemCount = 4;\n\nlistEl.addEventListener('scroll', () => {\n  if (itemCount >= MAX_ITEMS) return; // 상한 도달 시 로딩 차단\n  const isBottom = listEl.scrollTop + listEl.clientHeight >= listEl.scrollHeight - 10;\n  if (isBottom && !isLoading) fetchNextBatch();\n});`
          }
        ]
      }
    ]
  };

})(window);

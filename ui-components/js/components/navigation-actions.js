(function(window) {
  // Navigation Interactive Handlers
  window.switchGnbTab = function(btnEl, tabName) {
    const parent = btnEl.parentNode;
    if (parent) {
      parent.querySelectorAll('.gnb-tab-btn').forEach(b => {
        b.style.background = 'transparent';
        b.style.color = '#9ca3af';
        b.style.fontWeight = '500';
        b.classList.remove('active');
      });
    }
    btnEl.style.background = '#6366f1';
    btnEl.style.color = '#ffffff';
    btnEl.style.fontWeight = '600';
    btnEl.classList.add('active');

    if (window.showToast) {
      window.showToast(`[GNB] ${tabName} 메인 메뉴로 이동`);
    }
  };

  window.toggleLnbSubmenu = function(headerEl) {
    const group = headerEl.closest('.lnb-group');
    if (!group) return;
    const submenu = group.querySelector('.lnb-submenu');
    const arrow = group.querySelector('.lnb-arrow');

    if (submenu) {
      const isHidden = submenu.style.display === 'none' || !submenu.style.display;
      submenu.style.display = isHidden ? 'flex' : 'none';
      if (arrow) arrow.textContent = isHidden ? '▲' : '▼';
    }
  };

  window.selectLnbItem = function(itemEl, itemName) {
    const container = itemEl.closest('.ui-lnb-demo');
    if (container) {
      container.querySelectorAll('.lnb-submenu div').forEach(el => {
        el.style.color = '#9ca3af';
        el.style.fontWeight = 'normal';
        el.style.borderLeft = 'none';
      });
    }
    itemEl.style.color = '#6366f1';
    itemEl.style.fontWeight = 'bold';
    itemEl.style.borderLeft = '2px solid #6366f1';

    if (window.showToast) {
      window.showToast(`[LNB 서브메뉴] ${itemName} 선택됨`);
    }
  };

  window.switchIntegratedNav = function(section) {
    const gnb1 = document.getElementById('integrated-gnb-1');
    const gnb2 = document.getElementById('integrated-gnb-2');
    const gnb3 = document.getElementById('integrated-gnb-3');
    const lnbContainer = document.getElementById('integrated-lnb-container');
    const titleEl = document.getElementById('integrated-content-title');
    const descEl = document.getElementById('integrated-content-desc');

    [gnb1, gnb2, gnb3].forEach(el => {
      if (el) {
        el.style.color = '#9ca3af';
        el.style.fontWeight = 'normal';
      }
    });

    if (section === 'dashboard') {
      if (gnb1) { gnb1.style.color = '#6366f1'; gnb1.style.fontWeight = 'bold'; }
      if (lnbContainer) {
        lnbContainer.innerHTML = `
          <div style="color:#6366f1; font-weight:600; padding:4px 6px; background:rgba(99,102,241,0.15); border-radius:4px;">● 실시간 지표</div>
          <div style="color:#9ca3af; padding:4px 6px; cursor:pointer;" onclick="if(window.showToast) window.showToast('서브메뉴: 매출 리포트')">● 매출 리포트</div>
          <div style="color:#9ca3af; padding:4px 6px; cursor:pointer;" onclick="if(window.showToast) window.showToast('서브메뉴: 접속 로그')">● 접속 로그</div>
        `;
      }
      if (titleEl) titleEl.textContent = '📊 대시보드 뷰';
      if (descEl) descEl.textContent = '실시간 서비스 상태 지표와 트래픽 현황을 모니터링합니다.';
    } else if (section === 'users') {
      if (gnb2) { gnb2.style.color = '#6366f1'; gnb2.style.fontWeight = 'bold'; }
      if (lnbContainer) {
        lnbContainer.innerHTML = `
          <div style="color:#6366f1; font-weight:600; padding:4px 6px; background:rgba(99,102,241,0.15); border-radius:4px;">● 회원 목록</div>
          <div style="color:#9ca3af; padding:4px 6px; cursor:pointer;" onclick="if(window.showToast) window.showToast('서브메뉴: 권한 그룹')">● 권한 그룹</div>
          <div style="color:#9ca3af; padding:4px 6px; cursor:pointer;" onclick="if(window.showToast) window.showToast('서브메뉴: 차단 목록')">● 차단 목록</div>
        `;
      }
      if (titleEl) titleEl.textContent = '👥 사용자 관리 뷰';
      if (descEl) descEl.textContent = '전체 등록 가입자 목록과 직책별 권한을 설정합니다.';
    } else if (section === 'settings') {
      if (gnb3) { gnb3.style.color = '#6366f1'; gnb3.style.fontWeight = 'bold'; }
      if (lnbContainer) {
        lnbContainer.innerHTML = `
          <div style="color:#6366f1; font-weight:600; padding:4px 6px; background:rgba(99,102,241,0.15); border-radius:4px;">● 일반 설정</div>
          <div style="color:#9ca3af; padding:4px 6px; cursor:pointer;" onclick="if(window.showToast) window.showToast('서브메뉴: 보안 & API')">● 보안 & API</div>
          <div style="color:#9ca3af; padding:4px 6px; cursor:pointer;" onclick="if(window.showToast) window.showToast('서브메뉴: 결제 수단')">● 결제 수단</div>
        `;
      }
      if (titleEl) titleEl.textContent = '⚙️ 시스템 설정 뷰';
      if (descEl) descEl.textContent = '서비스 통합 환경 설정 및 API 연동키를 관리합니다.';
    }

    if (window.showToast) {
      window.showToast(`[통합 연동 시연] ${section.toUpperCase()} 메뉴 전환`);
    }
  };
  window.clickBreadcrumb = function(itemEl, pathName) {
    const container = itemEl.closest('.ui-breadcrumb');
    if (!container) return;

    container.querySelectorAll('.bc-link').forEach(link => {
      link.style.color = '#9ca3af';
      link.style.fontWeight = 'normal';
      link.style.background = 'transparent';
      link.style.padding = '2px 6px';
    });

    itemEl.style.color = '#6366f1';
    itemEl.style.fontWeight = '700';
    itemEl.style.background = 'rgba(99,102,241,0.15)';
    itemEl.style.padding = '2px 8px';

    if (window.showToast) {
      window.showToast(`[Breadcrumb 경로 이동] ${pathName}`);
    }
  };

})(window);

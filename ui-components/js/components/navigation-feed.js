(function(window) {
  const initialMarkup = `                    <div class="infinite-item-card">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:12px;">📦</span>
                        <div>
                          <div style="font-weight:600; color:#f3f4f6; font-size:11px;">데이터 피드 목록 #1</div>
                          <div style="font-size:9px; color:#6b7280;">최초 로드됨</div>
                        </div>
                      </div>
                      <span style="font-size:9px; color:#10b981; background:rgba(16,185,129,0.15); padding:1px 5px; border-radius:4px;">🟢 정상</span>
                    </div>

                    <div class="infinite-item-card">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:12px;">📦</span>
                        <div>
                          <div style="font-weight:600; color:#f3f4f6; font-size:11px;">데이터 피드 목록 #2</div>
                          <div style="font-size:9px; color:#6b7280;">최초 로드됨</div>
                        </div>
                      </div>
                      <span style="font-size:9px; color:#10b981; background:rgba(16,185,129,0.15); padding:1px 5px; border-radius:4px;">🟢 정상</span>
                    </div>

                    <div class="infinite-item-card">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:12px;">📦</span>
                        <div>
                          <div style="font-weight:600; color:#f3f4f6; font-size:11px;">데이터 피드 목록 #3</div>
                          <div style="font-size:9px; color:#6b7280;">최초 로드됨</div>
                        </div>
                      </div>
                      <span style="font-size:9px; color:#10b981; background:rgba(16,185,129,0.15); padding:1px 5px; border-radius:4px;">🟢 정상</span>
                    </div>

                    <div class="infinite-item-card">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:12px;">📦</span>
                        <div>
                          <div style="font-weight:600; color:#f3f4f6; font-size:11px;">데이터 피드 목록 #4</div>
                          <div style="font-size:9px; color:#818cf8;">👇 아래로 스크롤하여 오토 페칭</div>
                        </div>
                      </div>
                      <span style="font-size:9px; color:#6366f1; background:rgba(99,102,241,0.15); padding:1px 5px; border-radius:4px;">바닥 감지</span>
                    </div>`;
  window.NavigationFeed = { initialItems: () => initialMarkup, resetState };
  // Infinite Scroll Handler (Best Practice: Max Cap Limit & Reset Support)
  const MAX_INFINITE_ITEMS = 10;
  let infiniteScrollItemCount = 4;
  let pendingLoad;
  let isInfiniteLoading = false;
  let hasMoreInfiniteData = true;

  window.handleInfiniteScroll = function(containerEl) {
    if (!containerEl?.isConnected || isInfiniteLoading || !hasMoreInfiniteData) return;

    // Check if scrolled near bottom (threshold 10px)
    const isBottom = containerEl.scrollTop + containerEl.clientHeight >= containerEl.scrollHeight - 10;
    if (isBottom) {
      window.triggerInfiniteScroll();
    }
  };

  window.triggerInfiniteScroll = function() {
    if (!hasMoreInfiniteData) {
      if (window.showToast) {
        window.showToast(`🎉 이미 모든 데이터(${MAX_INFINITE_ITEMS}/${MAX_INFINITE_ITEMS}) 로딩이 완료되었습니다.`);
      }
      return;
    }
    if (isInfiniteLoading) return;
    isInfiniteLoading = true;

    const list = document.getElementById('infinite-scroll-list');
    const btn = document.getElementById('btn-load-more');
    const statusEl = document.getElementById('infinite-scroll-status');

    if (btn) {
      btn.textContent = '⏳ 데이터 페칭 중...';
      btn.disabled = true;
    }

    // Show temporary loading indicator
    let loadingIndicator = null;
    if (list) {
      loadingIndicator = document.createElement('div');
      loadingIndicator.style.cssText = 'padding:8px; background:rgba(99,102,241,0.15); border:1px dashed #6366f1; border-radius:6px; font-size:10px; color:#a5b4fc; text-align:center; animation:pulseInfinite 1s infinite; margin-top:2px;';
      loadingIndicator.textContent = '🔄 스크롤 하단 감지: API 데이터 수신 중...';
      list.appendChild(loadingIndicator);
      list.scrollTop = list.scrollHeight;
    }

    pendingLoad = setTimeout(() => {
      if (!list?.isConnected) { resetState(); return; }
      // Remove spinner
      if (loadingIndicator && loadingIndicator.parentNode) {
        loadingIndicator.remove();
      }

      if (list) {
        // Add 2 items per scroll batch
        for (let i = 1; i <= 2; i++) {
          if (infiniteScrollItemCount < MAX_INFINITE_ITEMS) {
            infiniteScrollItemCount++;
            const item = document.createElement('div');
            item.className = 'infinite-item-card';
            item.innerHTML = `
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:12px;">📦</span>
                <div>
                  <div style="font-weight:600; color:#f3f4f6; font-size:11px;">데이터 피드 목록 #${infiniteScrollItemCount}</div>
                  <div style="font-size:9px; color:#a5b4fc;">오토 스크롤 페칭 완료</div>
                </div>
              </div>
              <span style="font-size:9px; color:#818cf8; background:rgba(99,102,241,0.15); padding:1px 5px; border-radius:4px;">✨ 동적 추가</span>
            `;
            list.appendChild(item);
          }
        }

        // Check if Max Limit Reached
        if (infiniteScrollItemCount >= MAX_INFINITE_ITEMS) {
          hasMoreInfiniteData = false;

          const endNotice = document.createElement('div');
          endNotice.id = 'infinite-scroll-end-notice';
          endNotice.style.cssText = 'padding:8px 10px; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.3); border-radius:6px; font-size:10px; color:#34d399; text-align:center; font-weight:600; margin-top:4px;';
          endNotice.textContent = `🎉 모든 데이터(${MAX_INFINITE_ITEMS}/${MAX_INFINITE_ITEMS}) 로딩이 완료되었습니다.`;
          list.appendChild(endNotice);

          if (statusEl) {
            statusEl.textContent = `${MAX_INFINITE_ITEMS} / ${MAX_INFINITE_ITEMS}개 (완료)`;
            statusEl.style.background = 'rgba(16,185,129,0.2)';
            statusEl.style.borderColor = 'rgba(16,185,129,0.4)';
            statusEl.style.color = '#34d399';
          }

          if (btn) {
            btn.textContent = '🎉 로딩 완료 (10/10)';
            btn.disabled = true;
            btn.style.opacity = '0.6';
          }
        } else {
          if (statusEl) {
            statusEl.textContent = `${infiniteScrollItemCount} / ${MAX_INFINITE_ITEMS}개 (최대 ${MAX_INFINITE_ITEMS}개)`;
          }
          if (btn) {
            btn.textContent = '⚡ 수동 로딩 (+2개)';
            btn.disabled = false;
          }
        }

        list.scrollTop = list.scrollHeight;
      }

      isInfiniteLoading = false;

      if (window.showToast) {
        if (!hasMoreInfiniteData) {
          window.showToast(`[무한 스크롤 완료] 최대 상한선(${MAX_INFINITE_ITEMS}개) 도달로 로딩이 자동 종료되었습니다.`);
        } else {
          window.showToast(`[무한 스크롤] 신규 데이터 2건 페칭 완료 (${infiniteScrollItemCount}/${MAX_INFINITE_ITEMS})`);
        }
      }
    }, 400);
  };

  function resetState() {
    clearTimeout(pendingLoad);
    infiniteScrollItemCount = 4;
    isInfiniteLoading = false;
    hasMoreInfiniteData = true;
  }

  window.resetInfiniteScroll = function() {
    resetState();

    const list = document.getElementById('infinite-scroll-list');
    const btn = document.getElementById('btn-load-more');
    const statusEl = document.getElementById('infinite-scroll-status');

    if (list) {
      list.innerHTML = window.NavigationFeed.initialItems();
      list.scrollTop = 0;
    }

    if (statusEl) {
      statusEl.textContent = `${infiniteScrollItemCount} / ${MAX_INFINITE_ITEMS}개 (최대 ${MAX_INFINITE_ITEMS}개)`;
      statusEl.style.background = 'rgba(99,102,241,0.18)';
      statusEl.style.borderColor = 'rgba(99,102,241,0.3)';
      statusEl.style.color = '#a5b4fc';
    }

    if (btn) {
      btn.textContent = '⚡ 수동 로딩 (+2개)';
      btn.disabled = false;
      btn.style.opacity = '1';
    }

    if (window.showToast) {
      window.showToast('🔄 무한 스크롤 시연 상태가 초기화되었습니다 (4/10개).');
    }
  };
})(window);

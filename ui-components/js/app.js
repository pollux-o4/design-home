/* ==========================================================================
   Figma Canvas Application Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
  const canvasGrid = document.getElementById('canvas-grid');
  const layerTree = document.getElementById('layer-tree');
  const searchInput = document.getElementById('search-input');
  const tabBtns = document.querySelectorAll('.figma-tab-btn');
  const codeModal = document.getElementById('code-modal-overlay');
  const codeContent = document.getElementById('code-modal-body');
  const codeTitle = document.getElementById('code-modal-title');
  const btnCopyCode = document.getElementById('btn-copy-code');
  const btnCloseModal = document.getElementById('btn-close-modal');

  const moduleKeys = [
    'popups-and-layers',
    'inputs-and-controls',
    'states-and-feedback',
    'navigation',
    'interactions'
  ];

  let activeCategory = 'all';
  let searchQuery = '';

  // Render all modules into Canvas
  function initApp() {
    renderCanvas();
    renderSidebar();
    setupEvents();
  }

  function getModuleTotalComponents(mod) {
    if (mod.groups) {
      return mod.groups.reduce((sum, g) => sum + g.components.length, 0);
    }
    return mod.components ? mod.components.length : 0;
  }

  function renderSidebar() {
    layerTree.innerHTML = '';

    moduleKeys.forEach(key => {
      const mod = window.ComponentModules[key];
      if (!mod) return;

      const totalCount = getModuleTotalComponents(mod);

      const li = document.createElement('li');
      li.className = 'layer-item';
      li.setAttribute('data-target', mod.id);
      li.innerHTML = `
        <span class="layer-icon">❖</span>
        <span>${mod.id}</span>
        <span class="layer-badge">${totalCount}</span>
      `;

      li.addEventListener('click', function() {
        document.querySelectorAll('.layer-item').forEach(el => el.classList.remove('active'));
        li.classList.add('active');

        const frameEl = document.getElementById(`frame-${mod.id}`);
        const viewport = document.querySelector('.figma-canvas-viewport');
        if (frameEl && viewport) {
          viewport.scrollTo({
            top: frameEl.offsetTop - 30,
            behavior: 'smooth'
          });
        }
      });

      layerTree.appendChild(li);
    });
  }

  function renderCanvas() {
    canvasGrid.innerHTML = '';

    moduleKeys.forEach(key => {
      const mod = window.ComponentModules[key];
      if (!mod) return;

      // Filter by category
      if (activeCategory !== 'all' && activeCategory !== mod.id) {
        return;
      }

      const frame = document.createElement('div');
      frame.className = 'artboard-frame';
      frame.id = `frame-${mod.id}`;

      frame.innerHTML = `
        <div class="artboard-header">
          <div>
            <div class="artboard-title">
              <span>❖</span> ${mod.title}
            </div>
            <div class="artboard-desc">${mod.desc}</div>
          </div>
          <span class="artboard-tag">${mod.tag}</span>
        </div>
        <div class="frame-content" id="content-${mod.id}"></div>
      `;

      const frameContent = frame.querySelector(`#content-${mod.id}`);
      let renderedAnyComponent = false;

      if (mod.groups) {
        mod.groups.forEach(group => {
          const filtered = group.components.filter(c => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || (c.desc && c.desc.toLowerCase().includes(q));
          });

          if (filtered.length > 0) {
            renderedAnyComponent = true;
            const groupBox = document.createElement('div');
            groupBox.className = 'subgroup-box';
            groupBox.innerHTML = `
              <div class="subgroup-header">
                <div class="subgroup-title">
                  <span>📂</span> ## ${group.title}
                </div>
                ${group.desc ? `<div class="subgroup-desc">${group.desc}</div>` : ''}
              </div>
              <div class="components-grid"></div>
            `;

            const gridEl = groupBox.querySelector('.components-grid');
            filtered.forEach(comp => {
              gridEl.appendChild(createCardElement(comp));
            });

            frameContent.appendChild(groupBox);
          }
        });
      } else if (mod.components) {
        const filtered = mod.components.filter(c => {
          if (!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
        });

        if (filtered.length > 0) {
          renderedAnyComponent = true;
          const gridEl = document.createElement('div');
          gridEl.className = 'components-grid';
          filtered.forEach(comp => {
            gridEl.appendChild(createCardElement(comp));
          });
          frameContent.appendChild(gridEl);
        }
      }

      if (renderedAnyComponent) {
        canvasGrid.appendChild(frame);
      }
    });

    if (canvasGrid.children.length === 0) {
      canvasGrid.innerHTML = `
        <div class="artboard-frame" style="text-align:center; padding:60px;">
          <div style="font-size:40px; margin-bottom:12px;">🔍</div>
          <h3 style="color:#fff; font-size:18px; margin-bottom:6px;">검색 결과가 없습니다</h3>
          <p style="color:#aaa; font-size:13px;">'${searchQuery}' 와 일치하는 컴포넌트가 존재하지 않습니다.</p>
        </div>
      `;
    }
  }

  function createCardElement(comp) {
    const card = document.createElement('div');
    card.className = 'component-card';
    card.innerHTML = `
      <div class="component-card-header">
        <div>
          <div class="component-title">
            <span style="color:#6366f1;">●</span> ### ${comp.title}
            ${comp.badge ? `<span class="hierarchy-badge">${comp.badge}</span>` : ''}
          </div>
          ${comp.desc ? `<div class="component-subdesc">${comp.desc}</div>` : ''}
        </div>
        <button class="btn-code-view" data-comp-id="${comp.id}">
          <span>&lt;/&gt;</span> Code
        </button>
      </div>
      <div class="component-body">
        ${comp.render()}
      </div>
    `;

    const codeBtn = card.querySelector('.btn-code-view');
    codeBtn.addEventListener('click', function() {
      openCodeModal(comp.title, comp.code);
    });

    return card;
  }

  function setupEvents() {
    // Search filter
    searchInput.addEventListener('input', function(e) {
      searchQuery = e.target.value.trim();
      renderCanvas();
    });

    // Category tabs
    tabBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-category');
        renderCanvas();

        // Sync sidebar active state
        document.querySelectorAll('.layer-item').forEach(item => {
          const target = item.getAttribute('data-target');
          item.classList.toggle('active', activeCategory === target);
        });

        // Scroll to top of viewport on tab switch
        const viewport = document.querySelector('.figma-canvas-viewport');
        if (viewport) {
          viewport.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    // Code Modal
    btnCloseModal.addEventListener('click', closeCodeModal);
    codeModal.addEventListener('click', function(e) {
      if (e.target === codeModal) closeCodeModal();
    });

    btnCopyCode.addEventListener('click', function() {
      navigator.clipboard.writeText(codeContent.textContent).then(() => {
        btnCopyCode.textContent = 'Copied!';
        setTimeout(() => { btnCopyCode.textContent = 'Copy Code'; }, 1500);
      });
    });
  }

  function openCodeModal(title, code) {
    codeTitle.textContent = `< ${title} />`;
    codeContent.textContent = code;
    codeModal.classList.add('open');
  }

  function closeCodeModal() {
    codeModal.classList.remove('open');
  }

  initApp();
});

// Sidebar Accordion Toggle Handler
window.toggleSidebarAccordion = function(headerEl) {
  const accordion = headerEl.closest('.sidebar-accordion');
  if (!accordion) return;
  accordion.classList.toggle('collapsed');
  const arrow = headerEl.querySelector('.accordion-arrow');
  if (arrow) {
    arrow.textContent = accordion.classList.contains('collapsed') ? '▼' : '▲';
  }
};

// Global Font Family Change Handler
window.changeFontFamily = function(fontFamily, showToastMsg = false) {
  document.body.style.fontFamily = fontFamily;
  document.documentElement.style.setProperty('--font-sans', fontFamily);
  localStorage.setItem('ui_canvas_font', fontFamily);

  // Sync Select UI Dropdown
  const selectEl = document.getElementById('font-family-select');
  if (selectEl) selectEl.value = fontFamily;

  if (showToastMsg && window.showToast) {
    const fontName = fontFamily.split(',')[0].replace(/'/g, '').trim();
    window.showToast(`폰트 변경 완료: ${fontName}`);
  }
};

// Global Min Font Size Change Handler (Slider Supported, Default: 12px)
window.changeMinFontSize = function(fontSize, showToastMsg = false) {
  document.documentElement.style.setProperty('--min-font-size', fontSize);
  localStorage.setItem('ui_canvas_min_size', fontSize);

  // Sync Slider UI and Display Value Text
  const numericVal = parseInt(fontSize, 10) || 12;
  const sliderEl = document.getElementById('min-font-size-slider');
  const valueDisplayEl = document.getElementById('min-font-size-value');

  if (sliderEl) sliderEl.value = numericVal;
  if (valueDisplayEl) valueDisplayEl.textContent = `${numericVal}px`;

  if (showToastMsg && window.showToast) {
    window.showToast(`최소 글자 크기 변경 완료: ${numericVal}px`);
  }
};

// Initialize Font (Noto Sans KR Default + Saved Font) & Min Font Size (12px Default)
document.addEventListener('DOMContentLoaded', function() {
  // Load saved font or default to Noto Sans KR
  const savedFont = localStorage.getItem('ui_canvas_font') || "'Noto Sans KR', sans-serif";
  changeFontFamily(savedFont, false);

  // Load saved min font size or default to 12px
  const savedMinSize = localStorage.getItem('ui_canvas_min_size') || '12px';
  changeMinFontSize(savedMinSize, false);
});

// Global Toast helper
window.showToast = function(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'ui-toast';
  toast.innerHTML = `<span>💬</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
};

/* ==========================================================================
   Figma Canvas Application Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
  const canvasGrid = document.getElementById('canvas-grid');
  const layerTree = document.getElementById('layer-tree');
  const searchInput = document.getElementById('search-input');
  const tabBtns = document.querySelectorAll('.figma-tab-btn');
  const codeModal = window.CanvasCodeModal.create(document);

  const catalog = window.CanvasCatalog.create(window.ComponentModules);

  const params = new URLSearchParams(window.location.search);
  const componentId = params.get('component');
  const specimen = params.get('view') === 'specimen' && componentId;
  if (specimen) document.body.dataset.view = 'specimen';
  const state = { category: 'all', query: '', componentId };
  const renderer = window.CanvasRenderer.create({ canvasGrid, catalog, codeModal });

  // Render all modules into Canvas
  function initApp() {
    renderer.render(state);
    renderSidebar();
    setupEvents();
  }

  function renderSidebar() {
    layerTree.innerHTML = '';

    catalog.modules.forEach(mod => {

      const totalCount = catalog.components(mod).length;

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

  function setupEvents() {
    // Search filter
    searchInput.addEventListener('input', function(e) {
      state.query = e.target.value.trim();
      renderer.render(state);
    });

    // Category tabs
    tabBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.category = btn.getAttribute('data-category');
        renderer.render(state);

        // Sync sidebar active state
        document.querySelectorAll('.layer-item').forEach(item => {
          const target = item.getAttribute('data-target');
          item.classList.toggle('active', state.category === target);
        });

        // Scroll to top of viewport on tab switch
        const viewport = document.querySelector('.figma-canvas-viewport');
        if (viewport) {
          viewport.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

  }

  initApp();
  if (specimen && componentId === 'modal') window.openDemoModal();
});

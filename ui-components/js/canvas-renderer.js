(function () {
  window.CanvasRenderer = { create({ canvasGrid, catalog, codeModal }) {
  function render(state) {
    catalog.prepareRender();
    canvasGrid.innerHTML = '';

    catalog.modules.forEach(mod => {

      // Filter by category
      if (state.category !== 'all' && state.category !== mod.id) {
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
          const filtered = catalog.filter(group.components, state.query).filter(comp => !state.componentId || comp.id === state.componentId);

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
        const filtered = catalog.filter(mod.components, state.query).filter(comp => !state.componentId || comp.id === state.componentId);

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
          <p style="color:#aaa; font-size:13px;">일치하는 컴포넌트가 존재하지 않습니다.</p>
        </div>
      `;
      canvasGrid.querySelector('p').textContent = `'${state.query}' 와 일치하는 컴포넌트가 존재하지 않습니다.`;
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
      codeModal.open(comp.title, comp.code);
    });

    return card;
  }

    return { render };
  } };
})();

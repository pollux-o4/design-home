// Serialized into the standalone report. Keep all browser dependencies local.
export function initializeReport() {
  const element = id => document.getElementById(id);
  const side = element('side');
  const blend = element('blend');
  const partFilter = element('part-filter');
  const search = element('search');
  const allowed = element('allowed');

  function setMode(overlay) {
    element('screens').style.display = overlay ? 'none' : '';
    element('overlay').style.display = overlay ? 'block' : 'none';
    element('opacity-label').hidden = !overlay;
    side.setAttribute('aria-pressed', String(!overlay));
    blend.setAttribute('aria-pressed', String(overlay));
  }

  function updateSelection(part) {
    document.querySelectorAll('[data-region]').forEach(rect => {
      rect.setAttribute('visibility', part && rect.dataset.region === part ? 'visible' : 'hidden');
    });
    document.querySelectorAll('[data-select-part]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.selectPart === part));
    });
    element('clear-selection').hidden = !part;
    element('selection').textContent = part
      ? `선택 영역: ${part === '$root' ? '전체 박스' : part} · 파란 테두리`
      : '전체 영역 · 동일 배율 비교';
  }

  function filter() {
    const part = partFilter?.value || '';
    const query = search?.value.trim().toLowerCase() || '';
    let count = 0;
    document.querySelectorAll('tbody tr').forEach(row => {
      row.hidden = Boolean(
        (part && row.dataset.part !== part)
        || (!allowed?.checked && row.dataset.allowed === 'true')
        || (query && !row.textContent.toLowerCase().includes(query))
      );
      if (!row.hidden) count++;
    });
    if (element('row-count')) element('row-count').textContent = `${count}개`;
    if (element('no-results')) element('no-results').hidden = count !== 0;
    updateSelection(part);
  }

  function selectPart(part) {
    if (!partFilter) return;
    partFilter.value = part;
    search.value = '';
    filter();
  }

  side.addEventListener('click', () => setMode(false));
  blend.addEventListener('click', () => setMode(true));
  element('opacity').addEventListener('input', event => {
    element('candidate-overlay').style.opacity = event.target.value / 100;
    element('opacity-value').value = `${event.target.value}%`;
  });
  partFilter?.addEventListener('change', filter);
  search?.addEventListener('input', filter);
  allowed?.addEventListener('change', filter);
  document.querySelectorAll('[data-select-part]').forEach(button => {
    button.addEventListener('click', () => {
      selectPart(button.dataset.selectPart);
      element('visual').scrollIntoView({ block: 'start' });
      element('visual').focus({ preventScroll: true });
    });
  });
  element('clear-selection').addEventListener('click', () => {
    selectPart('');
    side.focus({ preventScroll: true });
  });
  if (partFilter) filter();
}

export const reportScript = `(${initializeReport.toString()})();`;

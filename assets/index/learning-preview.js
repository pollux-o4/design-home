const entries = [...document.querySelectorAll('.learning-entry')];
const states = entries.map((entry) => {
  const button = entry.querySelector('.preview-toggle');
  let hovered = false, focused = false, pinned = false, held = false, dismissed = false;
  let timer, hoverTimer, origin, pointerId;
  const render = () => {
    const playing = !dismissed && (hovered || focused || pinned || held);
    entry.classList.toggle('is-previewing', playing);
    button.setAttribute('aria-pressed', String(playing));
  };
  const reset = () => {
    clearTimeout(timer);
    clearTimeout(hoverTimer);
    hovered = focused = pinned = held = false;
    origin = undefined;
    pointerId = undefined;
    dismissed = false;
    render();
  };
  entry.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse') return;
    dismissed = false;
    hoverTimer = setTimeout(() => { hovered = true; render(); }, 160);
  });
  entry.addEventListener('pointerleave', () => { clearTimeout(hoverTimer); hovered = false; render(); });
  entry.addEventListener('focusin', (event) => {
    focused = event.target.matches('a');
    if (focused) dismissed = false;
    render();
  });
  entry.addEventListener('focusout', (event) => {
    if (entry.contains(event.relatedTarget)) return;
    focused = pinned = false;
    render();
  });
  entry.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' || !event.isPrimary) return;
    held = false;
    clearTimeout(timer);
    origin = { x: event.clientX, y: event.clientY };
    pointerId = event.pointerId;
    timer = setTimeout(() => { held = true; dismissed = false; render(); }, 400);
  });
  const cancelPress = () => { clearTimeout(timer); origin = undefined; };
  window.addEventListener('pointermove', (event) => {
    if (event.pointerId === pointerId && origin && Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 10) {
      cancelPress();
      held = false;
      render();
    }
  });
  window.addEventListener('pointercancel', (event) => {
    if (event.pointerId !== pointerId) return;
    cancelPress(); held = false; render();
  });
  window.addEventListener('pointerup', (event) => {
    if (event.pointerId !== pointerId) return;
    cancelPress();
    if (!entry.contains(event.target)) { held = false; render(); }
  });
  entry.addEventListener('contextmenu', (event) => { if (held || event.target.closest('button')) event.preventDefault(); });
  entry.addEventListener('click', (event) => {
    if (!held || event.target.closest('button')) return;
    event.preventDefault();
    pinned = true;
    held = false;
    render();
  });
  button.addEventListener('click', () => {
    clearTimeout(hoverTimer);
    pinned = held || !entry.classList.contains('is-previewing');
    held = false;
    dismissed = !pinned;
    render();
  });
  return { reset, dismiss() { reset(); dismissed = true; render(); } };
});

function translate() {
  const english = document.documentElement.lang === 'en';
  for (const entry of entries) {
    const title = entry.querySelector('h3').textContent;
    entry.querySelector('button').setAttribute('aria-label', english ? `${title}: toggle preview` : `${title}: 미리보기 재생·정지`);
    const note = entry.querySelector('.preview-note');
    note.textContent = english ? note.dataset.previewEn : note.dataset.previewKo;
  }
}
translate();
document.addEventListener('dh:language-change', translate);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') states.forEach((state) => state.dismiss());
});
document.addEventListener('pointerdown', (event) => {
  entries.forEach((entry, index) => { if (!entry.contains(event.target)) states[index].reset(); });
});
window.addEventListener('pagehide', () => states.forEach((state) => state.reset()));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) states.forEach((state) => state.reset());
});
const visibility = new IntersectionObserver((changes) => {
  for (const change of changes) {
    if (!change.isIntersecting) states[entries.indexOf(change.target)].reset();
  }
});
entries.forEach((entry) => visibility.observe(entry));

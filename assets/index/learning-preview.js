import { previewMotion } from './preview-motion.js';
import { previewSlides } from './preview-slides.js';

const entries = [...document.querySelectorAll('.learning-entry')];
let activePreview;
const states = entries.map((entry) => {
  const slides = previewSlides(entry);
  const { screen } = slides;
  entry.querySelector('a').append(screen);
  let hovered = false, focused = false, pinned = false, held = false, dismissed = false;
  let timer, hoverTimer, leaveTimer, origin, pointerId;
  const scheduleLeave = () => {
    if (leaveTimer) return;
    leaveTimer = setTimeout(() => { leaveTimer = undefined; hovered = false; render(); }, 80);
  };
  const movePreview = previewMotion(entry, screen, (inside) => {
    if (!inside) { scheduleLeave(); return; }
    clearTimeout(leaveTimer);
    leaveTimer = undefined;
    hovered = true;
    render();
  });
  const render = () => {
    const playing = !dismissed && (hovered || focused || pinned || held);
    if (playing) {
      if (activePreview?.entry !== entry) {
        for (const state of states) if (state.entry !== entry) state.reset();
      }
      activePreview = controller;
    } else if (activePreview?.entry === entry) activePreview = undefined;
    slides.show(playing, playing && (hovered || pinned || held));
    entry.classList.toggle('is-previewing', playing);
    screen.hidden = !playing;
    movePreview(playing);
  };
  const reset = () => {
    clearTimeout(timer);
    clearTimeout(hoverTimer);
    hoverTimer = undefined;
    clearTimeout(leaveTimer);
    leaveTimer = undefined;
    hovered = focused = pinned = held = false;
    origin = undefined;
    pointerId = undefined;
    dismissed = false;
    render();
  };
  function requestHover(event) {
    if (event.pointerType !== 'mouse' || dismissed || hovered || hoverTimer) return;
    hoverTimer = setTimeout(() => {
      hoverTimer = undefined;
      hovered = true;
      render();
    }, 160);
  }
  entry.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse') return;
    const switching = activePreview && activePreview.entry !== entry;
    if (switching) activePreview.reset();
    clearTimeout(leaveTimer);
    leaveTimer = undefined;
    dismissed = false;
    if (switching) { hovered = true; render(); return; }
    requestHover(event);
  });
  entry.addEventListener('pointermove', requestHover);
  entry.addEventListener('pointerleave', () => {
    clearTimeout(hoverTimer);
    hoverTimer = undefined;
    scheduleLeave();
  });
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
  entry.addEventListener('contextmenu', (event) => { if (held) event.preventDefault(); });
  entry.addEventListener('click', (event) => {
    if (!held) return;
    event.preventDefault();
    pinned = true;
    held = false;
    render();
  });
  const controller = {
    entry, reset,
    dismiss() { reset(); dismissed = true; render(); },
    scroll() {
      const keepFocus = focused && entry.contains(document.activeElement);
      reset();
      if (keepFocus) { focused = true; render(); }
    },
  };
  return controller;
});

function translate() {
  const english = document.documentElement.lang === 'en';
  for (const entry of entries) {
    const title = entry.querySelector('h3').textContent;
    entry.querySelector('.preview-screen-caption').textContent = english ? `${title} · Screen preview →` : `${title} · 실제 화면 미리보기 →`;
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
window.addEventListener('resize', () => states.forEach((state) => state.reset()));
window.addEventListener('scroll', () => states.forEach((state) => state.scroll()), { passive: true });

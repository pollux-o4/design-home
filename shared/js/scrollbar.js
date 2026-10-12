const mounted = new Map();
let nextId = 0;

export function mountScrollbar(region, { root = false } = {}) {
  if (mounted.has(region)) return mounted.get(region);
  if (!region.id) region.id = `dh-scroll-region-${++nextId}`;
  region.classList.add('dh-scroll-native');
  const axes = ['y', 'x'].map(axis => {
    const vertical = axis === 'y';
    const rail = document.createElement('div'), thumb = document.createElement('span');
    rail.className = 'dh-scroll-rail'; rail.dataset.axis = axis;
    if (root) rail.dataset.root = '';
    rail.tabIndex = 0; rail.setAttribute('role', 'scrollbar');
    rail.setAttribute('aria-controls', region.id);
    rail.setAttribute('aria-label', `${region.getAttribute('aria-label') ?? (root ? '페이지' : '영역')} ${vertical ? '세로' : '가로'} 스크롤`);
    rail.setAttribute('aria-orientation', vertical ? 'vertical' : 'horizontal');
    rail.setAttribute('aria-valuemin', '0');
    thumb.className = 'dh-scroll-thumb'; thumb.setAttribute('aria-hidden', 'true');
    rail.append(thumb); document.body.append(rail);
    let timer, drag, metrics;
    const position = () => vertical ? region.scrollTop : region.scrollLeft;
    function move(value) {
      const bounded = Math.max(0, Math.min(metrics.max, value));
      if (vertical) region.scrollTop = bounded; else region.scrollLeft = bounded;
      update(); reveal();
    }
    function reveal() {
      rail.classList.add('is-active'); clearTimeout(timer);
      timer = setTimeout(() => { if (!drag) rail.classList.remove('is-active'); }, 900);
    }
    function update() {
      const rect = root ? { top: 0, left: 0, width: innerWidth, height: innerHeight, right: innerWidth, bottom: innerHeight } : region.getBoundingClientRect();
      const visible = vertical ? (root ? innerHeight : region.clientHeight) : (root ? innerWidth : region.clientWidth);
      const total = vertical ? region.scrollHeight : region.scrollWidth;
      const length = Math.max(0, (vertical ? rect.height : rect.width) - 16);
      const size = Math.min(length, Math.max(32, length * visible / total));
      metrics = { max: Math.max(0, total - visible), length, size, travel: length - size };
      rail.hidden = metrics.max < 1 || length <= 0 || (!root && !region.getClientRects().length);
      rail.style.top = `${vertical ? rect.top + 8 : rect.bottom - 20}px`;
      rail.style.left = `${vertical ? rect.right - 20 : rect.left + 8}px`;
      rail.style[vertical ? 'height' : 'width'] = `${length}px`;
      const style = getComputedStyle(region);
      for (const property of ['--dh-scroll-ink', '--dh-scroll-layer']) {
        const value = style.getPropertyValue(property);
        if (value.trim()) rail.style.setProperty(property, value);
      }
      thumb.style[vertical ? 'height' : 'width'] = `${size}px`;
      thumb.style.transform = `translate${vertical ? 'Y' : 'X'}(${metrics.max ? position() / metrics.max * metrics.travel : 0}px)`;
      rail.setAttribute('aria-valuemax', String(Math.round(metrics.max)));
      rail.setAttribute('aria-valuenow', String(Math.round(position())));
    }
    const coordinate = event => vertical ? event.clientY : event.clientX;
    rail.addEventListener('pointerenter', reveal);
    rail.addEventListener('pointerleave', reveal);
    rail.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !metrics.max) return;
      event.preventDefault(); rail.focus({ preventScroll: true });
      if (!thumb.contains(event.target)) {
        const rect = rail.getBoundingClientRect();
        move((coordinate(event) - (vertical ? rect.top : rect.left) - metrics.size / 2) / metrics.travel * metrics.max);
      }
      drag = { start: coordinate(event), position: position() };
      rail.setPointerCapture(event.pointerId); rail.classList.add('is-dragging');
      document.documentElement.classList.add('dh-scroll-dragging'); reveal();
    });
    rail.addEventListener('pointermove', event => {
      if (drag && metrics.travel) move(drag.position + (coordinate(event) - drag.start) / metrics.travel * metrics.max);
    });
    function stopDrag() {
      drag = null; rail.classList.remove('is-dragging');
      document.documentElement.classList.remove('dh-scroll-dragging'); reveal();
    }
    rail.addEventListener('pointerup', stopDrag);
    rail.addEventListener('pointercancel', stopDrag);
    rail.addEventListener('lostpointercapture', stopDrag);
    rail.addEventListener('keydown', event => {
      const page = (vertical ? region.clientHeight : region.clientWidth) * .85;
      const deltas = vertical ? { ArrowDown: 40, ArrowUp: -40 } : { ArrowRight: 40, ArrowLeft: -40 };
      if (event.key === 'Home' || event.key === 'End' || event.key === 'PageDown' || event.key === 'PageUp' || Object.hasOwn(deltas, event.key)) {
        event.preventDefault();
        move(event.key === 'Home' ? 0 : event.key === 'End' ? metrics.max : position() + (event.key === 'PageDown' ? page : event.key === 'PageUp' ? -page : deltas[event.key]));
      }
    });
    return { update, reveal, dispose() { clearTimeout(timer); rail.remove(); } };
  });
  const update = () => axes.forEach(axis => axis.update());
  const onScroll = () => axes.forEach(axis => { axis.update(); axis.reveal(); });
  const target = root ? document : region;
  target.addEventListener('scroll', onScroll, { passive: true });
  const resize = new ResizeObserver(update); resize.observe(root ? document.body : region);
  if (!root && region.firstElementChild) resize.observe(region.firstElementChild);
  window.addEventListener('resize', update);
  document.addEventListener('scroll', update, { capture: true, passive: true });
  const handle = { update, dispose() {
    target.removeEventListener('scroll', onScroll); document.removeEventListener('scroll', update, true);
    window.removeEventListener('resize', update); resize.disconnect(); axes.forEach(axis => axis.dispose());
    region.classList.remove('dh-scroll-native'); mounted.delete(region);
  } };
  mounted.set(region, handle); update(); return handle;
}

function scan() {
  for (const [region, handle] of mounted) if (!region.isConnected) handle.dispose();
  if (!document.documentElement.hasAttribute('data-scroll-demo')) mountScrollbar(document.scrollingElement, { root: true });
  for (const region of document.querySelectorAll('[data-scroll-region]')) mountScrollbar(region);
  for (const handle of mounted.values()) handle.update();
}
let scheduled = false;
new MutationObserver(records => {
  if (!records.some(record => !record.target.closest?.('.dh-scroll-rail')) || scheduled) return;
  scheduled = true; requestAnimationFrame(() => { scheduled = false; scan(); });
}).observe(document.body, { childList: true, subtree: true });
scan();

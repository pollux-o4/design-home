export function previewMotion(entry, screen) {
  const desktop = matchMedia('(min-width: 641px) and (hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame, visible = false, x, y, targetX, targetY, last = 0;
  function paint(time) {
    const blend = reduced.matches ? 1 : 1 - Math.exp(-Math.min(time - last || 16, 32) / 65);
    last = time;
    const distance = targetX - x;
    x += distance * blend;
    y += (targetY - y) * blend;
    screen.style.setProperty('--preview-x', `${x}px`);
    screen.style.setProperty('--preview-y', `${y}px`);
    screen.style.setProperty('--preview-tilt', `${reduced.matches ? 0 : Math.max(-3, Math.min(3, distance / 18))}deg`);
    if (Math.abs(targetX - x) + Math.abs(targetY - y) > .3) frame = requestAnimationFrame(paint);
    else { frame = undefined; screen.style.setProperty('--preview-tilt', '0deg'); }
  }
  function track(event) {
    if (!desktop.matches || event?.target?.closest('.preview-screen')) return;
    const bounds = entry.getBoundingClientRect();
    const px = reduced.matches ? bounds.right - 30 : event?.clientX ?? bounds.right - 30;
    const py = reduced.matches ? bounds.top + bounds.height / 2 : event?.clientY ?? bounds.top + bounds.height / 2;
    const width = screen.offsetWidth, height = screen.offsetHeight;
    targetX = Math.max(20, Math.min(innerWidth - width - 20, px + width + 44 < innerWidth ? px + 24 : px - width - 24));
    targetY = Math.max(20, Math.min(innerHeight - height - 20, py - height / 2));
    if (!visible || x === undefined) { x = targetX; y = targetY; }
    if (visible && !frame) frame = requestAnimationFrame(paint);
  }
  entry.addEventListener('pointermove', (event) => { if (event.pointerType === 'mouse') track(event); });
  entry.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') track(event); });
  return (show) => {
    if (show === visible) return;
    visible = show;
    if (show) {
      if (targetX === undefined) track();
      if (desktop.matches && !frame) frame = requestAnimationFrame(paint);
    } else {
      cancelAnimationFrame(frame);
      frame = undefined;
      last = 0;
      x = y = targetX = targetY = undefined;
    }
  };
}

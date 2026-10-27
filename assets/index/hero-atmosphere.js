const background = document.querySelector('.hero-atmosphere');

if (background) {
  const hero = document.querySelector('.hero');
  const sparkles = hero.querySelector('.atmosphere-sparkles');
  // Stable positions avoid layout jumps while independent timings keep the light organic.
  for (let index = 0; index < 48; index += 1) {
    const dot = document.createElement('i');
    dot.style.setProperty('--x', `${3 + (index * 37 % 94)}%`);
    dot.style.setProperty('--y', `${8 + (index * 23 % 86)}%`);
    dot.style.setProperty('--size', `${1 + index % 3 * .5}px`);
    dot.style.setProperty('--duration', `${1.7 + index % 7 * .3}s`);
    dot.style.setProperty('--delay', `${-index % 9 * .4}s`);
    sparkles.append(dot);
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const pointer = background.querySelector('.atmosphere-pointer');
  let x = innerWidth / 2, y = innerHeight / 2;
  let targetX = x, targetY = y, frame = 0, lastTime = 0;
  const tick = time => {
    const elapsed = lastTime ? Math.min(time - lastTime, 64) : 16;
    lastTime = time;
    const blend = 1 - Math.exp(-elapsed / 110);
    x += (targetX - x) * blend;
    y += (targetY - y) * blend;
    pointer.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    frame = Math.abs(targetX - x) + Math.abs(targetY - y) > .4 ? requestAnimationFrame(tick) : 0;
    if (!frame) lastTime = 0;
  };
  const clearPointer = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    background.classList.remove('is-pointer-active');
  };
  const sync = () => {
    document.body.classList.toggle('is-motion-running', !document.hidden && !reduced.matches);
    if (document.hidden || reduced.matches || !fine.matches) clearPointer();
  };
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || document.hidden || reduced.matches || !fine.matches) return;
    targetX = event.clientX;
    targetY = event.clientY;
    background.classList.add('is-pointer-active');
    if (!frame) frame = requestAnimationFrame(tick);
  }, {passive: true});
  document.documentElement.addEventListener('pointerleave', clearPointer);
  window.addEventListener('blur', clearPointer);
  window.addEventListener('pagehide', clearPointer);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  fine.addEventListener('change', sync);
  new IntersectionObserver(([entry]) => hero.classList.toggle('is-title-visible', entry.isIntersecting)).observe(hero);
  sync();
}

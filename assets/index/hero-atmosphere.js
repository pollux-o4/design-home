const scene = document.querySelector('.hero-atmosphere');

if (scene) {
  const sparkles = scene.querySelector('.atmosphere-sparkles');
  // Deterministic positions keep refreshes stable; all animation ends within five seconds.
  for (let index = 0; index < 24; index += 1) {
    const dot = document.createElement('i');
    dot.style.setProperty('--x', `${12 + (index * 37 % 77)}%`);
    dot.style.setProperty('--y', `${18 + (index * 23 % 69)}%`);
    dot.style.setProperty('--delay', `${index % 4 * .1}s`);
    sparkles.append(dot);
  }
  let visible = false;
  const sync = () => scene.classList.toggle('is-visible', visible && !document.hidden);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(scene);
  document.addEventListener('visibilitychange', sync);
}

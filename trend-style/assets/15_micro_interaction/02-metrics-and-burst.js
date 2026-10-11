/* --------------------------------------------------------------------------
   4. COUNT-UP ANIMATION ENGINE
   -------------------------------------------------------------------------- */
function animateCountUp(el) {
  const target = parseFloat(el.getAttribute('data-target'));
  const prefix = el.getAttribute('data-prefix') || '';
  const suffix = el.getAttribute('data-suffix') || '';
  const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
  const duration = 1000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const currentValue = target * easeProgress;

    el.textContent = prefix + currentValue.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }) + suffix;

    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function triggerSkeletonLoad() {
  const cards = document.querySelectorAll('.widget-card, .card-glass');
  cards.forEach(c => c.classList.add('skeleton-loading'));

  setTimeout(() => {
    cards.forEach(c => c.classList.remove('skeleton-loading'));
    document.querySelectorAll('.count-up').forEach(animateCountUp);
  }, 350);
}

/* --------------------------------------------------------------------------
   5. PARTICLE BURST LIKE / BOOKMARK BUTTON
   -------------------------------------------------------------------------- */
function triggerBurst(btn, e) {
  e.stopPropagation();
  btn.classList.toggle('liked');

  const countEl = btn.querySelector('.like-count');
  let count = parseInt(countEl.textContent, 10);
  if (btn.classList.contains('liked')) {
    countEl.textContent = count + 1;

    // Spawn 10 micro particles
    const rect = btn.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
      const p = document.createElement('div');
      p.className = 'burst-particle';
      const angle = (i / 10) * Math.PI * 2;
      const dist = 25 + Math.random() * 20;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      const colors = ['#ec4899', '#38bdf8', '#f59e0b', '#10b981', '#6366f1'];
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = `${rect.left + rect.width / 2}px`;
      p.style.top = `${rect.top + rect.height / 2}px`;
      document.body.appendChild(p);

      p.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
      ], {
        duration: 600,
        easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }).onfinish = () => p.remove();
    }
  } else {
    countEl.textContent = count - 1;
  }
}

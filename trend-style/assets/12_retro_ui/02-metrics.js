/* ------------------------------------------
   4. COUNT-UP ANIMATION FOR METRICS
   ------------------------------------------ */
function animateValue(id, start, end, duration, prefix = '', suffix = '') {
  const obj = document.getElementById(id);
  if (!obj) return;
  let startTimestamp = null;

  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const currentVal = start + progress * (end - start);

    let formatted = '';
    if (end % 1 !== 0) {
      formatted = currentVal.toFixed(2);
    } else {
      formatted = Math.floor(currentVal).toLocaleString();
    }

    obj.textContent = prefix + formatted + suffix;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

function triggerCountUpAnimations() {
  const metrics = [
    { id: 'val-revenue', end: 128450, prefix: '$', suffix: '' },
    { id: 'val-users', end: 24592, prefix: '', suffix: '' },
    { id: 'val-conversion', end: 4.82, prefix: '', suffix: '%' },
    { id: 'val-latency', end: 14.2, prefix: '', suffix: ' ms' }
  ];

  metrics.forEach(m => {
    animateValue(m.id, 0, m.end, 800, m.prefix, m.suffix);
  });
}

/* ------------------------------------------
   5. TABS & SKELETON LOADING EFFECT
   ------------------------------------------ */
function switchModeTab(btnEl, mode) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btnEl.classList.add('active');
  playBeep(580, 0.05);

  triggerDataRefresh(mode);
}

function triggerDataRefresh(mode = 'default') {
  const metricsGrid = document.getElementById('metrics-grid');
  const originalHTML = metricsGrid.innerHTML;

  // Show Skeleton Loader State
  metricsGrid.innerHTML = `
    <div class="kpi-card skeleton-box" style="height: 90px;"></div>
    <div class="kpi-card skeleton-box" style="height: 90px;"></div>
    <div class="kpi-card skeleton-box" style="height: 90px;"></div>
    <div class="kpi-card skeleton-box" style="height: 90px;"></div>
  `;

  setTimeout(() => {
    metricsGrid.innerHTML = originalHTML;
    setupDragAndDrop();
    triggerCountUpAnimations();
    renderLineChart();
    renderBarChart();
    appendTerminalLog(`VIEW TAB SWITCHED: [${mode.toUpperCase()}]`);
  }, 350);
}

/* ==========================================================================
   5. DATA MODE TABS ([Daily] [Weekly] [Monthly]) & SKELETON LOADING
   ========================================================================== */
const datasets = {
  daily: {
    revenue: 12450,
    nodes: 1420,
    retention: 99.2,
    latency: 0.98,
    chart: [2100, 3400, 2800, 4500, 3900, 5200, 6100],
    dates: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
  },
  weekly: {
    revenue: 128450,
    nodes: 42890,
    retention: 98.4,
    latency: 1.24,
    chart: [18400, 24500, 21000, 32000, 28900, 39500, 42890],
    dates: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  },
  monthly: {
    revenue: 542000,
    nodes: 184500,
    retention: 97.8,
    latency: 1.45,
    chart: [85000, 112000, 145000, 168000, 195000, 240000, 310000],
    dates: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL']
  }
};

let currentMode = 'weekly';

function switchDataTab(mode, btnElement) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btnElement.classList.add('active');
  currentMode = mode;

  triggerDataRefresh();
}

function triggerDataRefresh() {
  const grid = id => document.getElementById(id);

  // Add Skeleton loader effect
  document.querySelectorAll('.kpi-card').forEach(card => card.classList.add('skeleton'));

  setTimeout(() => {
    document.querySelectorAll('.kpi-card').forEach(card => card.classList.remove('skeleton'));

    const data = datasets[currentMode];

    // Count Up animations
    animateCountUp('kpi-revenue', 0, data.revenue, '$');
    animateCountUp('kpi-nodes', 0, data.nodes, '');
    animateCountUp('kpi-retention', 0, data.retention, '', '%');
    animateCountUp('kpi-latency', 0, data.latency, '', 's');

    // Re-render chart
    renderLineChart();
  }, 450);
}

/* ==========================================================================
   6. COUNT-UP ANIMATION UTILITY
   ========================================================================== */
function animateCountUp(elementId, start, end, prefix = '', suffix = '', duration = 1000) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const startTime = performance.now();
  const isFloat = end.toString().includes('.');

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // EaseOutExpo curve
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const currentVal = start + (end - start) * easeProgress;

    if (isFloat) {
      el.innerText = prefix + currentVal.toFixed(2) + suffix;
    } else {
      el.innerText = prefix + Math.floor(currentVal).toLocaleString() + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

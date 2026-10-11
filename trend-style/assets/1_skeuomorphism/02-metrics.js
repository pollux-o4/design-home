// 5. Count-Up Metric Animation Function
function animateCountUp(el, duration = 800) {
  const target = parseFloat(el.getAttribute('data-target'));
  const prefix = el.getAttribute('data-prefix') || '';
  const suffix = el.getAttribute('data-suffix') || '';
  const isFloat = target % 1 !== 0;

  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const current = progress * target;

    if (isFloat) {
      el.textContent = prefix + current.toFixed(2) + suffix;
    } else {
      el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
    }

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Trigger initial count-up on load
document.querySelectorAll('.kpi-value').forEach(el => animateCountUp(el));

// 6. View Mode Tabs & Date Selector (with Skeleton Loading Effect)
const tabs = document.querySelectorAll('.tab-btn');
const kpiCards = document.querySelectorAll('.kpi-card');

function reloadDashboardData() {
  skeuoAudio.playClick();

  // Add Skeleton Loading class
  kpiCards.forEach(card => card.classList.add('skeleton'));

  setTimeout(() => {
    // Modify data targets randomly for view switch simulation
    const revEl = document.getElementById('valRevenue');
    const subEl = document.getElementById('valSubscribers');
    const convEl = document.getElementById('valConversion');
    const latEl = document.getElementById('valLatency');

    const multiplier = 0.8 + Math.random() * 0.6;
    revEl.setAttribute('data-target', Math.floor(128450 * multiplier));
    subEl.setAttribute('data-target', Math.floor(24890 * multiplier));
    convEl.setAttribute('data-target', (4.82 * multiplier).toFixed(2));
    latEl.setAttribute('data-target', Math.floor(35 + Math.random() * 10));

    kpiCards.forEach(card => card.classList.remove('skeleton'));
    document.querySelectorAll('.kpi-value').forEach(el => animateCountUp(el));
  }, 450);
}

tabs.forEach(tab => {
  tab.addEventListener('click', (e) => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    reloadDashboardData();
  });
});

document.getElementById('dateRangeSelect').addEventListener('change', reloadDashboardData);

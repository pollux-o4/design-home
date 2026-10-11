// 4. Tab Switcher with Skeleton Loading & Count-Up Animation
// --------------------------------------------------------------------------
function switchDataTab(mode, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    triggerDataRefresh();
}

function triggerDataRefresh() {
    const container = document.getElementById('dashboardContent');
    container.classList.add('is-loading');

    setTimeout(() => {
        container.classList.remove('is-loading');

        // Generate subtle metric variation based on mode
        const randomMult = 0.85 + Math.random() * 0.4;
        animateKPI('kpi-revenue', Math.round(128450 * randomMult), '$');
        animateKPI('kpi-users', Math.round(24892 * randomMult), '');
        animateKPI('kpi-aov', parseFloat((482.10 * (0.95 + Math.random() * 0.1)).toFixed(2)), '$');
        animateKPI('kpi-conv', parseFloat((4.38 * (0.9 + Math.random() * 0.2)).toFixed(2)), '', '%');

        // Update Chart paths randomly
        refreshChartData();
    }, 450);
}

// Smooth Count-Up Animation
function animateKPI(elementId, targetValue, prefix = '', suffix = '') {
    const el = document.getElementById(elementId);
    if (!el) return;

    const startValue = 0;
    const duration = 800; // ms
    const startTime = performance.now();

    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out quad
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        const currentValue = startValue + (targetValue - startValue) * easeProgress;

        if (suffix === '%') {
            el.innerText = prefix + currentValue.toFixed(2) + suffix;
        } else if (prefix === '$') {
            el.innerText = prefix + Math.round(currentValue).toLocaleString();
        } else {
            el.innerText = prefix + Math.round(currentValue).toLocaleString() + suffix;
        }

        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }

    requestAnimationFrame(updateNumber);
}

// --------------------------------------------------------------------------

/* Count-up Animation for Metrics */
function animateValue(id, start, end, duration, prefix = '', suffix = '') {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        obj.textContent = prefix + current.toLocaleString() + suffix;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

/* Initial Count-up on Load */
window.addEventListener('DOMContentLoaded', () => {
    triggerCountUp();
    initDragAndDrop();
    initChartInteractions();
});

function triggerCountUp(multiplier = 1) {
    animateValue("kpiValue1", 0, Math.round(128450 * multiplier), 1000, "$");
    animateValue("kpiValue2", 0, Math.round(42890 * multiplier), 1000, "$");
    animateValue("kpiValue3", 0, Math.round(3.84 * multiplier), 1000, "", "%");
    animateValue("kpiValue4", 0, Math.round(14290 * multiplier), 1000, "");
}

/* View Mode Tabs Switcher & Skeleton Loader Effect */
function switchDataTab(button, mode) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Apply Skeleton Loader effect
    const kpiValues = document.querySelectorAll('.kpi-value');
    kpiValues.forEach(el => el.classList.add('skeleton'));

    setTimeout(() => {
        kpiValues.forEach(el => el.classList.remove('skeleton'));
        let multiplier = mode === 'daily' ? 0.2 : mode === 'weekly' ? 0.6 : 1.0;
        triggerCountUp(multiplier);
    }, 500);
}

function handleDateRangeChange(val) {
    let mult = val === 'today' ? 0.15 : val === 'week' ? 0.6 : val === 'month' ? 1.0 : 4.5;
    switchDataTab(document.querySelector('.tab-btn.active'), val);
}

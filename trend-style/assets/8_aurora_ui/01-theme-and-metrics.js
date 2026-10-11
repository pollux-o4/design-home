// ----------------------------------------------------
// 1. Theme Switcher Logic (6 Versions)
// ----------------------------------------------------
const themeSwitcher = document.getElementById('themeSwitcher');
themeSwitcher.addEventListener('change', (e) => {
    document.body.classList.remove('v1-nordic', 'v2-dawn', 'v3-cyber', 'v4-emerald', 'v5-mono', 'v6-pastel');
    document.body.classList.add(e.target.value);
    triggerCountUp();
    showToast(`Theme switched to: ${e.target.options[e.target.selectedIndex].text}`);
});

// ----------------------------------------------------
// 2. Count-Up Animation for Metrics
// ----------------------------------------------------
function animateValue(obj, start, end, duration, prefix = '', suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // EaseOutQuad
        const current = Math.floor(progress * (2 - progress) * (end - start) + start);

        if (end > 100) {
            obj.innerHTML = prefix + current.toLocaleString() + suffix;
        } else {
            const decimal = (progress * (end - start) + start).toFixed(2);
            obj.innerHTML = prefix + decimal + suffix;
        }

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function triggerCountUp() {
    document.querySelectorAll('.kpi-value').forEach(el => {
        const val = parseFloat(el.getAttribute('data-value'));
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        animateValue(el, 0, val, 1200, prefix, suffix);
    });
}

window.addEventListener('DOMContentLoaded', triggerCountUp);

// ----------------------------------------------------

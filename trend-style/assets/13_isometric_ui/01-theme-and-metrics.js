/* ==========================================================================
   1. THEME SWITCHER (6 DISTINCT VISUAL VARIATIONS)
   ========================================================================== */
function setTheme(themeName, btnElement) {
    document.body.setAttribute('data-theme', themeName);

    // Update active state on buttons
    document.querySelectorAll('.theme-switcher-group .theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if(btnElement) btnElement.classList.add('active');

    // Trigger smooth count-up refresh when switching themes
    triggerMetricAnimation();
}

/* ==========================================================================
   2. 3D ANGLE VIEW CONTROL SWITCHER
   ========================================================================== */
function setAngle(angleMode, btnElement) {
    document.body.classList.remove('angle-flat', 'angle-subtle');
    if (angleMode === 'flat') {
        document.body.classList.add('angle-flat');
    } else if (angleMode === 'subtle') {
        document.body.classList.add('angle-subtle');
    }

    document.querySelectorAll('.angle-switcher .angle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if(btnElement) btnElement.classList.add('active');
}

/* ==========================================================================
   3. COUNT-UP ANIMATION FOR NUMBERS
   ========================================================================== */
function animateNumber(element, start, end, duration, prefix = '', suffix = '', decimals = 0) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // Ease Out Expo function for silky smooth deceleration
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = start + (end - start) * easeProgress;

        element.innerText = prefix + (decimals > 0 ? currentVal.toFixed(decimals) : Math.round(currentVal).toLocaleString()) + suffix;

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function triggerMetricAnimation() {
    document.querySelectorAll('.kpi-metric-number').forEach(el => {
        const target = parseFloat(el.getAttribute('data-target')) || 0;
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const decimals = parseInt(el.getAttribute('data-decimals')) || 0;

        animateNumber(el, 0, target, 1200, prefix, suffix, decimals);
    });
}

/* ==========================================================================
   4. DATA MODE TABS & SKELETON LOADING EFFECT
   ========================================================================== */
function switchDataTab(mode, btnElement) {
    // Update active tab button
    document.querySelectorAll('.mode-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');

    // Apply Skeleton Loading state to cards
    const cards = document.querySelectorAll('.iso-card');
    cards.forEach(card => card.classList.add('loading'));

    setTimeout(() => {
        // Update target numbers based on tab selection
        const multiplier = mode === 'Daily' ? 0.2 : mode === 'Weekly' ? 1 : 4.5;

        document.getElementById('metric-revenue').setAttribute('data-target', Math.round(128450 * multiplier));
        document.getElementById('metric-users').setAttribute('data-target', Math.round(3842 * multiplier));

        // Remove loading and re-trigger animation
        cards.forEach(card => card.classList.remove('loading'));
        triggerMetricAnimation();
    }, 600);
}

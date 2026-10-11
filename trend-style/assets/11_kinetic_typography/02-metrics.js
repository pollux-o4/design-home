// 3. Count-Up Animation for Metric Numbers
// --------------------------------------------------
function animateCountUp(element) {
    const target = parseFloat(element.getAttribute('data-target'));
    const prefix = element.getAttribute('data-prefix') || '';
    const suffix = element.getAttribute('data-suffix') || '';
    const decimals = parseInt(element.getAttribute('data-decimals') || '0', 10);

    const duration = 1200; // ms
    const startTime = performance.now();

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out quad formula
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentVal = target * easeProgress;

        element.innerText = prefix + currentVal.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }) + suffix;

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

// Run Count-Up on Load
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.count-up').forEach(el => animateCountUp(el));
    setupChartTooltips();
    setupDragAndDrop();
});

// --------------------------------------------------
// 4. Data View Mode Tabs & Skeleton Loader Effect
// --------------------------------------------------
function switchDataTab(mode, btn) {
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Apply Skeleton Loader Shimmer to cards & charts
    const cards = document.querySelectorAll('.kpi-card, .chart-card');
    cards.forEach(card => card.classList.add('skeleton'));

    setTimeout(() => {
        cards.forEach(card => card.classList.remove('skeleton'));

        // Refresh values based on mode
        const values = {
            daily: [18450.00, 680, 5.12, 0.85],
            weekly: [128450.00, 4890, 4.85, 1.12],
            monthly: [542000.00, 18400, 4.62, 1.45]
        };

        const currentSet = values[mode] || values.weekly;
        const kpiEls = document.querySelectorAll('.kpi-value');

        kpiEls.forEach((el, index) => {
            if (currentSet[index] !== undefined) {
                el.setAttribute('data-target', currentSet[index]);
                animateCountUp(el);
            }
        });

        showToast(`Loaded ${mode.toUpperCase()} analytics view`);
    }, 450);
}

function handleDateChange(val) {
    showToast(`Filter applied: ${val}`);
}

// --------------------------------------------------

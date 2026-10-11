// Theme Switcher Engine
const themeBtns = document.querySelectorAll('.theme-btn');
const body = document.body;

themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        body.setAttribute('data-theme', target);
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Re-trigger count-up animations on theme switch for delight
        animateMetrics();
    });
});

// Material Ripple Click Effect
document.addEventListener('click', function(e) {
    const target = e.target.closest('.md-ripple');
    if (target) {
        const rect = target.getBoundingClientRect();
        const circle = document.createElement('span');
        const diameter = Math.max(rect.width, rect.height);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - radius}px`;
        circle.style.top = `${e.clientY - rect.top - radius}px`;
        circle.classList.add('ripple-effect');

        const existingRipple = target.querySelector('.ripple-effect');
        if (existingRipple) existingRipple.remove();

        target.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
    }
});

// Accordion Toggle
function toggleAccordion(headerEl) {
    const item = headerEl.parentElement;
    const isOpen = item.classList.contains('open');

    // Optionally close other accordions
    document.querySelectorAll('.nav-item').forEach(el => {
        if(el !== item) el.classList.remove('open');
    });

    if (isOpen) {
        item.classList.remove('open');
    } else {
        item.classList.add('open');
    }
}

// Dropdown Handlers
function toggleDropdown(id) {
    const el = document.getElementById(id);
    const isOpen = el.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) el.classList.add('open');
}

const closeAllDropdowns = DesignExampleInteractions.closeDropdowns;

document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown')) {
        closeAllDropdowns();
    }
});

function selectDate(label) {
    document.getElementById('selectedDateLabel').innerText = label;
    closeAllDropdowns();
    triggerSkeletonAndRefresh();
}

// Live Sync Toggle Switch
function handleSyncToggle(checkbox) {
    const badge = document.getElementById('syncStatusBadge');
    if (checkbox.checked) {
        badge.innerHTML = `<span class="dot-pulse"></span> SYNCED`;
        badge.style.background = 'rgba(46, 125, 50, 0.15)';
        badge.style.color = '#2E7D32';
    } else {
        badge.innerHTML = `PAUSED`;
        badge.style.background = 'rgba(237, 108, 2, 0.15)';
        badge.style.color = '#ED6C02';
    }
}

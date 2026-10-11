/* ==========================================================================
   BRUTALISM DASHBOARD INTERACTIVE ENGINE
   ========================================================================== */

// 1. VERSION / THEME SWITCHER LOGIC
const versionBtns = document.querySelectorAll('.version-btn');
versionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        versionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const themeVal = btn.getAttribute('data-v');
        document.body.setAttribute('data-theme', themeVal);
        triggerToast(`THEME CHANGED TO: ${btn.innerText}`);
    });
});

// 2. ACCORDION SIDEBAR TOGGLE
function toggleAccordion(headerEl) {
    const accordionContent = headerEl.nextElementSibling;
    const iconEl = headerEl.querySelector('.accordion-icon');
    const isActive = headerEl.classList.contains('active');

    if (isActive) {
        headerEl.classList.remove('active');
        accordionContent.classList.remove('show');
        iconEl.innerText = '+';
    } else {
        headerEl.classList.add('active');
        accordionContent.classList.add('show');
        iconEl.innerText = '−';
    }
}

function setActiveNav(itemEl) {
    document.querySelectorAll('.sub-nav-item').forEach(el => el.classList.remove('active'));
    itemEl.classList.add('active');
    triggerToast(`NAVIGATED TO: ${itemEl.innerText.replace('▸ ', '')}`);
}

// 3. DROPDOWN TOGGLES
function toggleDropdown(menuId) {
    const menu = document.getElementById(menuId);
    const isVisible = menu.classList.contains('show');

    // Close all dropdowns first
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));

    if (!isVisible) {
        menu.classList.add('show');
    }
}

// Close dropdowns when clicking outside
window.addEventListener('click', (e) => {
    if (!e.target.closest('.brutal-dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
    }
});

function selectDateRange(rangeText) {
    document.getElementById('selectedDateText').innerText = rangeText;
    triggerToast(`DATE RANGE UPDATED: ${rangeText}`);

    // Trigger skeleton loading and count-up reload
    refreshDashboardData();
}

// 4. TOGGLE SWITCHES
function toggleSwitch(toggleEl, labelText) {
    toggleEl.classList.toggle('on');
    const isOn = toggleEl.classList.contains('on');
    triggerToast(`${labelText}: ${isOn ? 'ENABLED' : 'DISABLED'}`);
}

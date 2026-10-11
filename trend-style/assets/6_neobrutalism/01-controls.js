/* --------------------------------------------------------------------------
   1. VERSION SWITCHER ENGINE (6 THEMES)
   -------------------------------------------------------------------------- */
function switchTheme(themeId) {
    document.documentElement.setAttribute('data-theme', themeId);

    // Update Active Switcher Button
    document.querySelectorAll('.version-btn').forEach((btn, idx) => {
        if (idx + 1 === themeId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    showToast(`THEME VARIANT ${themeId} ACTIVATED ⚡`);
}

/* --------------------------------------------------------------------------
   2. ACCORDION SIDEBAR LOGIC
   -------------------------------------------------------------------------- */
function toggleAccordion(button) {
    const item = button.parentElement;
    item.classList.toggle('open');
}

function selectNav(element) {
    document.querySelectorAll('.nav-list a').forEach(a => a.classList.remove('active'));
    element.classList.add('active');
}

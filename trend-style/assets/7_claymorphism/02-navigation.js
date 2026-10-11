/* --------------------------------------------------------------------------
   4. ACCORDION NAVIGATION TOGGLE
   -------------------------------------------------------------------------- */
function toggleAccordion(headerEl) {
    const parentGroup = headerEl.parentElement;
    const isOpen = parentGroup.classList.contains('open');

    // Close all other open groups
    document.querySelectorAll('.nav-accordion-group').forEach(group => {
        group.classList.remove('open');
        group.querySelector('.nav-item-header').classList.remove('active');
    });

    if (!isOpen) {
        parentGroup.classList.add('open');
        headerEl.classList.add('active');
    }
}

/* --------------------------------------------------------------------------
   5. DROPDOWN TOGGLES (DATE & PROFILE)
   -------------------------------------------------------------------------- */
function toggleDropdown(wrapperId) {
    const wrapper = document.getElementById(wrapperId);
    const isCurrentlyActive = wrapper.classList.contains('active');

    // Close all dropdowns first
    document.querySelectorAll('.clay-dropdown-wrapper').forEach(dw => dw.classList.remove('active'));

    if (!isCurrentlyActive) {
        wrapper.classList.add('active');
    }
}

function selectDateRange(rangeText) {
    document.getElementById('selected-date-text').innerText = rangeText;
    document.getElementById('date-dropdown-wrapper').classList.remove('active');
    switchViewMode(document.querySelector('.tab-btn.active'), currentMode);
}

// Close dropdowns on clicking outside
window.addEventListener('click', function(e) {
    if (!e.target.closest('.clay-dropdown-wrapper')) {
        document.querySelectorAll('.clay-dropdown-wrapper').forEach(dw => dw.classList.remove('active'));
    }
});

/* --------------------------------------------------------------------------
   6. LIVE SYNC TOGGLE
   -------------------------------------------------------------------------- */
function toggleLiveSync() {
    const track = document.getElementById('sync-toggle-track');
    const label = track.nextElementSibling;
    track.classList.toggle('active');

    if (track.classList.contains('active')) {
        label.innerText = 'Live Sync ON';
        showToast('Live Sync Activated ⚡');
    } else {
        label.innerText = 'Live Sync OFF';
        showToast('Live Sync Paused');
    }
}

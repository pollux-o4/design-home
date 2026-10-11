/* ==========================================================================
   1. THEME SWITCHER CONTROLLER (6 DISTINCT BIOMORPHIC THEMES)
   ========================================================================== */
function switchTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);

  // Update Active State on Switcher Buttons
  document.querySelectorAll('.theme-btn').forEach(btn => {
    if (btn.getAttribute('data-target') === themeName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Redraw SVG line chart to refresh stroke & gradient colors dynamically
  setTimeout(renderLineChart, 100);
}

/* ==========================================================================
   2. ACCORDION SIDEBAR CONTROLLER
   ========================================================================== */
function toggleAccordion(element) {
  const parentItem = element.parentElement;
  const isCurrentlyOpen = parentItem.classList.contains('open');

  // Close other accordion items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('open');
  });

  // Toggle clicked item
  if (!isCurrentlyOpen) {
    parentItem.classList.add('open');
  }
}

/* ==========================================================================
   3. LIVING BLOBS TOGGLE (ANIMATION PAUSE/RESUME)
   ========================================================================== */
function toggleLivingBlobs(toggleInput) {
  if (toggleInput.checked) {
    document.body.classList.remove('paused-blobs');
  } else {
    document.body.classList.add('paused-blobs');
  }
}

/* ==========================================================================
   4. DROPDOWN MENUS & DATE RANGE SELECTOR
   ========================================================================== */
function toggleDropdown(menuId) {
  const dropdown = document.getElementById(menuId);
  const isOpen = dropdown.classList.contains('show');

  // Close all dropdowns
  document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));

  if (!isOpen) {
    dropdown.classList.add('show');
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.dropdown-container')) {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
  }
});

function changeDateRange(rangeText) {
  document.getElementById('selectedDateLabel').innerText = rangeText;
  document.querySelectorAll('#dateDropdown .dropdown-option').forEach(opt => {
    opt.classList.remove('selected');
    if (opt.innerText === rangeText) opt.classList.add('selected');
  });

  // Trigger data tab update simulation with skeleton loading
  triggerDataRefresh();
}

function selectProfile(element, profileName) {
  document.querySelectorAll('#profileDropdown .dropdown-option').forEach(opt => opt.classList.remove('selected'));
  element.classList.add('selected');
  document.querySelector('.profile-name').innerText = profileName;
}

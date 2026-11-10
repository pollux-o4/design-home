/* ==========================================================================
   Theme Switcher & Glass Accent Handlers
   ========================================================================== */
function switchTheme(themeName) {
  document.body.setAttribute("data-theme", themeName);

  document.querySelectorAll(".switcher-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-theme-target") === themeName) {
      btn.classList.add("active");
    }
  });
}

/* ==========================================================================
   Accordion Menu Toggle
   ========================================================================== */
function toggleAccordion(itemId) {
  const targetItem = document.getElementById(itemId);
  const isOpen = targetItem.classList.contains("open");

  document.querySelectorAll(".accordion-item").forEach((item) => {
    item.classList.remove("open");
  });

  if (!isOpen) {
    targetItem.classList.add("open");
  }
}

/* ==========================================================================
   Dropdown Switchers (Profile & Date Range)
   ========================================================================== */
function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  const isOpen = dropdown.classList.contains("open");

  document.querySelectorAll(".dropdown").forEach((d) => d.classList.remove("open"));

  if (!isOpen) {
    dropdown.classList.add("open");
  }
}

// Close dropdowns when clicking outside
window.addEventListener("click", function (e) {
  if (!e.target.closest(".dropdown")) {
    document.querySelectorAll(".dropdown").forEach((d) => d.classList.remove("open"));
  }
});

function selectProfile(name) {
  document.getElementById("selectedProfile").innerText = name;
  document.querySelectorAll("#profileDropdown .dropdown-item").forEach((item) => {
    item.classList.toggle("selected", item.innerText.includes(name));
  });
}

function selectDateRange(range) {
  document.getElementById("selectedDateRange").innerText = range;
  document.querySelectorAll("#dateDropdown .dropdown-item").forEach((item) => {
    item.classList.toggle("selected", item.innerText.includes(range));
  });
  triggerSkeletonReload();
}

/* ==========================================================================
   Live Sync Toggle
   ========================================================================== */
let liveSyncActive = true;
function toggleLiveSync() {
  liveSyncActive = !liveSyncActive;
  const toggle = document.getElementById("liveSyncToggle");
  const pulse = document.getElementById("syncPulse");
  const text = document.getElementById("syncText");

  if (liveSyncActive) {
    toggle.classList.add("checked");
    pulse.classList.remove("off");
    text.innerText = "Live Telemetry";
  } else {
    toggle.classList.remove("checked");
    pulse.classList.add("off");
    text.innerText = "Sync Paused";
  }
}

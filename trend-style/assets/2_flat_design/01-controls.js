// --------------------------------------------------------------------------
// 1. Theme Switcher Logic
// --------------------------------------------------------------------------
function switchTheme(versionClass) {
  document.body.className = "theme-" + versionClass;
  const buttons = document.querySelectorAll(".version-btn");
  buttons.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-version") === versionClass.replace("v", "")) {
      btn.classList.add("active");
    }
  });
}

// --------------------------------------------------------------------------
// 2. Accordion Navigation Logic
// --------------------------------------------------------------------------
function toggleAccordion(header) {
  const item = header.parentElement;
  const isOpen = item.classList.contains("open");

  // Close all items if desired or toggle current
  item.classList.toggle("open");
}

// --------------------------------------------------------------------------
// 3. Dropdown Menu Handlers
// --------------------------------------------------------------------------
function toggleDropdown(id) {
  const dropdown = document.getElementById(id);
  const isOpen = dropdown.classList.contains("open");
  closeAllDropdowns();
  if (!isOpen) {
    dropdown.classList.add("open");
  }
}

const closeAllDropdowns = DesignExampleInteractions.closeDropdowns;

window.addEventListener("click", function (e) {
  if (!e.target.closest(".dropdown")) {
    closeAllDropdowns();
  }
});

function selectDateRange(rangeLabel) {
  document.getElementById("selectedDateLabel").innerText = rangeLabel;
  closeAllDropdowns();
  triggerDataRefresh();
}

// --------------------------------------------------------------------------

// --------------------------------------------------
// 1. Theme Switcher (6 Kinetic Variations)
// --------------------------------------------------
function switchTheme(themeId) {
  document.body.setAttribute("data-theme", themeId);
  document.documentElement.setAttribute("data-theme", themeId);

  // Update active switcher button
  document.querySelectorAll(".version-btn").forEach((btn, idx) => {
    if (idx + 1 === themeId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  showToast(`Switched to Kinetic Style V${themeId}`);
}

// --------------------------------------------------
// 2. Accordion Sidebar Submenus
// --------------------------------------------------
function toggleAccordion(id) {
  const clickedItem = document.getElementById(id);
  const isOpen = clickedItem.classList.contains("open");

  // Close all
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("open");
  });

  // Toggle clicked
  if (!isOpen) {
    clickedItem.classList.add("open");
  }
}

// --------------------------------------------------

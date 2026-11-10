// --------------------------------------------------------------------------
// 1. TOP-RIGHT 6-VERSION THEME SWITCHER
// --------------------------------------------------------------------------
const vButtons = document.querySelectorAll(".v-btn");
const themePillName = document.getElementById("themePillName");
const currentThemeBadge = document.getElementById("currentThemeBadge");

const themeNames = {
  v1: "1. Cyber Neon",
  v2: "2. OLED Mint",
  v3: "3. Solar Gold",
  v4: "4. Synth Crimson",
  v5: "5. GitHub Slate",
  v6: "6. Tactical Lime",
};

vButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    vButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const theme = btn.getAttribute("data-theme");
    if (theme === "v1") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }

    const tName = themeNames[theme] || "1. Cyber Neon";
    themePillName.textContent = tName;
    currentThemeBadge.textContent = tName;

    // Re-trigger countup & chart node update
    triggerCountUp();
  });
});

// --------------------------------------------------------------------------
// 2. ACCORDION SIDEBAR SUB-MENUS
// --------------------------------------------------------------------------
function toggleAccordion(headerBtn) {
  const currentItem = headerBtn.closest(".accordion-item");
  const isOpen = currentItem.classList.contains("open");

  // Close all items
  document.querySelectorAll(".accordion-item").forEach((item) => {
    item.classList.remove("open");
    item.querySelector(".accordion-header").classList.remove("active");
  });

  // Open clicked item if it wasn't open
  if (!isOpen) {
    currentItem.classList.add("open");
    headerBtn.classList.add("active");
  }
}

// --------------------------------------------------------------------------
// 3. DROPDOWN CONTROLS (Date & Profile)
// --------------------------------------------------------------------------
function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  const isShown = dropdown.classList.contains("show");

  // Close all dropdowns
  document.querySelectorAll(".dropdown-menu").forEach((menu) => menu.classList.remove("show"));

  if (!isShown) {
    dropdown.classList.add("show");
  }
}

function selectDateRange(label) {
  document.getElementById("selectedDateLabel").textContent = label;
  document.querySelectorAll("#dateDropdown .dropdown-item").forEach((item) => {
    item.classList.toggle("active", item.textContent.trim() === label);
  });
  triggerSkeletonAndRefresh();
}

// Close dropdowns on outside click
window.addEventListener("click", (e) => {
  if (!e.target.closest(".dropdown")) {
    document.querySelectorAll(".dropdown-menu").forEach((menu) => menu.classList.remove("show"));
  }
});

// --------------------------------------------------------------------------

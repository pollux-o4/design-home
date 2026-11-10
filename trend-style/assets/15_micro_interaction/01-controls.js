/* --------------------------------------------------------------------------
   1. THEME SWITCHER LOGIC (V1 - V6)
   -------------------------------------------------------------------------- */
function setTheme(themeKey) {
  document.body.className = `theme-${themeKey}`;

  // Update active button state
  document.querySelectorAll(".v-btn").forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  // Trigger count-up animation and chart refresh
  triggerSkeletonLoad();

  // Quantum particle canvas trigger if V4
  if (themeKey === "v4") {
    initQuantumCanvas();
  }
}

/* --------------------------------------------------------------------------
   2. ACCORDION SIDEBAR LOGIC
   -------------------------------------------------------------------------- */
function toggleAccordion(triggerBtn) {
  const item = triggerBtn.parentElement;
  const isOpen = item.classList.contains("open");

  document.querySelectorAll(".accordion-item").forEach((acc) => acc.classList.remove("open"));
  if (!isOpen) {
    item.classList.add("open");
  }
}

/* --------------------------------------------------------------------------
   3. DROPDOWNS & DATE SELECTOR
   -------------------------------------------------------------------------- */
function toggleDropdown(id) {
  const el = document.getElementById(id);
  const isOpen = el.classList.contains("open");
  document.querySelectorAll(".dropdown-wrapper").forEach((d) => d.classList.remove("open"));
  if (!isOpen) el.classList.add("open");
}

window.addEventListener("click", (e) => {
  if (!e.target.closest(".dropdown-wrapper")) {
    document.querySelectorAll(".dropdown-wrapper").forEach((d) => d.classList.remove("open"));
  }
});

function selectDateRange(rangeText) {
  document.getElementById("selectedDateText").textContent = rangeText;
  document.querySelectorAll("#dateDropdown .dropdown-item").forEach((item) => {
    item.classList.toggle("active", item.textContent === rangeText);
  });
  triggerSkeletonLoad();
}

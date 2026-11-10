/* ==========================================================================
   5. ACCORDION NAVIGATION & PROFILE DROPDOWN
   ========================================================================== */
function toggleAccordion(headerElement) {
  const group = headerElement.parentElement;
  group.classList.toggle("open");
}

function selectNavItem(itemElement) {
  document.querySelectorAll(".nav-sub-item").forEach((el) => el.classList.remove("active"));
  itemElement.classList.add("active");
}

function toggleProfileDropdown() {
  const dd = document.getElementById("profileDropdown");
  dd.classList.toggle("open");
}

function switchUser(name, role, initials) {
  document.querySelector(".user-name").innerText = name;
  document.querySelector(".user-role").innerText = role + " ▾";
  document.querySelector(".avatar-box").innerText = initials;
  showToast(`Switched workspace user to ${name}`);
}

/* Date Selector Dropdown */
function toggleDateSelect() {
  document.getElementById("dateDropdown").classList.toggle("open");
}

function selectDateRange(range) {
  document.getElementById("currentDateRange").innerText = range;
  document.getElementById("dateDropdown").classList.remove("open");
  switchDataTab(range === "Today" ? "Daily" : "Weekly");
}

// Close dropdowns on document click
document.addEventListener("click", (e) => {
  if (!e.target.closest(".user-profile-badge")) {
    document.getElementById("profileDropdown").classList.remove("open");
  }
  if (!e.target.closest(".custom-select-wrap")) {
    document.getElementById("dateDropdown").classList.remove("open");
  }
});

/* Theme Switcher */
function switchTheme(theme) {
  document.body.setAttribute("data-theme", theme);
}

/* Profile Dropdown Toggle */
function toggleProfileDropdown(e) {
  e.stopPropagation();
  const dropdown = document.getElementById("profileDropdown");
  dropdown.classList.toggle("show");
}

function selectWorkspace(name) {
  document.querySelector(".profile-meta .name").textContent = name;
}

window.addEventListener("click", () => {
  document.getElementById("profileDropdown").classList.remove("show");
});

/* Accordion Menu Handler */
function toggleAccordion(header) {
  const item = header.parentElement;
  const isOpen = item.classList.contains("open");

  // Optional: close other accordions
  document.querySelectorAll(".accordion-item").forEach((el) => el.classList.remove("open"));
  document.querySelectorAll(".accordion-header").forEach((el) => el.classList.remove("active"));

  if (!isOpen) {
    item.classList.add("open");
    header.classList.add("active");
  }
}

/* Toggle Switches */
function toggleSwitch(toggleEl) {
  toggleEl.classList.toggle("active");
}

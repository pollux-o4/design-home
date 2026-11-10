// 5. Accordion Navigation Sidebar
// ----------------------------------------------------
document.querySelectorAll(".nav-header").forEach((header) => {
  header.addEventListener("click", () => {
    const navItem = header.parentElement;
    navItem.classList.toggle("open");
  });
});

// ----------------------------------------------------
// 6. Dropdowns Toggle
// ----------------------------------------------------
document.querySelectorAll(".dropdown").forEach((dropdown) => {
  const btn = dropdown.querySelector(".select-btn");
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("active");
  });
});

window.addEventListener("click", () => {
  document.querySelectorAll(".dropdown").forEach((d) => d.classList.remove("active"));
});

function selectDate(val) {
  document.getElementById("selectedDate").innerText = val;
  showToast(`Filter applied: ${val}`);
}

// ----------------------------------------------------

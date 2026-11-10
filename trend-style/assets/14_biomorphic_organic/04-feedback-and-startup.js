/* ==========================================================================
   9. MODAL SLIDE-OVER POPUP ("+ NEW PROJECT")
   ========================================================================== */
DesignExampleInteractions.installModal("newProjectModal", "active");

function closeModalOnBackdrop(e) {
  if (e.target === document.getElementById("newProjectModal")) {
    closeModal();
  }
}

function handleProjectSubmit(e) {
  e.preventDefault();
  closeModal();
  alert("Bio-Project Initialized Successfully! New telemetric node registered.");
}

// Keyboard ESC to close Modal
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeModal();
});

/* ==========================================================================
   10. INITIALIZATION ON DOM LOAD
   ========================================================================== */
window.addEventListener("DOMContentLoaded", () => {
  renderLineChart();
  initDragAndDrop();

  // Trigger initial count up
  animateCountUp("kpi-revenue", 0, 128450, "$");
  animateCountUp("kpi-nodes", 0, 42890, "");
  animateCountUp("kpi-retention", 0, 98.4, "", "%");
  animateCountUp("kpi-latency", 0, 1.24, "", "s");
});

// Handle Window Resize for Responsive SVG Charting
window.addEventListener("resize", () => {
  renderLineChart();
});

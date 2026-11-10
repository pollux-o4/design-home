/* --------------------------------------------------------------------------
   9. SLIDE-OVER MODAL POPUP ENGINE
   -------------------------------------------------------------------------- */
DesignExampleInteractions.installModal("modal-overlay", "active");

function closeModalOnBackdrop(e) {
  if (e.target.id === "modal-overlay") {
    closeModal();
  }
}

function selectPriority(pillEl) {
  document.querySelectorAll(".priority-pill").forEach((p) => p.classList.remove("selected"));
  pillEl.classList.add("selected");
}

function handleProjectSubmit(e) {
  e.preventDefault();
  closeModal();
  showToast("🚀 New Project Launched Successfully!");
  // Re-trigger metric count up
  runAllCountUps(currentMode);
}

/* --------------------------------------------------------------------------
   10. TOAST NOTIFICATION ENGINE
   -------------------------------------------------------------------------- */
function showToast(message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.innerHTML = `<span>✨</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 50);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* --------------------------------------------------------------------------
   INITIALIZATION ON LOAD
   -------------------------------------------------------------------------- */
window.addEventListener("DOMContentLoaded", () => {
  runAllCountUps("weekly");
  initDragAndDrop();
  initChartInteractivity();
});

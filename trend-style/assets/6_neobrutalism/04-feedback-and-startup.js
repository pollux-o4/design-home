/* --------------------------------------------------------------------------
   7. MODAL SLIDE-OVER & TOAST LOGIC
   -------------------------------------------------------------------------- */
DesignExampleInteractions.installModal("projectModal", "active");

function handleBackdropClick(e) {
  if (e.target.id === "projectModal") {
    closeModal();
  }
}

function selectColorBadge(element) {
  document.querySelectorAll(".color-badge").forEach((b) => b.classList.remove("selected"));
  element.classList.add("selected");
}

function submitNewProject(e) {
  e.preventDefault();
  const name = document.getElementById("projectNameInput").value;
  closeModal();
  showToast(`PROJECT "${name.toUpperCase()}" CREATED! 🚀`);
  document.getElementById("projectNameInput").value = "";
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* --------------------------------------------------------------------------
   8. INITIALIZATION ON DOM READY
   -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  triggerMetricCountUp();
  initChartTooltips();
  initDragAndDrop();
});

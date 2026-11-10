/* ==========================================================================
   Modal Slide-Over Handler ("+ New Project")
   ========================================================================== */
DesignExampleInteractions.installModal("projectModal", "active");

function handleFormSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById("btnDeploy");
  btn.innerHTML = "Deploying...";

  setTimeout(() => {
    btn.innerHTML = "<span>Deploy Project</span>";
    closeModal();
    showToast("🚀 Project deployed to Edge network successfully!");
  }, 650);
}

function showToast(message) {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast-glass";
  toast.innerHTML = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ==========================================================================
   On Load Initialization
   ========================================================================== */
window.addEventListener("DOMContentLoaded", () => {
  runAllCountUps();
});

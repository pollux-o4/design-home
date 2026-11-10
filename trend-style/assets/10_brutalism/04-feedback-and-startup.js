// 8. MODAL SLIDE-OVER ENGINE
DesignExampleInteractions.installModal("projectModal", "open");

function submitProject() {
  const projName = document.getElementById("projNameInput").value || "PROJECT_ALPHA";
  closeModal();
  triggerToast(`🚀 PROJECT CREATED: ${projName.toUpperCase()}`);
}

// 9. TOAST NOTIFICATION ENGINE
function triggerToast(message) {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "brutal-toast";
  toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.2s ease";
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}

// INITIALIZATION ON LOAD
window.addEventListener("DOMContentLoaded", () => {
  triggerKPIAnimations("monthly");
  attachChartHoverListeners();
});

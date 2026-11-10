/* ------------------------------------------
   8. MODAL SLIDE-OVER DIALOG
   ------------------------------------------ */
function openModal() {
  const backdrop = document.getElementById("modal-backdrop");
  backdrop.classList.add("open");
  playBeep(800, 0.12, "triangle");
  appendTerminalLog("EXECUTING NEW_PROJECT_WIZARD.EXE...");
}

function closeModal() {
  const backdrop = document.getElementById("modal-backdrop");
  backdrop.classList.remove("open");
  playBeep(300, 0.08);
}

function submitProject() {
  const name = document.getElementById("proj-name").value;
  const budget = document.getElementById("proj-budget").value;
  closeModal();
  appendTerminalLog(`PROJECT CREATED: ${name} (BUDGET: $${budget})`);
  alert(`SUCCESS: Project ${name} initialized in 14.4k Baud Network!`);
}

/* ------------------------------------------
   9. TERMINAL LOGS FEED HELPER
   ------------------------------------------ */
function appendTerminalLog(msg) {
  const box = document.getElementById("terminal-logs");
  if (!box) return;
  const time = new Date().toTimeString().split(" ")[0];
  const div = document.createElement("div");
  div.className = "terminal-line";
  div.innerHTML = `<span class="terminal-prompt">C:\\></span> [${time}] ${msg}`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

/* ------------------------------------------
   10. INITIALIZATION
   ------------------------------------------ */
window.addEventListener("DOMContentLoaded", () => {
  triggerCountUpAnimations();
  renderLineChart();
  renderBarChart();
  setupDragAndDrop();

  // Periodically add simulated log
  setInterval(() => {
    const events = [
      "PING 127.0.0.1: 1ms OK",
      "PACKET RECEIVED FROM NODE #09",
      "DB HEALTH CHECK PASSED",
      "CACHE FLUSH COMPLETED",
    ];
    const randomEvt = events[Math.floor(Math.random() * events.length)];
    appendTerminalLog(randomEvt);
  }, 12000);
});

/* ==========================================================================
   6. INTERACTIVE SVG CHART TOOLTIPS
   ========================================================================== */
function showTooltip(evt, dateLabel, valLabel) {
  const tooltip = document.getElementById("chartTooltip");
  document.getElementById("tooltipDate").innerText = dateLabel;
  document.getElementById("tooltipValue").innerText = valLabel;

  const rect = evt.currentTarget.getBoundingClientRect();
  const containerRect = document.querySelector(".chart-container").getBoundingClientRect();

  tooltip.style.left = rect.left - containerRect.left + rect.width / 2 + "px";
  tooltip.style.top = rect.top - containerRect.top + "px";
  tooltip.classList.add("active");
}

function hideTooltip() {
  document.getElementById("chartTooltip").classList.remove("active");
}

/* ==========================================================================
   7. DRAG AND DROP CAPABILITY (KPI CARDS & KANBAN)
   ========================================================================== */
let draggedItem = null;

document.querySelectorAll(".kpi-card, .task-item").forEach((item) => {
  item.addEventListener("dragstart", (e) => {
    draggedItem = item;
    setTimeout(() => item.classList.add("dragging"), 0);
  });

  item.addEventListener("dragend", () => {
    draggedItem.classList.remove("dragging");
    draggedItem = null;
  });
});

const kpiGrid = document.getElementById("kpiGrid");
kpiGrid.addEventListener("dragover", (e) => {
  e.preventDefault();
  const afterElement = getDragAfterElement(kpiGrid, e.clientX);
  if (draggedItem && draggedItem.classList.contains("kpi-card")) {
    if (afterElement == null) {
      kpiGrid.appendChild(draggedItem);
    } else {
      kpiGrid.insertBefore(draggedItem, afterElement);
    }
  }
});

const getDragAfterElement = DesignExampleInteractions.dragAfter;

function toggleTaskCompletion(taskItem) {
  taskItem.classList.toggle("completed");
}

/* ==========================================================================
   8. SIDEBAR TOGGLE SWITCHES
   ========================================================================== */
function toggleLiveSync(toggleEl) {
  const syncText = document.getElementById("syncText");
  if (toggleEl.checked) {
    syncText.innerText = "LIVE STREAMING ACTIVE";
    showToast("Live Data Stream Enabled");
  } else {
    syncText.innerText = "SYNC PAUSED";
    showToast("Live Data Stream Paused");
  }
}

function toggleHoverLift(toggleEl) {
  if (!toggleEl.checked) {
    document.querySelectorAll(".iso-card").forEach((c) => (c.style.transform = "none"));
  } else {
    document.querySelectorAll(".iso-card").forEach((c) => (c.style.transform = ""));
  }
}

// 7. Draggable KPI Widgets Logic (HTML5 Drag & Drop)
const grid = document.getElementById("kpiGrid");
let draggedItem = null;

grid.addEventListener("dragstart", (e) => {
  if (e.target.classList.contains("kpi-card")) {
    draggedItem = e.target;
    e.target.classList.add("dragging");
    skeuoAudio.playClick();
  }
});

grid.addEventListener("dragend", (e) => {
  if (draggedItem) {
    draggedItem.classList.remove("dragging");
    draggedItem = null;
  }
});

grid.addEventListener("dragover", (e) => {
  e.preventDefault();
  const afterElement = getDragAfterElement(grid, e.clientX);
  if (draggedItem) {
    if (afterElement == null) {
      grid.appendChild(draggedItem);
    } else {
      grid.insertBefore(draggedItem, afterElement);
    }
  }
});

const getDragAfterElement = DesignExampleInteractions.dragAfter;

// 8. Line Chart Interactive Tooltip
const nodes = document.querySelectorAll(".chart-node");
const tooltip = document.getElementById("lineTooltip");
const ttTitle = document.getElementById("ttTitle");
const ttVal = document.getElementById("ttVal");

nodes.forEach((node) => {
  node.addEventListener("mouseenter", (e) => {
    skeuoAudio.playClick();
    const label = node.getAttribute("data-label");
    const val = node.getAttribute("data-val");
    ttTitle.textContent = label;
    ttVal.textContent = val;

    const rect = node.getBoundingClientRect();
    const containerRect = document.querySelector(".svg-container").getBoundingClientRect();

    tooltip.style.left = rect.left - containerRect.left + 5 + "px";
    tooltip.style.top = rect.top - containerRect.top + "px";
    tooltip.classList.add("visible");
  });

  node.addEventListener("mouseleave", () => {
    tooltip.classList.remove("visible");
  });
});

// 9. Bar Chart Interactive Tooltip
const barItems = document.querySelectorAll(".chart-bar-item");
const barTooltip = document.getElementById("barTooltip");
const barTtTitle = document.getElementById("barTtTitle");
const barTtVal = document.getElementById("barTtVal");

barItems.forEach((item) => {
  item.addEventListener("mouseenter", (e) => {
    skeuoAudio.playClick();
    const region = item.getAttribute("data-region");
    const val = item.getAttribute("data-val");
    barTtTitle.textContent = region;
    barTtVal.textContent = val;

    const rect = item.getBoundingClientRect();
    const containerRect = item.closest(".svg-container").getBoundingClientRect();

    barTooltip.style.left = rect.left - containerRect.left + rect.width / 2 + "px";
    barTooltip.style.top = rect.top - containerRect.top + 20 + "px";
    barTooltip.classList.add("visible");
  });

  item.addEventListener("mouseleave", () => {
    barTooltip.classList.remove("visible");
  });
});

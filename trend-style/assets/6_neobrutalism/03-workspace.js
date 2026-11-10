/* --------------------------------------------------------------------------
   5. INTERACTIVE SVG CHART TOOLTIPS (HOVER EVENT HANDLERS)
   -------------------------------------------------------------------------- */
function initChartTooltips() {
  // Line Chart Tooltip
  const lineNodes = document.querySelectorAll("#chartNodesGroup .chart-node");
  const lineTooltip = document.getElementById("lineTooltip");
  const lineContainer = document.getElementById("lineChartContainer");

  lineNodes.forEach((node) => {
    node.addEventListener("mouseenter", (e) => {
      const date = node.getAttribute("data-date");
      const rev = node.getAttribute("data-rev");
      const traffic = node.getAttribute("data-traffic");

      lineTooltip.innerHTML = `<strong>${date}</strong>: ${rev} | 👥 ${traffic}`;
      lineTooltip.classList.add("visible");

      // Position Tooltip
      const rect = node.getBoundingClientRect();
      const containerRect = lineContainer.getBoundingClientRect();
      const x = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top;

      lineTooltip.style.left = `${x}px`;
      lineTooltip.style.top = `${y}px`;
    });

    node.addEventListener("mouseleave", () => {
      lineTooltip.classList.remove("visible");
    });
  });

  // Bar Chart Tooltip
  const bars = document.querySelectorAll("#barSvg .chart-bar");
  const barTooltip = document.getElementById("barTooltip");
  const barContainer = document.getElementById("barChartContainer");

  bars.forEach((bar) => {
    bar.addEventListener("mouseenter", () => {
      const channel = bar.getAttribute("data-channel");
      const share = bar.getAttribute("data-share");

      barTooltip.innerHTML = `<strong>${channel}</strong>: ${share}`;
      barTooltip.classList.add("visible");

      const rect = bar.getBoundingClientRect();
      const containerRect = barContainer.getBoundingClientRect();
      const x = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top;

      barTooltip.style.left = `${x}px`;
      barTooltip.style.top = `${y}px`;
    });

    bar.addEventListener("mouseleave", () => {
      barTooltip.classList.remove("visible");
    });
  });
}

/* --------------------------------------------------------------------------
   6. DRAG AND DROP CAPABILITY FOR DASHBOARD WIDGETS
   -------------------------------------------------------------------------- */
function initDragAndDrop() {
  const draggables = document.querySelectorAll(".draggable-card");
  const kpiGrid = document.getElementById("kpiGrid");

  let draggedItem = null;

  draggables.forEach((draggable) => {
    draggable.addEventListener("dragstart", (e) => {
      draggedItem = draggable;
      setTimeout(() => draggable.classList.add("dragging"), 0);
    });

    draggable.addEventListener("dragend", () => {
      draggedItem = null;
      draggables.forEach((d) => d.classList.remove("dragging", "drag-over"));
    });

    draggable.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (draggedItem && draggedItem !== draggable) {
        draggable.classList.add("drag-over");
      }
    });

    draggable.addEventListener("dragleave", () => {
      draggable.classList.remove("drag-over");
    });

    draggable.addEventListener("drop", (e) => {
      e.preventDefault();
      draggable.classList.remove("drag-over");

      if (draggedItem && draggedItem !== draggable) {
        // Swap DOM elements
        const parent = draggable.parentNode;
        const draggedIndex = Array.from(parent.children).indexOf(draggedItem);
        const targetIndex = Array.from(parent.children).indexOf(draggable);

        if (draggedIndex < targetIndex) {
          parent.insertBefore(draggedItem, draggable.nextSibling);
        } else {
          parent.insertBefore(draggedItem, draggable);
        }

        showToast("WIDGET REORDERED 🔄");
      }
    });
  });
}

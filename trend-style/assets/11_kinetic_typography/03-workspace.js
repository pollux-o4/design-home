// 5. Dynamic SVG Chart Tooltips
// --------------------------------------------------
function setupChartTooltips() {
  const tooltip = document.getElementById("chart-tooltip");
  const tooltipDate = document.getElementById("tooltip-date");
  const tooltipVal = document.getElementById("tooltip-val");
  const container = document.getElementById("svg-chart-wrapper");

  document.querySelectorAll(".chart-node, .bar-group").forEach((node) => {
    node.addEventListener("mouseenter", (e) => {
      const date = node.getAttribute("data-date");
      const val = node.getAttribute("data-val");

      tooltipDate.innerText = date;
      tooltipVal.innerText = val;

      const rect = container.getBoundingClientRect();
      let x, y;

      if (node.tagName === "circle") {
        const cx = parseFloat(node.getAttribute("cx"));
        const cy = parseFloat(node.getAttribute("cy"));
        // Scale coordinates from viewBox 700x240 to container size
        x = (cx / 700) * rect.width;
        y = (cy / 240) * rect.height;
      } else {
        const eventRect = e.target.getBoundingClientRect();
        x = eventRect.left - rect.left + eventRect.width / 2;
        y = eventRect.top - rect.top;
      }

      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
      tooltip.classList.add("visible");
    });

    node.addEventListener("mouseleave", () => {
      tooltip.classList.remove("visible");
    });
  });
}

// --------------------------------------------------
// 6. Draggable Grid (HTML5 Drag & Drop)
// --------------------------------------------------
function setupDragAndDrop() {
  const grid = document.getElementById("draggable-grid");
  let draggedCard = null;

  grid.querySelectorAll(".kpi-card").forEach((card) => {
    card.addEventListener("dragstart", (e) => {
      draggedCard = card;
      card.style.opacity = "0.4";
      e.dataTransfer.effectAllowed = "move";
    });

    card.addEventListener("dragend", () => {
      card.style.opacity = "1";
      draggedCard = null;
    });

    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    card.addEventListener("drop", (e) => {
      e.preventDefault();
      if (draggedCard && draggedCard !== card) {
        const allCards = Array.from(grid.querySelectorAll(".kpi-card"));
        const draggedIdx = allCards.indexOf(draggedCard);
        const targetIdx = allCards.indexOf(card);

        if (draggedIdx < targetIdx) {
          card.after(draggedCard);
        } else {
          card.before(draggedCard);
        }
      }
    });
  });
}

// --------------------------------------------------

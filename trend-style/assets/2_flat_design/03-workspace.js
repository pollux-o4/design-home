// 5. Interactive Chart Hover & Dynamics
// --------------------------------------------------------------------------
function handleChartMouseMove(e) {
  const svg = document.getElementById("mainSvgChart");
  const tooltip = document.getElementById("chartTooltip");
  const guide = document.getElementById("chartGuide");
  const rect = svg.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;

  // Find closest node
  const nodes = document.querySelectorAll(".chart-node");
  let closestNode = null;
  let minDistance = Infinity;

  nodes.forEach((node) => {
    const cx = (parseFloat(node.getAttribute("cx")) / 600) * rect.width;
    const dist = Math.abs(mouseX - cx);
    if (dist < minDistance) {
      minDistance = dist;
      closestNode = node;
    }
  });

  if (closestNode) {
    const month = closestNode.getAttribute("data-month");
    const val = closestNode.getAttribute("data-val");
    const cx = (parseFloat(closestNode.getAttribute("cx")) / 600) * rect.width;
    const cy = (parseFloat(closestNode.getAttribute("cy")) / 240) * rect.height;

    guide.setAttribute("x1", closestNode.getAttribute("cx"));
    guide.setAttribute("x2", closestNode.getAttribute("cx"));
    guide.style.opacity = "1";

    tooltip.style.display = "block";
    tooltip.style.left = cx + "px";
    tooltip.style.top = cy + "px";
    tooltip.innerText = `${month}: ${val}`;
  }
}

function handleChartMouseLeave() {
  document.getElementById("chartTooltip").style.display = "none";
  document.getElementById("chartGuide").style.opacity = "0";
}

function refreshChartData() {
  const p1 = document.getElementById("chartPath1");
  const p2 = document.getElementById("chartPath2");

  // Generate randomized SVG path points
  const yPoints1 = Array.from({ length: 7 }, () => Math.floor(40 + Math.random() * 140));
  const yPoints2 = Array.from({ length: 7 }, () => Math.floor(50 + Math.random() * 130));

  const xCoords = [40, 130, 220, 310, 400, 490, 580];

  let d1 = `M ${xCoords[0]} ${yPoints1[0]}`;
  let d2 = `M ${xCoords[0]} ${yPoints2[0]}`;

  for (let i = 1; i < 7; i++) {
    d1 += ` L ${xCoords[i]} ${yPoints1[i]}`;
    d2 += ` L ${xCoords[i]} ${yPoints2[i]}`;
  }

  p1.setAttribute("d", d1);
  p2.setAttribute("d", d2);

  // Update Node attributes
  const nodes = document.querySelectorAll(".chart-node");
  nodes.forEach((node, idx) => {
    node.setAttribute("cy", yPoints1[idx]);
    const newVal = "$" + Math.floor((200 - yPoints1[idx]) * 750).toLocaleString();
    node.setAttribute("data-val", newVal);
  });
}

// --------------------------------------------------------------------------
// 6. Draggable Widget Capability (HTML5 Drag & Drop)
// --------------------------------------------------------------------------
let draggedElement = null;

function handleDragStart(e) {
  draggedElement = e.currentTarget;
  e.dataTransfer.effectAllowed = "move";
  e.currentTarget.style.opacity = "0.5";
}

function handleDragOver(e) {
  if (e.preventDefault) e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  e.currentTarget.classList.add("drag-over");
  return false;
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove("drag-over");
}

function handleDrop(e) {
  if (e.stopPropagation) e.stopPropagation();
  e.currentTarget.classList.remove("drag-over");

  if (draggedElement && draggedElement !== e.currentTarget) {
    // Swap HTML contents
    const tempHTML = draggedElement.innerHTML;
    draggedElement.innerHTML = e.currentTarget.innerHTML;
    e.currentTarget.innerHTML = tempHTML;
  }
  return false;
}

function handleDragEnd(e) {
  e.currentTarget.style.opacity = "1";
  document
    .querySelectorAll(".draggable-card")
    .forEach((card) => card.classList.remove("drag-over"));
}

// --------------------------------------------------------------------------

/* ==========================================================================
   7. INTERACTIVE SVG SMOOTH CUBIC BEZIER CHART
   ========================================================================== */
function renderLineChart() {
  const data = datasets[currentMode].chart;
  const dates = datasets[currentMode].dates;

  const svg = document.getElementById('lineChartSvg');
  const linePath = document.getElementById('chartLinePath');
  const areaPath = document.getElementById('chartAreaPath');
  const pointsGroup = document.getElementById('chartPointsGroup');

  const width = 800;
  const height = 280;
  const padding = 40;

  const maxVal = Math.max(...data) * 1.15;
  const minVal = 0;

  // Compute X, Y coordinates
  const coords = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - padding * 2);
    return { x, y, val, date: dates[idx] };
  });

  // Generate Smooth Cubic Bezier Path ("M ... C ...")
  let dLine = `M ${coords[0].x},${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i];
    const next = coords[i + 1];
    const cp1x = curr.x + (next.x - curr.x) / 2;
    const cp1y = curr.y;
    const cp2x = curr.x + (next.x - curr.x) / 2;
    const cp2y = next.y;
    dLine += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
  }

  linePath.setAttribute('d', dLine);

  // Closed Area Path
  const dArea = `${dLine} L ${coords[coords.length - 1].x},${height - padding} L ${coords[0].x},${height - padding} Z`;
  areaPath.setAttribute('d', dArea);

  // Render interactive points
  pointsGroup.innerHTML = '';
  coords.forEach((pt) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', pt.x);
    circle.setAttribute('cy', pt.y);
    circle.setAttribute('r', '5');
    circle.setAttribute('fill', 'var(--card-bg)');
    circle.setAttribute('stroke', 'var(--chart-line)');
    circle.setAttribute('stroke-width', '3');
    circle.setAttribute('class', 'chart-point');

    // Hover Tooltip Handlers
    circle.addEventListener('mouseenter', (e) => showTooltip(e, pt));
    circle.addEventListener('mouseleave', hideTooltip);

    pointsGroup.appendChild(circle);
  });
}

function showTooltip(e, pt) {
  const tooltip = document.getElementById('chartTooltip');
  const container = document.getElementById('lineChartContainer');
  const rect = container.getBoundingClientRect();

  const formatVal = typeof pt.val === 'number' && pt.val > 1000 ? '$' + pt.val.toLocaleString() : pt.val;

  document.getElementById('ttDate').innerText = pt.date;
  document.getElementById('ttVal').innerText = formatVal;

  // Position tooltip inside container
  const posX = (pt.x / 800) * rect.width;
  const posY = (pt.y / 280) * rect.height;

  tooltip.style.left = posX + 'px';
  tooltip.style.top = posY + 'px';
  tooltip.classList.add('show');
}

function hideTooltip() {
  document.getElementById('chartTooltip').classList.remove('show');
}

/* ==========================================================================
   8. DRAGGABLE KANBAN / WIDGET GRID (DRAG & DROP)
   ========================================================================== */
let draggedItem = null;

function initDragAndDrop() {
  const cards = document.querySelectorAll('.kpi-card');
  const grid = document.getElementById('kpiGrid');

  cards.forEach(card => {
    card.addEventListener('dragstart', function(e) {
      draggedItem = this;
      setTimeout(() => this.classList.add('dragging'), 0);
    });

    card.addEventListener('dragend', function() {
      this.classList.remove('dragging');
      draggedItem = null;
    });

    card.addEventListener('dragover', function(e) {
      e.preventDefault();
    });

    card.addEventListener('drop', function(e) {
      e.preventDefault();
      if (this !== draggedItem && draggedItem) {
        const allCards = Array.from(grid.children);
        const draggedIdx = allCards.indexOf(draggedItem);
        const targetIdx = allCards.indexOf(this);

        if (draggedIdx < targetIdx) {
          grid.insertBefore(draggedItem, this.nextSibling);
        } else {
          grid.insertBefore(draggedItem, this);
        }
      }
    });
  });
}

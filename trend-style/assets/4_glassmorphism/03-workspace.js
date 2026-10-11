/* ==========================================================================
   Interactive SVG Chart Hover Tooltip
   ========================================================================== */
const svgChart = document.getElementById('mainSvg');
const crosshair = document.getElementById('crosshair');
const tooltip = document.getElementById('chartTooltip');
const tooltipDate = document.getElementById('tooltipDate');
const tooltipVal = document.getElementById('tooltipVal');
const chartNodes = document.querySelectorAll('.chart-node');

chartNodes.forEach(node => {
  node.addEventListener('mouseenter', (e) => {
    const cx = node.getAttribute('cx');
    const date = node.getAttribute('data-date');
    const val = node.getAttribute('data-val');

    crosshair.setAttribute('x1', cx);
    crosshair.setAttribute('x2', cx);
    crosshair.style.opacity = '1';

    tooltipDate.innerText = date;
    tooltipVal.innerText = val;

    const containerRect = document.getElementById('chartContainer').getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const relativeX = nodeRect.left - containerRect.left + 6;
    const relativeY = nodeRect.top - containerRect.top;

    tooltip.style.left = `${relativeX}px`;
    tooltip.style.top = `${relativeY}px`;
    tooltip.classList.add('visible');
  });

  node.addEventListener('mouseleave', () => {
    crosshair.style.opacity = '0';
    tooltip.classList.remove('visible');
  });
});

/* ==========================================================================
   HTML5 Drag and Drop Reordering (KPI Cards)
   ========================================================================== */
const kpiGrid = document.getElementById('kpiGrid');
let dragItem = null;

kpiGrid.addEventListener('dragstart', (e) => {
  if (e.target.classList.contains('kpi-card')) {
    dragItem = e.target;
    e.target.classList.add('dragging');
  }
});

kpiGrid.addEventListener('dragend', (e) => {
  if (e.target.classList.contains('kpi-card')) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.kpi-card').forEach(c => c.classList.remove('drag-over'));
    dragItem = null;
  }
});

kpiGrid.addEventListener('dragover', (e) => {
  e.preventDefault();
  const targetCard = e.target.closest('.kpi-card');
  if (targetCard && targetCard !== dragItem) {
    targetCard.classList.add('drag-over');
    const rect = targetCard.getBoundingClientRect();
    const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
    kpiGrid.insertBefore(dragItem, next && targetCard.nextSibling || targetCard);
  }
});

kpiGrid.addEventListener('dragleave', (e) => {
  const targetCard = e.target.closest('.kpi-card');
  if (targetCard) {
    targetCard.classList.remove('drag-over');
  }
});

/* --------------------------------------------------------------------------
   6. DRAGGABLE WIDGET KANBAN GRID
   -------------------------------------------------------------------------- */
let draggedCard = null;
const grid = document.getElementById('widgetGrid');

document.querySelectorAll('.widget-card').forEach(card => {
  card.addEventListener('dragstart', (e) => {
    draggedCard = card;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    draggedCard = null;
    document.querySelectorAll('.widget-card').forEach(c => c.classList.remove('drag-over'));
  });
  card.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (card !== draggedCard) card.classList.add('drag-over');
  });
  card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
  card.addEventListener('drop', (e) => {
    e.preventDefault();
    card.classList.remove('drag-over');
    if (draggedCard && card !== draggedCard) {
      const cards = Array.from(grid.children);
      const dragIdx = cards.indexOf(draggedCard);
      const targetIdx = cards.indexOf(card);
      if (dragIdx < targetIdx) {
        grid.insertBefore(draggedCard, card.nextSibling);
      } else {
        grid.insertBefore(draggedCard, card);
      }
    }
  });
});

/* --------------------------------------------------------------------------
   7. DYNAMIC INTERACTIVE SVG CHART ENGINE
   -------------------------------------------------------------------------- */
const datasets = {
  revenue: [
    { day: 'Mon', date: 'Jan 12', val: '$32,400', y: 190 },
    { day: 'Tue', date: 'Jan 13', val: '$41,800', y: 130 },
    { day: 'Wed', date: 'Jan 14', val: '$38,200', y: 155 },
    { day: 'Thu', date: 'Jan 15', val: '$56,900', y: 70 },
    { day: 'Fri', date: 'Jan 16', val: '$51,200', y: 100 },
    { day: 'Sat', date: 'Jan 17', val: '$68,400', y: 40 },
    { day: 'Sun', date: 'Jan 18', val: '$61,000', y: 65 }
  ],
  users: [
    { day: 'Mon', date: 'Jan 12', val: '8,200', y: 200 },
    { day: 'Tue', date: 'Jan 13', val: '12,400', y: 135 },
    { day: 'Wed', date: 'Jan 14', val: '11,100', y: 150 },
    { day: 'Thu', date: 'Jan 15', val: '15,800', y: 85 },
    { day: 'Fri', date: 'Jan 16', val: '14,200', y: 110 },
    { day: 'Sat', date: 'Jan 17', val: '18,900', y: 50 },
    { day: 'Sun', date: 'Jan 18', val: '17,500', y: 70 }
  ],
  orders: [
    { day: 'Mon', date: 'Jan 12', val: '1,420', y: 180 },
    { day: 'Tue', date: 'Jan 13', val: '1,890', y: 125 },
    { day: 'Wed', date: 'Jan 14', val: '1,650', y: 145 },
    { day: 'Thu', date: 'Jan 15', val: '2,410', y: 75 },
    { day: 'Fri', date: 'Jan 16', val: '2,100', y: 100 },
    { day: 'Sat', date: 'Jan 17', val: '2,980', y: 35 },
    { day: 'Sun', date: 'Jan 18', val: '2,750', y: 55 }
  ]
};

let activeDataKey = 'revenue';

function renderSVGChart() {
  const data = datasets[activeDataKey];
  const xCoords = [70, 185, 300, 415, 530, 645, 760];

  // Smooth Bezier Curve Path
  let pathD = `M ${xCoords[0]} ${data[0].y}`;
  for (let i = 1; i < data.length; i++) {
    const prevX = xCoords[i-1];
    const currX = xCoords[i];
    const midX = (prevX + currX) / 2;
    pathD += ` C ${midX} ${data[i-1].y}, ${midX} ${data[i].y}, ${currX} ${data[i].y}`;
  }

  document.getElementById('chartLine').setAttribute('d', pathD);
  document.getElementById('chartArea').setAttribute('d', pathD + ` L 760 220 L 70 220 Z`);

  // Render interactive node circles
  const nodesGroup = document.getElementById('chartNodes');
  nodesGroup.innerHTML = '';

  data.forEach((pt, idx) => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", xCoords[idx]);
    circle.setAttribute("cy", pt.y);
    circle.setAttribute("r", "6");
    circle.setAttribute("class", "chart-node-circle");

    circle.addEventListener('mouseenter', (e) => {
      const tooltip = document.getElementById('chartTooltip');
      document.getElementById('ttDate').textContent = pt.date;
      document.getElementById('ttVal').textContent = pt.val;
      tooltip.style.left = `${(xCoords[idx] / 800) * 100}%`;
      tooltip.style.top = `${(pt.y / 280) * 100}%`;
      tooltip.classList.add('visible');
    });

    circle.addEventListener('mouseleave', () => {
      document.getElementById('chartTooltip').classList.remove('visible');
    });

    nodesGroup.appendChild(circle);
  });
}

function toggleDataset(btn, datasetKey) {
  document.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeDataKey = datasetKey;
  renderSVGChart();
}

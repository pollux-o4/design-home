/* ------------------------------------------
   6. DYNAMIC INTERACTIVE SVG CHARTS & TOOLTIPS
   ------------------------------------------ */
const lineData = [
  { x: 20, y: 160, label: 'Mon', value: '$14,200', users: '2,100' },
  { x: 80, y: 120, label: 'Tue', value: '$22,400', users: '3,400' },
  { x: 150, y: 140, label: 'Wed', value: '$18,900', users: '2,800' },
  { x: 220, y: 70,  label: 'Thu', value: '$38,500', users: '5,900' },
  { x: 300, y: 90,  label: 'Fri', value: '$31,000', users: '4,600' },
  { x: 380, y: 40,  label: 'Sat', value: '$48,200', users: '7,100' },
  { x: 460, y: 80,  label: 'Sun', value: '$35,800', users: '5,200' }
];

function renderLineChart() {
  const nodesGroup = document.getElementById('line-nodes-group');
  const tooltip = document.getElementById('line-tooltip');
  const polyline = document.getElementById('line-polyline');
  const polygon = document.getElementById('line-area-polygon');

  if (!nodesGroup) return;

  // Construct points string
  const pointsStr = lineData.map(d => `${d.x},${d.y}`).join(' ');
  polyline.setAttribute('points', pointsStr);
  polygon.setAttribute('points', `20,180 ${pointsStr} 460,180`);

  nodesGroup.innerHTML = '';
  lineData.forEach((pt) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', pt.x);
    circle.setAttribute('cy', pt.y);
    circle.setAttribute('r', '5');
    circle.setAttribute('class', 'chart-node');

    circle.addEventListener('mouseenter', (e) => {
      tooltip.style.display = 'block';
      tooltip.innerHTML = `<strong>${pt.label}</strong><br>Rev: ${pt.value}<br>Users: ${pt.users}`;
      playBeep(700, 0.03);
    });

    circle.addEventListener('mousemove', (e) => {
      const rect = e.target.ownerSVGElement.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      tooltip.style.left = mouseX + 'px';
      tooltip.style.top = mouseY + 'px';
    });

    circle.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });

    nodesGroup.appendChild(circle);
  });
}

const barData = [
  { x: 20,  w: 40, h: 110, label: 'Direct', val: '45%' },
  { x: 90,  w: 40, h: 140, label: 'BBS / Web', val: '30%' },
  { x: 160, w: 40, h: 80,  label: 'Referral', val: '15%' },
  { x: 230, w: 40, h: 50,  label: 'Retro Mail', val: '10%' }
];

function renderBarChart() {
  const barGroup = document.getElementById('bar-rects-group');
  const tooltip = document.getElementById('bar-tooltip');
  if (!barGroup) return;

  barGroup.innerHTML = '';
  barData.forEach((b) => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const yPos = 180 - b.h;
    rect.setAttribute('x', b.x);
    rect.setAttribute('y', yPos);
    rect.setAttribute('width', b.w);
    rect.setAttribute('height', b.h);
    rect.setAttribute('class', 'chart-bar');

    rect.addEventListener('mouseenter', () => {
      tooltip.style.display = 'block';
      tooltip.innerHTML = `<strong>${b.label}</strong>: ${b.val}`;
      playBeep(640, 0.03);
    });

    rect.addEventListener('mousemove', (e) => {
      const svgRect = e.target.ownerSVGElement.getBoundingClientRect();
      tooltip.style.left = (e.clientX - svgRect.left) + 'px';
      tooltip.style.top = (e.clientY - svgRect.top) + 'px';
    });

    rect.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });

    barGroup.appendChild(rect);
  });
}

/* ------------------------------------------
   7. DRAGGABLE WIDGETS & KANBAN REORDERING
   ------------------------------------------ */
function setupDragAndDrop() {
  const draggables = document.querySelectorAll('[draggable="true"]');
  let draggedItem = null;

  draggables.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedItem = item;
      item.classList.add('dragging');
      playBeep(320, 0.05);
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      draggedItem = null;
      playBeep(480, 0.05);
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      if (draggedItem && draggedItem !== item && item.parentElement === draggedItem.parentElement) {
        const children = Array.from(item.parentElement.children);
        const draggedIdx = children.indexOf(draggedItem);
        const targetIdx = children.indexOf(item);

        if (draggedIdx < targetIdx) {
          item.parentElement.insertBefore(draggedItem, item.nextSibling);
        } else {
          item.parentElement.insertBefore(draggedItem, item);
        }
        appendTerminalLog('WIDGET LAYOUT REORDERED BY USER');
      }
    });
  });
}

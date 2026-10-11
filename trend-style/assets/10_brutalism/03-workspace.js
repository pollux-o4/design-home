// 6. INTERACTIVE SVG CHART ENGINE & TOOLTIP
const chartWrapper = document.getElementById('chartWrapper');
const chartTooltip = document.getElementById('chartTooltip');
const tooltipLabel = document.getElementById('tooltipLabel');
const tooltipVal = document.getElementById('tooltipVal');

function attachChartHoverListeners() {
    const interactiveEls = document.querySelectorAll('.chart-node, .chart-bar-rect');
    interactiveEls.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = chartWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const label = el.getAttribute('data-label');
            const val = el.getAttribute('data-val');

            tooltipLabel.innerText = label;
            tooltipVal.innerText = val;

            chartTooltip.style.left = `${x}px`;
            chartTooltip.style.top = `${y}px`;
            chartTooltip.classList.add('show');
        });

        el.addEventListener('mouseleave', () => {
            chartTooltip.classList.remove('show');
        });
    });
}

function toggleChartType(type) {
    const lineGroup = document.getElementById('chartLineGroup');
    const barsGroup = document.getElementById('chartBarsGroup');
    const lineBtn = document.getElementById('chartTypeLineBtn');
    const barBtn = document.getElementById('chartTypeBarBtn');

    if (type === 'line') {
        lineGroup.style.display = 'block';
        barsGroup.style.display = 'none';
        lineBtn.classList.add('active');
        barBtn.classList.remove('active');
    } else {
        lineGroup.style.display = 'none';
        barsGroup.style.display = 'block';
        barBtn.classList.add('active');
        lineBtn.classList.remove('active');
    }
}

// 7. DRAGGABLE WIDGET GRID ENGINE
const grid = document.getElementById('draggableGrid');
let draggedItem = null;

grid.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('widget-card')) {
        draggedItem = e.target;
        e.target.classList.add('dragging');
    }
});

grid.addEventListener('dragend', (e) => {
    if (e.target.classList.contains('widget-card')) {
        e.target.classList.remove('dragging');
        draggedItem = null;
        triggerToast('WIDGET LAYOUT REORDERED');
    }
});

grid.addEventListener('dragover', (e) => {
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

function getDragAfterElement(container, x) {
    const draggableElements = [...container.querySelectorAll('.widget-card:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = x - box.left - box.width / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

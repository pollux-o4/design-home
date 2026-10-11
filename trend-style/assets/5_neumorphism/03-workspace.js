/* Draggable Dashboard Cards Logic */
function initDragAndDrop() {
    const grid = document.getElementById('kpiGrid');
    let draggedItem = null;

    grid.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('kpi-card')) {
            draggedItem = e.target;
            e.target.classList.add('dragging');
        }
    });

    grid.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('kpi-card')) {
            e.target.classList.remove('dragging');
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
}

const getDragAfterElement = DesignExampleInteractions.dragAfter;

/* Kanban Drag & Drop */
function dragKanban(e) {
    e.dataTransfer.setData("text", e.target.id);
}

function allowDrop(e) {
    e.preventDefault();
}

function dropKanban(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData("text");
    const draggedTask = document.getElementById(data);
    const targetCol = e.currentTarget;
    if (draggedTask && targetCol) {
        targetCol.appendChild(draggedTask);
    }
}

/* Interactive SVG Chart Hover Tooltip */
function initChartInteractions() {
    const container = document.getElementById('chartContainer');
    const tooltip = document.getElementById('chartTooltip');
    const tooltipDate = document.getElementById('tooltipDate');
    const tooltipVal = document.getElementById('tooltipVal');
    const nodes = document.querySelectorAll('.chart-node');

    nodes.forEach(node => {
        node.addEventListener('mouseenter', (e) => {
            const date = node.getAttribute('data-date');
            const val = node.getAttribute('data-val');
            tooltipDate.textContent = date;
            tooltipVal.textContent = val;

            const rect = node.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            const x = rect.left - containerRect.left + rect.width / 2;
            const y = rect.top - containerRect.top;

            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
            tooltip.classList.add('show');
        });

        node.addEventListener('mouseleave', () => {
            tooltip.classList.remove('show');
        });
    });
}

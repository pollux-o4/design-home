// 6. SVG DYNAMIC CHART & HOVER TOOLTIPS
// --------------------------------------------------------------------------
function initChartTooltips() {
    const nodes = document.querySelectorAll('.chart-data-node');
    const tooltip = document.getElementById('chartTooltip');
    const tooltipDate = document.getElementById('tooltipDate');
    const tooltipVal = document.getElementById('tooltipVal');
    const chartContainer = document.getElementById('chartContainer');

    nodes.forEach(node => {
        node.addEventListener('mouseenter', (e) => {
            const date = node.getAttribute('data-date');
            const val = node.getAttribute('data-val');

            tooltipDate.textContent = date;
            tooltipVal.textContent = val;

            const nodeRect = node.getBoundingClientRect();
            const containerRect = chartContainer.getBoundingClientRect();

            const left = nodeRect.left - containerRect.left + nodeRect.width / 2;
            const top = nodeRect.top - containerRect.top;

            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
            tooltip.classList.add('show');
        });

        node.addEventListener('mouseleave', () => {
            tooltip.classList.remove('show');
        });
    });
}

// --------------------------------------------------------------------------
// 7. DRAGGABLE KANBAN / WIDGET GRID (HTML5 DRAG & DROP)
// --------------------------------------------------------------------------
function initDragAndDrop() {
    const draggables = document.querySelectorAll('[draggable="true"]');

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            draggable.classList.add('dragging');
            e.dataTransfer.setData('text/plain', '');
        });

        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
        });
    });

    const grids = [document.getElementById('kpiGrid'), document.getElementById('widgetsGrid')];

    grids.forEach(grid => {
        if (!grid) return;
        grid.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(grid, e.clientX, e.clientY);
            const dragging = document.querySelector('.dragging');
            if (dragging && grid.contains(dragging)) {
                if (afterElement == null) {
                    grid.appendChild(dragging);
                } else {
                    grid.insertBefore(dragging, afterElement);
                }
            }
        });
    });
}

function getDragAfterElement(container, x, y) {
    const draggableElements = [...container.querySelectorAll('[draggable="true"]:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offsetX = x - box.left - box.width / 2;
        const offsetY = y - box.top - box.height / 2;
        const offset = offsetX + offsetY * 2; // Priority weighting

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// --------------------------------------------------------------------------

/* --------------------------------------------------------------------------
   7. DRAG AND DROP REORDERING ENGINE FOR CARDS & WIDGETS
   -------------------------------------------------------------------------- */
function initDragAndDrop() {
    const draggables = document.querySelectorAll('.draggable-widget');
    let draggedItem = null;

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            draggedItem = draggable;
            draggable.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
            draggables.forEach(d => d.classList.remove('drag-over'));
            draggedItem = null;
        });

        draggable.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (draggable !== draggedItem) {
                draggable.classList.add('drag-over');
            }
        });

        draggable.addEventListener('dragleave', () => {
            draggable.classList.remove('drag-over');
        });

        draggable.addEventListener('drop', (e) => {
            e.preventDefault();
            draggable.classList.remove('drag-over');

            if (draggedItem && draggedItem !== draggable) {
                const parent = draggable.parentNode;
                const children = Array.from(parent.children);
                const draggedIndex = children.indexOf(draggedItem);
                const targetIndex = children.indexOf(draggable);

                if (draggedIndex < targetIndex) {
                    parent.insertBefore(draggedItem, draggable.nextSibling);
                } else {
                    parent.insertBefore(draggedItem, draggable);
                }
                showToast('Dashboard widget layout updated! 📌');
            }
        });
    });
}

/* --------------------------------------------------------------------------
   8. INTERACTIVE SVG CHART HOVER TOOLTIPS
   -------------------------------------------------------------------------- */
function initChartInteractivity() {
    const tooltip = document.getElementById('chart-tooltip');
    const nodes = document.querySelectorAll('.chart-node');
    const chartContainer = document.querySelector('.chart-container-large');

    nodes.forEach(node => {
        node.addEventListener('mouseenter', (e) => {
            const date = node.getAttribute('data-date');
            const revenue = node.getAttribute('data-revenue');
            const cost = node.getAttribute('data-cost');
            const margin = node.getAttribute('data-margin');

            document.getElementById('tt-date').innerText = date;
            document.getElementById('tt-revenue').innerText = revenue;
            document.getElementById('tt-cost').innerText = cost;
            document.getElementById('tt-margin').innerText = margin;

            // Compute node coordinates relative to SVG container
            const cx = parseFloat(node.getAttribute('cx'));
            const cy = parseFloat(node.getAttribute('cy'));
            const containerRect = chartContainer.getBoundingClientRect();
            const svg = node.ownerSVGElement;
            const svgRect = svg.getBoundingClientRect();

            const posX = (cx / 700) * svgRect.width;
            const posY = (cy / 240) * svgRect.height;

            tooltip.style.left = `${posX}px`;
            tooltip.style.top = `${posY}px`;
            tooltip.classList.add('visible');
        });

        node.addEventListener('mouseleave', () => {
            tooltip.classList.remove('visible');
        });
    });
}

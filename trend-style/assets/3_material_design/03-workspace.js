// Hover Tooltip for SVG Charts
const tooltip = document.getElementById('chartTooltip');

function showTooltip(e) {
    const val = e.target.getAttribute('data-val');
    tooltip.innerText = val;
    tooltip.classList.add('visible');

    const cardRect = e.target.closest('.svg-container').getBoundingClientRect();
    const x = e.clientX - cardRect.left;
    const y = e.clientY - cardRect.top;

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
}

function hideTooltip() {
    tooltip.classList.remove('visible');
}

// Draggable Widget Grid Engine
let draggedItem = null;

function dragStart(e) {
    draggedItem = e.currentTarget;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function drop(e) {
    e.preventDefault();
    const targetItem = e.currentTarget;
    if (draggedItem && targetItem !== draggedItem) {
        const parent = targetItem.parentNode;
        const children = Array.from(parent.children);
        const draggedIdx = children.indexOf(draggedItem);
        const targetIdx = children.indexOf(targetItem);

        if (draggedIdx < targetIdx) {
            parent.insertBefore(draggedItem, targetItem.nextSibling);
        } else {
            parent.insertBefore(draggedItem, targetItem);
        }
    }
}

function dragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    draggedItem = null;
}

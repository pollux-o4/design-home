// 7. Modal Slide-Over Popup Logic
// ----------------------------------------------------
const modalBackdrop = document.getElementById('modalBackdrop');
document.getElementById('openModalBtn').addEventListener('click', () => {
    modalBackdrop.classList.add('active');
});
document.getElementById('closeModalBtn').addEventListener('click', closeModal);

function closeModal() {
    modalBackdrop.classList.remove('active');
}

function toggleTag(el) {
    el.classList.toggle('selected');
}

function handleFormSubmit(e) {
    e.preventDefault();
    closeModal();
    showToast('New analytics project created successfully!');
}

// ----------------------------------------------------
// 8. Toast Notifications
// ----------------------------------------------------
function showToast(msg) {
    const toast = document.getElementById('toastNotification');
    document.getElementById('toastMessage').innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ----------------------------------------------------
// 9. Drag & Drop Grid Reordering
// ----------------------------------------------------
function setupDraggableGrid(gridId) {
    const grid = document.getElementById(gridId);
    let draggedItem = null;

    grid.querySelectorAll('[draggable="true"]').forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            setTimeout(() => item.classList.add('dragging'), 0);
        });

        item.addEventListener('dragend', () => {
            draggedItem = null;
            item.classList.remove('dragging');
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(grid, e.clientX, e.clientY);
            if (afterElement == null) {
                grid.appendChild(draggedItem);
            } else {
                grid.insertBefore(draggedItem, afterElement);
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
        const offset = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

        if (offset < closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.POSITIVE_INFINITY }).element;
}

setupDraggableGrid('kpiGrid');
setupDraggableGrid('widgetsGrid');

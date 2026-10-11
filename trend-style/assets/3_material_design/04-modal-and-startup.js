// Modal Controls
DesignExampleInteractions.installModal('projectModal', 'open');



function closeModalOnBackdrop(e) {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal();
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    closeModal();
    triggerSkeletonAndRefresh();
}

// Keyboard Shortcut Escape for Modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});

// Initialize animations on page load
window.addEventListener('DOMContentLoaded', () => {
    animateMetrics();
});

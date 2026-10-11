/* ==========================================================================
   9. MODAL SLIDE-OVER & TOAST NOTIFICATIONS
   ========================================================================== */
DesignExampleInteractions.installModal('modalBackdrop', 'open');



function handleBackdropClick(e) {
    if (e.target.id === 'modalBackdrop') closeModal();
}

function handleFormSubmit(e) {
    e.preventDefault();
    closeModal();
    showToast('🚀 New Project created & telemetry pipeline initialized!');
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

/* Initial Execution on Load */
window.addEventListener('DOMContentLoaded', () => {
    triggerMetricAnimation();
});

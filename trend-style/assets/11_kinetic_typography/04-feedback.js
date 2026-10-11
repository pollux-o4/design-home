// 7. Modal / Slide-Over & Toast Notification
// --------------------------------------------------
DesignExampleInteractions.installModal('project-modal', 'active');



function closeModalOnOverlay(e) {
    if (e.target.id === 'project-modal') {
        closeModal();
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    closeModal();
    showToast('✦ Project created successfully!');
}

function showToast(msg) {
    const toast = document.getElementById('toast-notification');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function toggleLiveSync(checkbox) {
    if (checkbox.checked) {
        showToast('⚡ Live Data Sync: ENABLED');
    } else {
        showToast('⏸ Live Data Sync: PAUSED');
    }
}

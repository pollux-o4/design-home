// 7. Modal / Slide-Over Functions
// --------------------------------------------------------------------------
DesignExampleInteractions.installModal('projectModal', 'active');



function handleCreateProject(e) {
    e.preventDefault();
    alert('New Flat Analytics Project successfully created!');
    closeModal();
}

function toggleLiveSync(checkbox) {
    if (checkbox.checked) {
        console.log('Live sync enabled');
    } else {
        console.log('Live sync disabled');
    }
}

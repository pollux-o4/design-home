/* Modal Popup Controls */
DesignExampleInteractions.installModal('newProjectModal', 'open');



function updateBudgetValue(val) {
    document.getElementById('budgetValue').textContent = `$${parseInt(val).toLocaleString()}`;
}

function handleFormSubmit(e) {
    e.preventDefault();
    alert("Project successfully created!");
    closeModal();
}

// Close Modal on ESC key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

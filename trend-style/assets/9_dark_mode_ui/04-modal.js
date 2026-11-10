// 8. MODAL SLIDE-OVER POPUP ("+ ADD PROJECT")
// --------------------------------------------------------------------------
DesignExampleInteractions.installModal("modalBackdrop", "active");

function closeModalOnBackdrop(e) {
  if (e.target.id === "modalBackdrop") {
    closeModal();
  }
}

function submitForm() {
  const form = document.getElementById("projectForm");
  if (form.checkValidity()) {
    closeModal();
    showToast();
    form.reset();
  } else {
    form.reportValidity();
  }
}

function handleFormSubmit(e) {
  e.preventDefault();
  submitForm();
}

function showToast() {
  const toast = document.getElementById("toastNotification");
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

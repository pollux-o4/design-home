// 10. Modal Popup Logic
const modal = document.getElementById('projectModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const submitProjectBtn = document.getElementById('submitProjectBtn');
const goalSlider = document.getElementById('goalSlider');
const goalValBadge = document.getElementById('goalValBadge');
const toast = document.getElementById('toast');

function openModal() {
  skeuoAudio.playSwitch();
  modal.classList.add('active');
}

function closeModal() {
  skeuoAudio.playClick();
  modal.classList.remove('active');
}

openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

goalSlider.addEventListener('input', (e) => {
  goalValBadge.textContent = '$' + parseInt(e.target.value).toLocaleString();
});

document.getElementById('newProjectForm').addEventListener('submit', () => {
  closeModal();
  skeuoAudio.playSwitch();
  toast.classList.add('visible');
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 3000);
});

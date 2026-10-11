/* --------------------------------------------------------------------------
   11. INIT DASHBOARD ON LOAD
   -------------------------------------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
  renderSVGChart();
  document.querySelectorAll('.count-up').forEach(animateCountUp);
});

function switchTab(btn, mode) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  triggerSkeletonLoad();
}

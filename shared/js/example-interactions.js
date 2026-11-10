/* Shared invariants only; each artwork keeps its visual state names and effects. */
(function () {
  window.DesignExampleInteractions = {
    installModal(id, state) {
      window.openModal = () => document.getElementById(id).classList.add(state);
      window.closeModal = () => document.getElementById(id).classList.remove(state);
    },
    closeDropdowns() {
      document.querySelectorAll(".dropdown").forEach((element) => element.classList.remove("open"));
    },
    dragAfter(container, x) {
      const candidates = [...container.querySelectorAll(".kpi-card:not(.dragging)")];
      return candidates.reduce(
        (closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = x - box.left - box.width / 2;
          return offset < 0 && offset > closest.offset ? { offset, element: child } : closest;
        },
        { offset: Number.NEGATIVE_INFINITY },
      ).element;
    },
  };
})();

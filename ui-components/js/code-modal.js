/* Owns code-view visibility, keyboard dismissal, focus and clipboard feedback. */
(function () {
  window.CanvasCodeModal = {
    create(document) {
      const overlay = document.getElementById('code-modal-overlay');
      const body = document.getElementById('code-modal-body');
      const title = document.getElementById('code-modal-title');
      const copy = document.getElementById('btn-copy-code');
      const closeButton = document.getElementById('btn-close-modal');
      let previousFocus;
      let feedbackTimer;
      function close() {
        overlay.classList.remove('open');
        previousFocus?.focus();
      }
      closeButton.addEventListener('click', close);
      overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && overlay.classList.contains('open')) close();
      });
      copy.addEventListener('click', async () => {
        clearTimeout(feedbackTimer);
        try {
          await navigator.clipboard.writeText(body.textContent);
          copy.textContent = 'Copied!';
        } catch {
          copy.textContent = 'Copy failed';
        }
        feedbackTimer = setTimeout(() => { copy.textContent = 'Copy Code'; }, 1500);
      });
      return {
        open(componentTitle, code) {
          previousFocus = document.activeElement;
          title.textContent = `< ${componentTitle} />`;
          body.textContent = code;
          overlay.classList.add('open');
          closeButton.focus();
        }
      };
    }
  };
})();

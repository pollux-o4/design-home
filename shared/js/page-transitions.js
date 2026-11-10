/** Observe navigation cancellation before the first rendering opportunity. */
(function () {
  // Cross-document transitions may be skipped by a newer navigation or opt-in change.
  const observeTransition = (event) => {
    if (!event.viewTransition) return;
    const report = (error) => {
      if (!["AbortError", "InvalidStateError", "TimeoutError"].includes(error.name))
        console.error(error);
    };
    event.viewTransition.ready.catch(report);
    event.viewTransition.finished.catch(report);
  };
  // shortcut: Chromium이 전환 객체 노출 전에 취소해 정확한 플랫폼 예외만 복구, 해당 브라우저 동작 수정 시 보완 처리 재검토.
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    if (
      reason instanceof DOMException &&
      reason.name === "InvalidStateError" &&
      reason.message ===
        "Transition was aborted because of invalid state. ViewTransition opt-in disabled"
    )
      event.preventDefault();
  });
  window.addEventListener("pageswap", observeTransition);
  window.addEventListener("pagereveal", observeTransition);
})();

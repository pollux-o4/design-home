/* A sample owns its listeners and asynchronous work until its card is removed. */
export function createScope(root) {
  const abort = new AbortController();
  const cleanup = [];
  const timers = new Set();
  return {
    root,
    on(target, type, handler) {
      if (abort.signal.aborted) return;
      target.addEventListener(type, handler, { signal: abort.signal });
    },
    later(handler, delay) {
      if (abort.signal.aborted) return;
      const timer = setTimeout(() => {
        timers.delete(timer);
        handler();
      }, delay);
      timers.add(timer);
      return timer;
    },
    cancel(timer) {
      clearTimeout(timer);
      timers.delete(timer);
    },
    own(dispose) {
      if (abort.signal.aborted) dispose();
      else cleanup.push(dispose);
    },
    dispose() {
      if (abort.signal.aborted) return;
      abort.abort();
      timers.forEach(clearTimeout);
      timers.clear();
      cleanup.reverse().forEach((dispose) => dispose());
      cleanup.length = 0;
    },
  };
}
export function announce(root, message) {
  const status = root.querySelector("[data-status]");
  if (status) status.textContent = message;
}

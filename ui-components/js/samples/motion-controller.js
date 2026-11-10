// A sample owns its playback. State changes are independent of decorative motion.
export function createMotionController(root, scope) {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const animations = new Map();
  let disposed = false;
  const reduced = () => preference.matches;
  function cancel() {
    animations.forEach((animation) => animation.cancel());
    animations.clear();
  }
  scope.on(preference, "change", () => {
    if (reduced()) cancel();
  });
  scope.on(document, "visibilitychange", () => {
    if (document.hidden) cancel();
  });
  const visibility = new MutationObserver(() => {
    if (root.closest("[hidden], [inert]")) cancel();
  });
  for (let ancestor = root; ancestor; ancestor = ancestor.parentElement)
    visibility.observe(ancestor, {
      attributes: true,
      attributeFilter: ["hidden", "inert"],
    });
  scope.own(() => {
    disposed = true;
    cancel();
    visibility.disconnect();
  });
  function play(target, keyframes, options = {}) {
    animations.get(target)?.cancel();
    if (disposed || reduced() || root.closest("[hidden], [inert]")) return Promise.resolve();
    const animation = target.animate(keyframes, {
      duration: 500,
      easing: getComputedStyle(root).getPropertyValue("--ui-ease").trim(),
      ...options,
    });
    animations.set(target, animation);
    return animation.finished
      .catch(() => {})
      .then(() => {
        if (animations.get(target) !== animation) return;
        animation.cancel();
        animations.delete(target);
      });
  }
  return { play, cancel, reduced };
}

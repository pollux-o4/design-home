const scrollBehavior = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

// Focus handoff is cancelled when navigation or the user's focus changes.
export function createPatternViewport({ viewport, renderer }) {
  let revision = 0;
  return {
    update(state, previous) {
      const current = ++revision;
      if (previous?.category !== state.category)
        viewport.scrollTo({ top: 0, behavior: scrollBehavior() });
      if (
        !state.group ||
        (previous?.category === state.category &&
          previous?.group === state.group)
      )
        return;
      const target = renderer.groupTarget(state.group);
      if (!target) return;
      const originFocus = document.activeElement;
      renderer.settled().then(() => {
        if (
          current !== revision ||
          !target.isConnected ||
          document.activeElement !== originFocus
        )
          return;
        if (document.activeElement !== target)
          target.focus({ preventScroll: true });
        target.scrollIntoView({ block: "start", behavior: scrollBehavior() });
      });
    },
  };
}

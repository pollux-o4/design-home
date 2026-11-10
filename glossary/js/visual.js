import { motionSketches } from "./motion-sketches.js";

const sketches = {
  tooltip: '<span class="sk-tip">도움말</span><i class="sk-dot"></i>',
  popover: '<span class="sk-popover"><b>프로필</b><i></i><i></i></span>',
  modal: '<span class="sk-window"><i></i><b></b></span>',
  drawer: '<span class="sk-drawer"></span>',
  toast: '<span class="sk-toast">✓ <i></i></span>',
  switch: '<span class="sk-switch"><i></i></span>',
  check: '<span class="sk-check">✓</span><i class="sk-line"></i><span class="sk-check off"></span>',
  radio: '<span class="sk-radio"></span><i class="sk-line"></i><span class="sk-radio off"></span>',
  accordion:
    '<span class="sk-accordion"><b>− <i></i></b><span><i></i><i></i></span><b>+ <i></i></b></span>',
  tabs: '<span class="sk-tabs"><b><i></i><i></i><i></i></b><span></span></span>',
  path: '<span class="sk-path"><i></i>›<i></i>›<b></b></span>',
  steps: '<span class="sk-steps"><b>1</b><i></i><b>2</b><i></i><span>3</span></span>',
  skeleton: '<span class="sk-skeleton"><b></b><span><i></i><i></i></span></span>',
  progress: '<span class="sk-progress"><i></i></span><small>64%</small>',
  empty: '<span class="sk-empty">＋</span><i class="sk-line"></i>',
  table: '<span class="sk-table"><i></i><i></i><i></i><i></i><i></i><i></i></span>',
  grid: '<span class="sk-grid"><i></i><i></i><i></i><i></i><i></i><i></i></span>',
  slider: '<span class="sk-slider"><i></i></span>',
  undo: '<span class="sk-undo">↶</span><i class="sk-line"></i><span class="sk-check">✓</span>',
  command: '<kbd>⌘</kbd><kbd>K</kbd><span>→</span><i class="sk-line"></i>',
  target: '<i class="sk-dot"></i><span>→</span><span class="sk-target">＋</span>',
  choice:
    '<span class="sk-choice"><i></i><i></i><i></i><i></i><i></i><i></i></span><span>→</span><span class="sk-check">✓</span>',
  groups:
    '<span class="sk-group"><i></i><i></i></span><span class="sk-group"><i></i><i></i></span>',
};
export function visual(type) {
  const node = document.createElement("span");
  node.className = `term-sketch sketch-${type}`;
  node.setAttribute("aria-hidden", "true");
  node.innerHTML = type.startsWith("motion-")
    ? `<svg viewBox="0 0 118 44" width="118" height="44" fill="currentColor">${motionSketches[type.slice(7)] ?? ""}</svg>`
    : sketches[type] || sketches.grid;
  return node;
}

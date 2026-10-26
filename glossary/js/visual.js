const sketches = {
  tooltip: '<span class="sk-tip">도움말</span><i class="sk-dot"></i>',
  popover: '<span class="sk-popover"><b>프로필</b><i></i><i></i></span>',
  modal: '<span class="sk-window"><i></i><b></b></span>',
  drawer: '<span class="sk-drawer"></span>',
  toast: '<span class="sk-toast">✓ <i></i></span>',
  switch: '<span class="sk-switch"><i></i></span>',
  check:
    '<span class="sk-check">✓</span><i class="sk-line"></i><span class="sk-check off"></span>',
  radio:
    '<span class="sk-radio"></span><i class="sk-line"></i><span class="sk-radio off"></span>',
  accordion:
    '<span class="sk-accordion"><b>− <i></i></b><span><i></i><i></i></span><b>+ <i></i></b></span>',
  tabs: '<span class="sk-tabs"><b><i></i><i></i><i></i></b><span></span></span>',
  path: '<span class="sk-path"><i></i>›<i></i>›<b></b></span>',
  steps:
    '<span class="sk-steps"><b>1</b><i></i><b>2</b><i></i><span>3</span></span>',
  skeleton:
    '<span class="sk-skeleton"><b></b><span><i></i><i></i></span></span>',
  progress: '<span class="sk-progress"><i></i></span><small>64%</small>',
  empty: '<span class="sk-empty">＋</span><i class="sk-line"></i>',
  table:
    '<span class="sk-table"><i></i><i></i><i></i><i></i><i></i><i></i></span>',
  grid: '<span class="sk-grid"><i></i><i></i><i></i><i></i><i></i><i></i></span>',
  slider: '<span class="sk-slider"><i></i></span>',
  undo: '<span class="sk-undo">↶</span><i class="sk-line"></i><span class="sk-check">✓</span>',
  command: '<kbd>⌘</kbd><kbd>K</kbd><span>→</span><i class="sk-line"></i>',
  target:
    '<i class="sk-dot"></i><span>→</span><span class="sk-target">＋</span>',
  choice:
    '<span class="sk-choice"><i></i><i></i><i></i><i></i><i></i><i></i></span><span>→</span><span class="sk-check">✓</span>',
  groups:
    '<span class="sk-group"><i></i><i></i></span><span class="sk-group"><i></i><i></i></span>',
};
export function visual(type) {
  const node = document.createElement("span");
  node.className = `term-sketch sketch-${type}`;
  node.setAttribute("aria-hidden", "true");
  const motion = {
    fade: '<circle cx="16" cy="22" r="10" opacity=".15"/><circle cx="58" cy="22" r="10" opacity=".5"/><circle cx="100" cy="22" r="10"/>',
    slide:
      '<rect x="7" y="12" width="20" height="20" rx="4" opacity=".3"/><path d="M36 22h42m-7-6 7 6-7 6" fill="none" stroke="currentColor"/><rect x="89" y="12" width="20" height="20" rx="4"/>',
    scale:
      '<circle cx="15" cy="22" r="4"/><circle cx="53" cy="22" r="8"/><circle cx="98" cy="22" r="15"/>',
    easing:
      '<path d="M8 35h100M8 35C65 35 30 8 108 8" fill="none" stroke="currentColor" stroke-width="2"/>',
    stagger:
      '<rect x="9" y="5" width="24" height="12" rx="3"/><rect x="45" y="16" width="24" height="12" rx="3" opacity=".6"/><rect x="81" y="27" width="24" height="12" rx="3" opacity=".3"/>',
    spring:
      '<path d="M4 30C23 30 26 0 40 8S54 36 66 23 80 15 90 22 101 21 114 22" fill="none" stroke="currentColor" stroke-width="2"/>',
    morph:
      '<circle cx="17" cy="22" r="12"/><rect x="46" y="10" width="24" height="24" rx="8"/><rect x="87" y="10" width="24" height="24" rx="2"/>',
    crossfade:
      '<rect x="9" y="8" width="38" height="28" rx="5" opacity=".3"/><rect x="37" y="8" width="38" height="28" rx="5" opacity=".6"/><rect x="65" y="8" width="38" height="28" rx="5"/>',
    blur: '<circle cx="22" cy="22" r="12"/><circle cx="86" cy="22" r="12" style="filter:blur(4px)"/>',
    gooey:
      '<path d="M10 22C10 5 32 5 40 15C48 23 67 23 75 15C85 3 108 6 108 22S85 41 75 29C67 21 48 21 40 29C30 40 10 39 10 22Z"/>',
    fanout:
      '<circle cx="58" cy="33" r="7"/><circle cx="20" cy="10" r="7"/><circle cx="42" cy="5" r="7"/><circle cx="74" cy="5" r="7"/><circle cx="96" cy="10" r="7"/>',
    radial:
      '<circle cx="58" cy="22" r="8"/><circle cx="58" cy="4" r="6"/><circle cx="78" cy="11" r="6"/><circle cx="78" cy="33" r="6"/><circle cx="38" cy="33" r="6"/><circle cx="38" cy="11" r="6"/>',
    pattern:
      '<path d="M8 32C25 32 27 8 43 15S61 36 76 22 93 16 110 12" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="10" cy="32" r="4"/><circle cx="108" cy="12" r="4"/>',
  };
  node.innerHTML = type.startsWith("motion-")
    ? `<svg viewBox="0 0 118 44" width="118" height="44" fill="currentColor">${motion[type.slice(7)] || motion.pattern}</svg>`
    : sketches[type] || sketches.grid;
  return node;
}

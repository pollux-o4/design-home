// Each miniature describes the motion, while the interactive example remains the source of behavior.
export const motionSketches = {
  fade: '<circle cx="18" cy="22" r="10" opacity=".2"/><circle cx="58" cy="22" r="10" opacity=".55"/><circle cx="98" cy="22" r="10"/>',
  slide:
    '<rect x="7" y="12" width="20" height="20" rx="4" opacity=".3"/><path d="M36 22h42m-7-6 7 6-7 6"/><rect x="89" y="12" width="20" height="20" rx="4"/>',
  scale:
    '<circle cx="17" cy="22" r="4"/><circle cx="55" cy="22" r="8"/><circle cx="98" cy="22" r="15"/>',
  rotate:
    '<rect x="45" y="10" width="24" height="24" rx="4"/><path d="M33 26a25 25 0 1 1 43 8m-2-7 2 7-7-1"/>',
  flip: '<rect x="14" y="8" width="26" height="28" rx="4" opacity=".4"/><path d="M51 9v26M58 11q12 11 0 22M76 10l14 4v16l-14 4z"/>',
  wipe: '<rect x="12" y="9" width="94" height="26" rx="5" opacity=".2"/><path d="M12 9h54v26H12z"/><path d="M73 22h23m-5-5 5 5-5 5"/>',
  reveal:
    '<rect x="11" y="8" width="96" height="28" rx="5" opacity=".18"/><circle cx="58" cy="22" r="13"/><circle cx="58" cy="22" r="18" fill="none" stroke="currentColor" stroke-dasharray="3 3"/>',
  blur: '<circle cx="26" cy="22" r="11"/><circle cx="88" cy="22" r="11" style="filter:blur(4px)"/>',
  bounce:
    '<path d="M7 34h104M10 8q21 0 30 25Q50 8 62 34q8-14 17 0"/><circle cx="95" cy="29" r="5"/>',
  overshoot: '<path d="M7 33h104M10 33C35 33 48 4 68 8s18 15 38 15M80 5v33"/>',
  morph:
    '<circle cx="17" cy="22" r="11"/><rect x="46" y="11" width="22" height="22" rx="8"/><rect x="87" y="11" width="22" height="22" rx="2"/>',
  fanout:
    '<circle cx="58" cy="34" r="6"/><path d="M58 34 22 9M58 34 43 7M58 34 73 7M58 34 94 9"/><circle cx="22" cy="9" r="5"/><circle cx="43" cy="7" r="5"/><circle cx="73" cy="7" r="5"/><circle cx="94" cy="9" r="5"/>',
  radial:
    '<circle cx="58" cy="22" r="7"/><circle cx="58" cy="5" r="5"/><circle cx="78" cy="12" r="5"/><circle cx="78" cy="32" r="5"/><circle cx="38" cy="32" r="5"/><circle cx="38" cy="12" r="5"/>',
  accordion:
    '<rect x="15" y="7" width="88" height="9" rx="3"/><rect x="15" y="20" width="88" height="17" rx="3" opacity=".25"/><path d="M28 26h36m-36 5h52"/>',
  ripple:
    '<circle cx="58" cy="22" r="3"/><circle cx="58" cy="22" r="10" fill="none" stroke="currentColor"/><circle cx="58" cy="22" r="19" fill="none" stroke="currentColor" opacity=".4"/>',
  pulse:
    '<circle cx="58" cy="22" r="8"/><circle cx="58" cy="22" r="15" fill="none" stroke="currentColor" opacity=".5"/><circle cx="58" cy="22" r="20" fill="none" stroke="currentColor" opacity=".2"/>',
  shake:
    '<rect x="48" y="11" width="22" height="22" rx="4"/><path d="M36 13l-8 9 8 9m46-18 8 9-8 9"/>',
  shimmer:
    '<rect x="10" y="10" width="98" height="24" rx="7" opacity=".25"/><path d="M40 32 53 12m5 20 13-20m5 20 13-20"/>',
  glow: '<circle cx="58" cy="22" r="10"/><circle cx="58" cy="22" r="16" opacity=".3"/><circle cx="58" cy="22" r="21" opacity=".12"/>',
  gooey:
    '<path d="M10 22C10 5 32 5 40 15C48 23 67 23 75 15C85 3 108 6 108 22S85 41 75 29C67 21 48 21 40 29C30 40 10 39 10 22Z"/>',
  inertia:
    '<path d="M12 22h61m-7-6 7 6-7 6M9 14h18M5 19h15M9 29h18"/><circle cx="94" cy="22" r="10"/>',
  snap: '<path d="M23 6v32M59 6v32M95 6v32M33 22h42m-6-6 6 6-6 6"/><circle cx="95" cy="22" r="6"/>',
  rubber:
    '<rect x="9" y="13" width="24" height="18" rx="9"/><rect x="43" y="16" width="43" height="12" rx="6"/><rect x="96" y="13" width="15" height="18" rx="7"/>',
  magnetic:
    '<path d="M25 9v17a13 13 0 0 0 26 0V9h-8v17a5 5 0 0 1-10 0V9zM65 22h20m-5-5 5 5-5 5"/><circle cx="99" cy="22" r="6"/>',
  easing: '<path d="M8 35h100M8 35C65 35 30 8 108 8"/>',
  stagger:
    '<rect x="9" y="5" width="24" height="12" rx="3"/><rect x="45" y="16" width="24" height="12" rx="3" opacity=".6"/><rect x="81" y="27" width="24" height="12" rx="3" opacity=".3"/>',
  spring: '<path d="M4 30C23 30 26 0 40 8S54 36 66 23 80 15 90 22 101 21 114 22"/>',
  "layout-flip":
    '<rect x="8" y="8" width="22" height="14" rx="3"/><rect x="8" y="25" width="22" height="14" rx="3" opacity=".4"/><path d="M39 22h32m-6-6 6 6-6 6"/><rect x="84" y="8" width="22" height="14" rx="3" opacity=".4"/><rect x="84" y="25" width="22" height="14" rx="3"/>',
  crossfade:
    '<rect x="9" y="8" width="38" height="28" rx="5" opacity=".3"/><rect x="37" y="8" width="38" height="28" rx="5" opacity=".6"/><rect x="65" y="8" width="38" height="28" rx="5"/>',
  shared:
    '<rect x="8" y="7" width="34" height="30" rx="4" opacity=".25"/><rect x="13" y="12" width="11" height="11" rx="2"/><path d="M46 22h24m-6-6 6 6-6 6"/><rect x="77" y="5" width="32" height="34" rx="5"/>',
  "scroll-reveal":
    '<path d="M15 6v31m-5-6 5 6 5-6"/><rect x="31" y="7" width="71" height="11" rx="3" opacity=".25"/><rect x="31" y="23" width="71" height="11" rx="3"/>',
  "scroll-progress":
    '<rect x="12" y="8" width="94" height="28" rx="4" fill="none" stroke="currentColor"/><path d="M20 16h53m-53 6h70m-70 6h38"/><rect x="13" y="33" width="51" height="3" rx="1"/>',
  parallax:
    '<path d="M14 8v28m-5-6 5 6 5-6M29 14h69M29 29h47"/><circle cx="70" cy="14" r="5"/><circle cx="50" cy="29" r="5"/>',
  tilt: '<path d="M29 12 73 6l13 25-44 7zM16 24l8-6m-8 6 8 5m79-9-8-6m8 6-8 5"/>',
  "page-slide":
    '<rect x="9" y="7" width="33" height="30" rx="4" opacity=".25"/><path d="M47 22h22m-5-5 5 5-5 5"/><rect x="76" y="7" width="33" height="30" rx="4"/>',
  "swipe-stack":
    '<rect x="37" y="9" width="33" height="27" rx="4" opacity=".3" transform="rotate(-10 53 22)"/><rect x="43" y="8" width="33" height="27" rx="4"/><path d="M80 22h27m-6-6 6 6-6 6"/>',
  "svg-draw":
    '<path d="M10 32C34 32 35 8 58 11s24 22 49 3" stroke-dasharray="5 4"/><circle cx="10" cy="32" r="3"/><circle cx="107" cy="14" r="3"/>',
  counter:
    '<text x="7" y="28" font-size="15" fill="currentColor" stroke="none">1</text><path d="M25 22h20m-5-5 5 5-5 5"/><text x="52" y="28" font-size="15" fill="currentColor" stroke="none">42</text><path d="M76 22h17m-5-5 5 5-5 5"/><text x="96" y="28" font-size="15" fill="currentColor" stroke="none">99</text>',
  "text-reveal":
    '<path d="M11 11h27m-27 10h57m-57 10h91" stroke-width="4"/><path d="M77 9h23" opacity=".3"/>',
  gradient:
    '<rect x="10" y="7" width="98" height="30" rx="8" opacity=".2"/><circle cx="38" cy="20" r="12" opacity=".35"/><circle cx="70" cy="24" r="14" opacity=".65"/>',
  orbit:
    '<ellipse cx="58" cy="22" rx="42" ry="15" fill="none" stroke="currentColor"/><circle cx="58" cy="22" r="8"/><circle cx="89" cy="12" r="5"/>',
  confetti:
    '<path d="M58 29V7M48 29 34 12M68 29l14-17M43 34 21 27M73 34l22-7"/><circle cx="58" cy="34" r="6"/><circle cx="23" cy="13" r="3"/><circle cx="91" cy="8" r="3"/>',
  "morph-action":
    '<rect x="9" y="12" width="32" height="20" rx="10" opacity=".4"/><path d="M48 22h17m-5-5 5 5-5 5"/><rect x="73" y="12" width="34" height="20" rx="10"/><path d="m83 22 4 4 9-9" stroke="white"/>',
  "morph-island":
    '<rect x="8" y="16" width="27" height="12" rx="6"/><path d="M41 22h18m-5-5 5 5-5 5"/><rect x="67" y="8" width="43" height="28" rx="14" opacity=".65"/><circle cx="83" cy="22" r="4"/>',
};

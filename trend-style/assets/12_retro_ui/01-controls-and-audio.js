/* ------------------------------------------
   1. RETRO AUDIO SYNTHESIZER (WEB AUDIO API)
   ------------------------------------------ */
let audioCtx = null;

function playBeep(freq = 440, duration = 0.08, type = "square") {
  const soundCheck = document.getElementById("sound-check");
  if (!soundCheck || !soundCheck.checked) return;

  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Audio fallback ignore
  }
}

/* ------------------------------------------
   2. THEME SWITCHER (6 VARIATIONS)
   ------------------------------------------ */
function switchTheme(themeClass) {
  document.body.className = themeClass;
  playBeep(520, 0.1, "sine");
  appendTerminalLog(`THEME SWITCHED TO: ${themeClass.toUpperCase()}`);
}

function toggleCRT(enabled) {
  const overlay = document.getElementById("crt-overlay");
  if (enabled) {
    overlay.classList.remove("disabled");
  } else {
    overlay.classList.add("disabled");
  }
  playBeep(350, 0.05);
}

/* ------------------------------------------
   3. SIDEBAR ACCORDION & SUBMENU
   ------------------------------------------ */
function toggleAccordion(headerEl) {
  const item = headerEl.parentElement;
  const isOpen = item.classList.contains("open");

  // Close all accordion items
  document.querySelectorAll(".accordion-item").forEach((el) => {
    el.classList.remove("open");
    const icon = el.querySelector(".acc-icon");
    if (icon) icon.textContent = "+";
  });

  if (!isOpen) {
    item.classList.add("open");
    const icon = item.querySelector(".acc-icon");
    if (icon) icon.textContent = "-";
  }
  playBeep(450, 0.05);
}

function selectSubmenu(subitemEl) {
  document.querySelectorAll(".accordion-subitem").forEach((el) => el.classList.remove("active"));
  subitemEl.classList.add("active");
  playBeep(650, 0.05);
  triggerDataRefresh();
}

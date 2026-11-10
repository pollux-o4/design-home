/* --------------------------------------------------------------------------
   1. THEME SWITCHER ENGINE (6 DISTINCT CLAY VARIATIONS)
   -------------------------------------------------------------------------- */
function setTheme(themeId) {
  document.documentElement.setAttribute("data-theme", themeId);

  // Update Active Buttons
  const buttons = document.querySelectorAll(".switcher-btn");
  buttons.forEach((btn, index) => {
    if (index + 1 === themeId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Re-trigger count-up and SVG chart animations
  triggerRefreshAnimation();

  const labels = [
    "Soft Pastel",
    "Bubblegum Pop",
    "Dark Slate",
    "Terracotta",
    "Marshmallow",
    "Cyber Neon",
  ];
  showToast(`Theme switched to ${labels[themeId - 1]}`);
}

/* --------------------------------------------------------------------------
   2. COUNT-UP ANIMATION ENGINE FOR KPI METRICS
   -------------------------------------------------------------------------- */
function countUp(elementId, targetValue, duration = 1000, prefix = "", suffix = "", decimals = 0) {
  const el = document.getElementById(elementId);
  if (!el) return;

  let start = 0;
  const startTime = performance.now();

  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease Out Cubic function for smooth deceleration
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentVal = start + (targetValue - start) * easeProgress;

    let formatted = currentVal.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    el.innerText = `${prefix}${formatted}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }

  requestAnimationFrame(updateNumber);
}

// Mock Datasets for Time Tabs ([Daily] [Weekly] [Monthly])
const datasetModes = {
  daily: {
    kpi1: [18450, "$", ""],
    kpi2: [6240, "", ""],
    kpi3: [5.12, "", "%"],
    kpi4: [310.5, "$", ""],
    svgLine:
      "M 40 160 C 120 180, 200 110, 280 130 C 360 80, 440 120, 520 60 C 600 80, 660 40, 660 40",
    svgArea:
      "M 40 160 C 120 180, 200 110, 280 130 C 360 80, 440 120, 520 60 C 600 80, 660 40, 660 40 L 660 210 L 40 210 Z",
  },
  weekly: {
    kpi1: [128450, "$", ""],
    kpi2: [42890, "", ""],
    kpi3: [4.85, "", "%"],
    kpi4: [342.1, "$", ""],
    svgLine:
      "M 40 180 C 120 140, 200 80, 280 110 C 360 140, 440 40, 520 70 C 600 100, 660 30, 660 30",
    svgArea:
      "M 40 180 C 120 140, 200 80, 280 110 C 360 140, 440 40, 520 70 C 600 100, 660 30, 660 30 L 660 210 L 40 210 Z",
  },
  monthly: {
    kpi1: [542100, "$", ""],
    kpi2: [184200, "", ""],
    kpi3: [6.2, "", "%"],
    kpi4: [388.9, "$", ""],
    svgLine:
      "M 40 190 C 120 120, 200 60, 280 90 C 360 110, 440 30, 520 50 C 600 60, 660 20, 660 20",
    svgArea:
      "M 40 190 C 120 120, 200 60, 280 90 C 360 110, 440 30, 520 50 C 600 60, 660 20, 660 20 L 660 210 L 40 210 Z",
  },
};

let currentMode = "weekly";

function runAllCountUps(mode = currentMode) {
  const data = datasetModes[mode];
  countUp(
    "kpi-1-val",
    data.kpi1[0],
    1000,
    data.kpi1[1],
    data.kpi1[2],
    data.kpi1[2] === "%" ? 2 : 0,
  );
  countUp("kpi-2-val", data.kpi2[0], 1000, data.kpi2[1], data.kpi2[2], 0);
  countUp("kpi-3-val", data.kpi3[0], 1000, data.kpi3[1], data.kpi3[2], 2);
  countUp("kpi-4-val", data.kpi4[0], 1000, data.kpi4[1], data.kpi4[2], 2);
}

/* --------------------------------------------------------------------------
   3. SKELETON LOADING ON TAB SWITCH
   -------------------------------------------------------------------------- */
function switchViewMode(buttonEl, mode) {
  // Update Active Tab Button
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
  buttonEl.classList.add("active");

  currentMode = mode;
  const mainContent = document.querySelector(".main-content");

  // Add Loading Skeleton State
  mainContent.classList.add("is-loading");

  setTimeout(() => {
    mainContent.classList.remove("is-loading");

    // Update SVG Chart Curves
    const data = datasetModes[mode];
    document.getElementById("chart-line-path").setAttribute("d", data.svgLine);
    document.getElementById("chart-area-path").setAttribute("d", data.svgArea);

    runAllCountUps(mode);
    showToast(`Switched view to ${mode.toUpperCase()} analytics.`);
  }, 450);
}

function triggerRefreshAnimation() {
  runAllCountUps(currentMode);
}

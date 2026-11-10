// 4. TIMEFRAME TABS & SKELETON LOADING EFFECT
// --------------------------------------------------------------------------
function switchViewTab(mode, btnElement) {
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
  btnElement.classList.add("active");
  triggerSkeletonAndRefresh();
}

function triggerSkeletonAndRefresh() {
  const kpiValues = document.querySelectorAll(".kpi-value");
  const chartArea = document.getElementById("chartContainer");

  // Apply skeleton animation
  kpiValues.forEach((el) => el.classList.add("skeleton"));
  chartArea.style.opacity = "0.4";

  setTimeout(() => {
    kpiValues.forEach((el) => el.classList.remove("skeleton"));
    chartArea.style.opacity = "1";

    // Randomize data slightly for realistic tab switching
    randomizeDataValues();
    triggerCountUp();
  }, 450);
}

function randomizeDataValues() {
  const v1 = Math.floor(100000 + Math.random() * 50000);
  const v2 = Math.floor(12000 + Math.random() * 5000);
  const v4 = (35 + Math.random() * 20).toFixed(1);

  document.getElementById("kpiValue1").setAttribute("data-val", v1);
  document.getElementById("kpiValue2").setAttribute("data-val", v2);
  document.getElementById("kpiValue4").setAttribute("data-val", v4);
}

// --------------------------------------------------------------------------
// 5. COUNT-UP ANIMATION FOR METRIC NUMBERS
// --------------------------------------------------------------------------
function triggerCountUp() {
  const kpiValues = document.querySelectorAll(".kpi-value");

  kpiValues.forEach((el) => {
    const target = parseFloat(el.getAttribute("data-val"));
    const prefix = el.getAttribute("data-prefix") || "";
    const suffix = el.getAttribute("data-suffix") || "";
    const isFloat = target % 1 !== 0;

    let start = 0;
    const duration = 800; // ms
    const stepTime = 16;
    const totalSteps = duration / stepTime;
    const stepVal = target / totalSteps;

    const timer = setInterval(() => {
      start += stepVal;
      if (start >= target) {
        start = target;
        clearInterval(timer);
      }
      const formatted = isFloat ? start.toFixed(2) : Math.floor(start).toLocaleString();
      el.textContent = `${prefix}${formatted}${suffix}`;
    }, stepTime);
  });
}

// Initial Count Up on Load
document.addEventListener("DOMContentLoaded", () => {
  triggerCountUp();
  initChartTooltips();
  initDragAndDrop();
});

// --------------------------------------------------------------------------

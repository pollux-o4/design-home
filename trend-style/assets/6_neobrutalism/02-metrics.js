/* --------------------------------------------------------------------------
   3. COUNT-UP ANIMATION & SKELETON EFFECT FOR METRICS
   -------------------------------------------------------------------------- */
function animateCountUp(element) {
  const target = parseFloat(element.getAttribute("data-target"));
  const prefix = element.getAttribute("data-prefix") || "";
  const suffix = element.getAttribute("data-suffix") || "";
  const format = element.getAttribute("data-format") || "integer";

  const duration = 1000; // ms
  const startTime = performance.now();

  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic animation
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentVal = target * easeProgress;

    if (format === "currency") {
      element.textContent = prefix + Math.floor(currentVal).toLocaleString();
    } else if (format === "decimal") {
      element.textContent = currentVal.toFixed(2) + suffix;
    } else {
      element.textContent = prefix + Math.floor(currentVal).toLocaleString() + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }

  requestAnimationFrame(updateNumber);
}

function triggerMetricCountUp() {
  document.querySelectorAll(".kpi-value").forEach((el) => {
    animateCountUp(el);
  });
}

/* --------------------------------------------------------------------------
   4. DATA TAB SWITCHING & SKELETON LOADER
   -------------------------------------------------------------------------- */
const tabDataSets = {
  daily: {
    revenue: 18450,
    users: 6420,
    conv: 5.12,
    latency: 38,
    trend1: "↑ +4.8%",
    trend2: "↑ +3.2%",
    chartLine: "30,190 120,170 210,140 300,160 390,110 480,90 570,120",
    chartArea: "30,220 30,190 120,170 210,140 300,160 390,110 480,90 570,120 570,220",
  },
  weekly: {
    revenue: 128420,
    users: 45210,
    conv: 4.85,
    latency: 42,
    trend1: "↑ +14.2%",
    trend2: "↑ +8.5%",
    chartLine: "30,170 120,130 210,150 300,80 390,110 480,40 570,70",
    chartArea: "30,220 30,170 120,130 210,150 300,80 390,110 480,40 570,70 570,220",
  },
  monthly: {
    revenue: 542190,
    users: 182900,
    conv: 4.98,
    latency: 45,
    trend1: "↑ +22.4%",
    trend2: "↑ +19.1%",
    chartLine: "30,150 120,110 210,90 300,100 390,60 480,30 570,45",
    chartArea: "30,220 30,150 120,110 210,90 300,100 390,60 480,30 570,45 570,220",
  },
};

function switchDataTab(tabKey, btnElement) {
  // Update Active Tab UI
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
  btnElement.classList.add("active");

  // Trigger Skeleton Loader Effect
  const mainContent = document.querySelector(".main-content");
  mainContent.classList.add("skeleton-active");

  setTimeout(() => {
    // Update Dataset Targets
    const data = tabDataSets[tabKey];
    document.getElementById("kpiValue1").setAttribute("data-target", data.revenue);
    document.getElementById("kpiValue2").setAttribute("data-target", data.users);
    document.getElementById("kpiValue3").setAttribute("data-target", data.conv);
    document.getElementById("kpiValue4").setAttribute("data-target", data.latency);

    document.getElementById("kpiTrend1").textContent = data.trend1;
    document.getElementById("kpiTrend2").textContent = data.trend2;

    // Update Chart SVG Polylines
    document.getElementById("chartLine").setAttribute("points", data.chartLine);
    document.getElementById("chartArea").setAttribute("points", data.chartArea);

    // Remove Skeleton State & Trigger Animations
    mainContent.classList.remove("skeleton-active");
    triggerMetricCountUp();
  }, 450);
}

function onDateRangeChange(value) {
  showToast(`DATE RANGE CHANGED TO: ${value.toUpperCase()} 📅`);
  triggerMetricCountUp();
}

function toggleLiveSync(isSync) {
  if (isSync) {
    showToast("REALTIME LIVE SYNC ENABLED ⚡");
  } else {
    showToast("LIVE SYNC PAUSED ⏸");
  }
}

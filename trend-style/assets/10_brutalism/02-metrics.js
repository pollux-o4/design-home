// 5. COUNT-UP ANIMATION & SKELETON EFFECT
function animateCountUp(elementId, targetValue, duration = 800, prefix = "", suffix = "") {
  const el = document.getElementById(elementId);
  if (!el) return;

  const isDecimal = targetValue.toString().includes(".");
  const startVal = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease Out Quad
    const easeProgress = progress * (2 - progress);
    const currentVal = startVal + (targetValue - startVal) * easeProgress;

    let formattedVal = isDecimal ? currentVal.toFixed(2) : Math.floor(currentVal).toLocaleString();

    el.innerText = `${prefix}${formattedVal}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function triggerKPIAnimations(mode = "monthly") {
  let data = {
    kpi1: { val: 148920, prefix: "$", suffix: "" },
    kpi2: { val: 4892, prefix: "", suffix: "" },
    kpi3: { val: 1.42, prefix: "", suffix: "%" },
    kpi4: { val: 62450, prefix: "$", suffix: "" },
  };

  if (mode === "daily") {
    data = {
      kpi1: { val: 5120, prefix: "$", suffix: "" },
      kpi2: { val: 142, prefix: "", suffix: "" },
      kpi3: { val: 1.15, prefix: "", suffix: "%" },
      kpi4: { val: 2150, prefix: "$", suffix: "" },
    };
  } else if (mode === "weekly") {
    data = {
      kpi1: { val: 34800, prefix: "$", suffix: "" },
      kpi2: { val: 980, prefix: "", suffix: "" },
      kpi3: { val: 1.3, prefix: "", suffix: "%" },
      kpi4: { val: 14200, prefix: "$", suffix: "" },
    };
  } else if (mode === "yearly") {
    data = {
      kpi1: { val: 1780900, prefix: "$", suffix: "" },
      kpi2: { val: 18450, prefix: "", suffix: "" },
      kpi3: { val: 1.85, prefix: "", suffix: "%" },
      kpi4: { val: 742000, prefix: "$", suffix: "" },
    };
  }

  animateCountUp("kpiVal1", data.kpi1.val, 800, data.kpi1.prefix, data.kpi1.suffix);
  animateCountUp("kpiVal2", data.kpi2.val, 800, data.kpi2.prefix, data.kpi2.suffix);
  animateCountUp("kpiVal3", data.kpi3.val, 800, data.kpi3.prefix, data.kpi3.suffix);
  animateCountUp("kpiVal4", data.kpi4.val, 800, data.kpi4.prefix, data.kpi4.suffix);
}

function refreshDashboardData(mode = "monthly") {
  const mainContent = document.getElementById("mainContentArea");
  mainContent.classList.add("skeleton-active");

  setTimeout(() => {
    mainContent.classList.remove("skeleton-active");
    triggerKPIAnimations(mode);
  }, 400);
}

function switchDataTab(tabEl, mode) {
  document.querySelectorAll(".data-tabs .tab-btn").forEach((btn) => {
    if (btn.id !== "chartTypeLineBtn" && btn.id !== "chartTypeBarBtn") {
      btn.classList.remove("active");
    }
  });
  tabEl.classList.add("active");
  refreshDashboardData(mode);
  triggerToast(`VIEW MODE CHANGED: ${mode.toUpperCase()}`);
}

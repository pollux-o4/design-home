/* ==========================================================================
   Count-Up Number Animation
   ========================================================================== */
function animateValue(obj, start, end, duration, prefix = "", suffix = "", decimals = 0) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const current = start + progress * (end - start);

    let formatted = decimals > 0 ? current.toFixed(decimals) : Math.floor(current).toLocaleString();
    obj.innerHTML = `${prefix}${formatted}${suffix}`;

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

function runAllCountUps() {
  document.querySelectorAll(".kpi-number").forEach((el) => {
    const target = parseFloat(el.getAttribute("data-target"));
    const prefix = el.getAttribute("data-prefix") || "";
    const suffix = el.getAttribute("data-suffix") || "";
    const decimals = parseInt(el.getAttribute("data-decimals") || "0");
    animateValue(el, 0, target, 1000, prefix, suffix, decimals);
  });
}

/* ==========================================================================
   Data Tabs & Skeleton Loading Trigger
   ========================================================================== */
function switchDataTab(mode, btnEl) {
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
  btnEl.classList.add("active");

  // Update KPI target numbers based on tab mode
  const revEl = document.getElementById("val-revenue");
  const usrEl = document.getElementById("val-users");

  if (mode === "daily") {
    revEl.setAttribute("data-target", "18420");
    usrEl.setAttribute("data-target", "6210");
  } else if (mode === "weekly") {
    revEl.setAttribute("data-target", "128450");
    usrEl.setAttribute("data-target", "48290");
  } else if (mode === "monthly") {
    revEl.setAttribute("data-target", "542100");
    usrEl.setAttribute("data-target", "194200");
  }

  triggerSkeletonReload();
}

function triggerSkeletonReload() {
  const panels = document.querySelectorAll(".glass-panel");
  panels.forEach((p) => p.classList.add("loading"));

  setTimeout(() => {
    panels.forEach((p) => p.classList.remove("loading"));
    runAllCountUps();
  }, 450);
}

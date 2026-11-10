// Count-Up Animation Engine
function animateValue(
  id,
  start,
  end,
  duration,
  isCurrency = false,
  isPercent = false,
  isTime = false,
) {
  const obj = document.getElementById(id);
  if (!obj) return;
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const currentVal = Math.floor(progress * (end - start) + start);

    if (isCurrency) {
      obj.innerHTML = `$${currentVal.toLocaleString()}`;
    } else if (isPercent) {
      const decimalVal = (progress * (end - start) + start).toFixed(2);
      obj.innerHTML = `${decimalVal}%`;
    } else if (isTime) {
      const minutes = (progress * (end - start) + start).toFixed(2);
      obj.innerHTML = `${minutes}m`;
    } else {
      obj.innerHTML = currentVal.toLocaleString();
    }

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

function animateMetrics() {
  animateValue("valRevenue", 0, 128450, 1000, true);
  animateValue("valUsers", 0, 42890, 1000);
  animateValue("valConv", 0, 3.84, 1000, false, true);
  animateValue("valTime", 0, 4.32, 1000, false, false, true);
}

// Skeleton Loading & Data Tab Switching
function triggerSkeletonAndRefresh() {
  const targets = [
    ...document.querySelectorAll(".widget-card"),
    document.getElementById("mainChartCard"),
    document.getElementById("barChartCard"),
  ];

  targets.forEach((el) => el.classList.add("skeleton"));

  setTimeout(() => {
    targets.forEach((el) => el.classList.remove("skeleton"));
    animateMetrics();
  }, 600);
}

function switchDataTab(btn, mode) {
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  triggerSkeletonAndRefresh();
}

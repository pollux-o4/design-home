// 3. Data Mode Switcher Tabs + Skeleton Loader Effect
// ----------------------------------------------------
const chartDataSets = {
  daily: {
    subtitle: "Daily Real-Time Trajectory",
    areaD: "M 30,220 L 30,180 L 120,140 L 210,90 L 300,120 L 390,50 L 480,90 L 570,40 L 570,220 Z",
    lineD: "M 30,180 L 120,140 L 210,90 L 300,120 L 390,50 L 480,90 L 570,40",
    points: [
      { cx: 30, cy: 180, val: "$4.2k", label: "00:00" },
      { cx: 120, cy: 140, val: "$6.8k", label: "04:00" },
      { cx: 210, cy: 90, val: "$12.1k", label: "08:00" },
      { cx: 300, cy: 120, val: "$9.4k", label: "12:00" },
      { cx: 390, cy: 50, val: "$18.9k", label: "16:00" },
      { cx: 480, cy: 90, val: "$14.2k", label: "20:00" },
      { cx: 570, cy: 40, val: "$21.0k", label: "23:59" },
    ],
    kpis: { rev: 18400, users: 4820, conv: 5.12, lat: 14.2 },
  },
  weekly: {
    subtitle: "Weekly Trajectory",
    areaD: "M 30,220 L 30,160 L 120,110 L 210,140 L 300,70 L 390,90 L 480,40 L 570,80 L 570,220 Z",
    lineD: "M 30,160 L 120,110 L 210,140 L 300,70 L 390,90 L 480,40 L 570,80",
    points: [
      { cx: 30, cy: 160, val: "$18.2k", label: "Mon" },
      { cx: 120, cy: 110, val: "$24.5k", label: "Tue" },
      { cx: 210, cy: 140, val: "$21.0k", label: "Wed" },
      { cx: 300, cy: 70, val: "$32.8k", label: "Thu" },
      { cx: 390, cy: 90, val: "$29.4k", label: "Fri" },
      { cx: 480, cy: 40, val: "$38.1k", label: "Sat" },
      { cx: 570, cy: 80, val: "$31.2k", label: "Sun" },
    ],
    kpis: { rev: 128450, users: 42890, conv: 4.85, lat: 18.4 },
  },
  monthly: {
    subtitle: "Monthly Performance Growth",
    areaD: "M 30,220 L 30,190 L 120,150 L 210,110 L 300,80 L 390,60 L 480,45 L 570,30 L 570,220 Z",
    lineD: "M 30,190 L 120,150 L 210,110 L 300,80 L 390,60 L 480,45 L 570,30",
    points: [
      { cx: 30, cy: 190, val: "$85k", label: "Jan" },
      { cx: 120, cy: 150, val: "$110k", label: "Feb" },
      { cx: 210, cy: 110, val: "$145k", label: "Mar" },
      { cx: 300, cy: 80, val: "$190k", label: "Apr" },
      { cx: 390, cy: 60, val: "$240k", label: "May" },
      { cx: 480, cy: 45, val: "$290k", label: "Jun" },
      { cx: 570, cy: 30, val: "$340k", label: "Jul" },
    ],
    kpis: { rev: 540200, users: 189400, conv: 6.2, lat: 16.1 },
  },
};

function switchDataTab(mode, btn) {
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  // Trigger Skeleton Loading Effect
  const skeletons = document.querySelectorAll(".skeleton-overlay");
  skeletons.forEach((s) => s.classList.add("active"));

  setTimeout(() => {
    const data = chartDataSets[mode];

    // Update SVG Chart
    document.getElementById("chartSubtitle").innerText = data.subtitle;
    document.getElementById("chartArea").setAttribute("d", data.areaD);
    document.getElementById("chartLine").setAttribute("d", data.lineD);

    // Update Points
    const ptsGroup = document.getElementById("chartPoints");
    ptsGroup.innerHTML = "";
    data.points.forEach((pt) => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("class", "chart-point");
      circle.setAttribute("cx", pt.cx);
      circle.setAttribute("cy", pt.cy);
      circle.setAttribute("data-val", pt.val);
      circle.setAttribute("data-label", pt.label);
      ptsGroup.appendChild(circle);
    });
    attachChartTooltipListeners();

    // Update KPI targets & Trigger Count Up
    document.getElementById("kpi-rev").setAttribute("data-value", data.kpis.rev);
    document.getElementById("kpi-users").setAttribute("data-value", data.kpis.users);
    document.getElementById("kpi-conv").setAttribute("data-value", data.kpis.conv);
    document.getElementById("kpi-lat").setAttribute("data-value", data.kpis.lat);
    triggerCountUp();

    // Remove Skeletons
    skeletons.forEach((s) => s.classList.remove("active"));
  }, 450);
}

// ----------------------------------------------------
// 4. Interactive SVG Chart Tooltips
// ----------------------------------------------------
function attachChartTooltipListeners() {
  const tooltip = document.getElementById("chartTooltip");
  document.querySelectorAll(".chart-point").forEach((pt) => {
    pt.addEventListener("mouseenter", (e) => {
      const val = pt.getAttribute("data-val");
      const label = pt.getAttribute("data-label");
      tooltip.innerHTML = `<strong>${label}</strong>: ${val}`;

      const rect = pt.getBoundingClientRect();
      const containerRect = pt.closest(".chart-container").getBoundingClientRect();

      tooltip.style.left = rect.left - containerRect.left + rect.width / 2 + "px";
      tooltip.style.top = rect.top - containerRect.top + "px";
      tooltip.classList.add("visible");
    });

    pt.addEventListener("mouseleave", () => {
      tooltip.classList.remove("visible");
    });
  });
}
attachChartTooltipListeners();

// ----------------------------------------------------

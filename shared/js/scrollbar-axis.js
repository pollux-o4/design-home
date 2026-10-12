// One axis owns its affordance and pointer/keyboard commands, not layout measurement.
export function createScrollbarAxis(region, { root, axis, schedule }) {
  const vertical = axis === "y";
  const rail = document.createElement("div"),
    thumb = document.createElement("span");
  rail.className = "dh-scroll-rail";
  rail.dataset.axis = axis;
  if (root) rail.dataset.root = "";
  rail.tabIndex = 0;
  rail.setAttribute("role", "scrollbar");
  rail.setAttribute("aria-controls", region.id);
  rail.setAttribute(
    "aria-label",
    `${region.getAttribute("aria-label") ?? (root ? "페이지" : "영역")} ${vertical ? "세로" : "가로"} 스크롤`,
  );
  rail.setAttribute("aria-orientation", vertical ? "vertical" : "horizontal");
  rail.setAttribute("aria-valuemin", "0");
  thumb.className = "dh-scroll-thumb";
  thumb.setAttribute("aria-hidden", "true");
  rail.append(thumb);
  document.body.append(rail);
  let timer, drag, metrics;
  let disposed = false;
  const position = () => (vertical ? region.scrollTop : region.scrollLeft);
  function move(value) {
    const bounded = Math.max(0, Math.min(metrics.max, value));
    if (vertical) region.scrollTop = bounded;
    else region.scrollLeft = bounded;
    schedule();
    reveal();
  }
  function reveal() {
    if (disposed) return;
    rail.classList.add("is-active");
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!drag) rail.classList.remove("is-active");
    }, 900);
  }
  function update(snapshot) {
    const { rect, tokens } = snapshot;
    const currentPosition = snapshot[vertical ? "positionY" : "positionX"];
    const visible = snapshot[vertical ? "visibleY" : "visibleX"];
    const total = snapshot[vertical ? "totalY" : "totalX"];
    const length = Math.max(0, (vertical ? rect.height : rect.width) - 16);
    const size = Math.min(
      length,
      Math.max(32, length * (total ? visible / total : 1)),
    );
    metrics = {
      max: Math.max(0, total - visible),
      length,
      size,
      travel: length - size,
    };
    rail.hidden = metrics.max < 1 || length <= 0 || snapshot.hidden;
    rail.style.top = `${vertical ? rect.top + 8 : rect.bottom - 20}px`;
    rail.style.left = `${vertical ? rect.right - 20 : rect.left + 8}px`;
    rail.style[vertical ? "height" : "width"] = `${length}px`;
    for (const property of ["--dh-scroll-ink", "--dh-scroll-layer"]) {
      const value = tokens[property];
      if (value.trim()) rail.style.setProperty(property, value);
    }
    thumb.style[vertical ? "height" : "width"] = `${size}px`;
    thumb.style.transform = `translate${vertical ? "Y" : "X"}(${metrics.max ? (currentPosition / metrics.max) * metrics.travel : 0}px)`;
    rail.setAttribute("aria-valuemax", String(Math.round(metrics.max)));
    rail.setAttribute("aria-valuenow", String(Math.round(currentPosition)));
  }
  const coordinate = (event) => (vertical ? event.clientY : event.clientX);
  rail.addEventListener("pointerenter", reveal);
  rail.addEventListener("pointerleave", reveal);
  rail.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || !metrics?.max) return;
    event.preventDefault();
    rail.focus({ preventScroll: true });
    if (!thumb.contains(event.target)) {
      const rect = rail.getBoundingClientRect();
      move(
        ((coordinate(event) -
          (vertical ? rect.top : rect.left) -
          metrics.size / 2) /
          metrics.travel) *
          metrics.max,
      );
    }
    drag = { start: coordinate(event), position: position() };
    rail.setPointerCapture(event.pointerId);
    rail.classList.add("is-dragging");
    document.documentElement.classList.add("dh-scroll-dragging");
    reveal();
  });
  rail.addEventListener("pointermove", (event) => {
    if (drag && metrics.travel)
      move(
        drag.position +
          ((coordinate(event) - drag.start) / metrics.travel) * metrics.max,
      );
  });
  function stopDrag() {
    drag = null;
    rail.classList.remove("is-dragging");
    document.documentElement.classList.remove("dh-scroll-dragging");
    reveal();
  }
  rail.addEventListener("pointerup", stopDrag);
  rail.addEventListener("pointercancel", stopDrag);
  rail.addEventListener("lostpointercapture", stopDrag);
  rail.addEventListener("keydown", (event) => {
    const page = (vertical ? region.clientHeight : region.clientWidth) * 0.85;
    const deltas = vertical
      ? { ArrowDown: 40, ArrowUp: -40 }
      : { ArrowRight: 40, ArrowLeft: -40 };
    if (
      event.key === "Home" ||
      event.key === "End" ||
      event.key === "PageDown" ||
      event.key === "PageUp" ||
      Object.hasOwn(deltas, event.key)
    ) {
      event.preventDefault();
      move(
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? metrics.max
            : position() +
              (event.key === "PageDown"
                ? page
                : event.key === "PageUp"
                  ? -page
                  : deltas[event.key]),
      );
    }
  });
  return {
    update,
    reveal,
    dispose() {
      disposed = true;
      clearTimeout(timer);
      if (drag) stopDrag();
      rail.remove();
    },
  };
}

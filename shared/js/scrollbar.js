import { createScrollbarAxis } from "./scrollbar-axis.js";
import { scheduleScrollbar, cancelScrollbar } from "./scrollbar-frame.js";

const mounted = new Map();
let nextId = 0;
export function mountScrollbar(region, { root = false } = {}) {
  if (mounted.has(region)) return mounted.get(region).api;
  if (!region.id) region.id = `dh-scroll-region-${++nextId}`;
  region.classList.add("dh-scroll-native");
  const axes = ["y", "x"].map((axis) =>
    createScrollbarAxis(region, {
      root,
      axis,
      schedule: () => handle.update(),
    }),
  );
  const children = new Set();
  let disposed = false;
  const resize = new ResizeObserver(() => handle.update());
  const handle = {
    update: () => {
      if (!disposed) scheduleScrollbar(handle);
    },
    read() {
      const rect = root
        ? {
            top: 0,
            left: 0,
            width: innerWidth,
            height: innerHeight,
            right: innerWidth,
            bottom: innerHeight,
          }
        : region.getBoundingClientRect();
      const style = getComputedStyle(region);
      return {
        rect,
        tokens: Object.fromEntries(
          ["--dh-scroll-ink", "--dh-scroll-layer"].map((property) => [
            property,
            style.getPropertyValue(property),
          ]),
        ),
        positionY: region.scrollTop,
        positionX: region.scrollLeft,
        visibleY: root ? innerHeight : region.clientHeight,
        visibleX: root ? innerWidth : region.clientWidth,
        totalY: region.scrollHeight,
        totalX: region.scrollWidth,
        hidden: !!region.closest("[hidden], [inert]") || (!root && !region.getClientRects().length),
      };
    },
    write(snapshot) {
      axes.forEach((axis) => axis.update(snapshot));
    },
    refresh() {
      const current = new Set([
        root ? document.body : region,
        ...[...(root ? document.body : region).children].filter(
          (child) => !child.matches(".dh-scroll-rail"),
        ),
      ]);
      for (const child of children)
        if (!current.has(child)) {
          resize.unobserve(child);
          children.delete(child);
        }
      for (const child of current)
        if (!children.has(child)) {
          children.add(child);
          resize.observe(child);
        }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelScrollbar(handle);
      region.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onRootScroll);
      resize.disconnect();
      axes.forEach((axis) => axis.dispose());
      region.classList.remove("dh-scroll-native");
      mounted.delete(region);
    },
  };
  function onScroll() {
    handle.update();
    axes.forEach((axis) => axis.reveal());
  }
  region.addEventListener("scroll", onScroll, { passive: true });
  if (root) document.addEventListener("scroll", onRootScroll, { passive: true });
  function onRootScroll(event) {
    if (event.target === document) onScroll();
  }
  handle.api = { update: handle.update, dispose: handle.dispose };
  mounted.set(region, handle);
  handle.refresh();
  handle.update();
  return handle.api;
}

function updateAll() {
  mounted.forEach((handle) => handle.update());
}
window.addEventListener("resize", updateAll);
document.addEventListener("scroll", updateAll, {
  capture: true,
  passive: true,
});
function discover(node) {
  if (node.matches("[data-scroll-region]")) mountScrollbar(node);
  node.querySelectorAll("[data-scroll-region]").forEach((region) => mountScrollbar(region));
}
new MutationObserver((records) => {
  let structural = false;
  for (const record of records) {
    if (record.target.closest?.(".dh-scroll-rail")) continue;
    if (record.type === "attributes") {
      mounted.get(record.target)?.update();
      record.target
        .querySelectorAll(".dh-scroll-native")
        .forEach((region) => mounted.get(region)?.update());
      continue;
    }
    const changed = [...record.addedNodes, ...record.removedNodes].filter(
      (node) => node.nodeType === 1 && !node.matches(".dh-scroll-rail"),
    );
    if (!changed.length) continue;
    structural = true;
    for (const node of record.addedNodes)
      if (node.nodeType === 1 && !node.matches(".dh-scroll-rail")) discover(node);
    const region = record.target.closest?.(".dh-scroll-native");
    mounted.get(region)?.refresh();
  }
  if (structural) for (const [region, handle] of mounted) if (!region.isConnected) handle.dispose();
}).observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["hidden", "inert"],
});
discover(document.body);

import { announce } from "./lifecycle.js";
import { createMotionController } from "./motion-controller.js";

function scrollRatio(element) {
  const range = element.scrollHeight - element.clientHeight;
  return range > 0 ? Math.max(0, Math.min(1, element.scrollTop / range)) : 0;
}
export function spatialScrollReveal(root, scope) {
  const scroller = root.querySelector(".spatial-scroll");
  const items = [...root.querySelectorAll("[data-reveal]")];
  const motion = createMotionController(root, scope);
  const revealed = new Set();
  const update = () => {
    const viewport = scroller.getBoundingClientRect();
    items.forEach((item) => {
      if (
        revealed.has(item) ||
        item.getBoundingClientRect().top >= viewport.bottom - 20
      )
        return;
      revealed.add(item);
      item.classList.add("is-revealed");
      motion.play(item, [
        { opacity: 0, transform: "translateY(24px)" },
        { opacity: 1, transform: "translateY(0)" },
      ]);
      announce(root, `${revealed.size} / ${items.length} 영역을 발견했습니다.`);
    });
  };
  scope.on(scroller, "scroll", update);
  update();
}
export function spatialScrollProgress(root, scope) {
  const scroller = root.querySelector(".spatial-scroll");
  const track = root.querySelector('[role="progressbar"]');
  const bar = root.querySelector("[data-progress]");
  const output = root.querySelector("[data-reading-output]");
  const update = () => {
    const value = Math.round(scrollRatio(scroller) * 100);
    bar.style.width = `${value}%`;
    track.setAttribute("aria-valuenow", value);
    output.value = `${value}%`;
  };
  scope.on(scroller, "scroll", update);
  const resize = new ResizeObserver(update);
  resize.observe(scroller);
  scroller
    .querySelectorAll("section")
    .forEach((section) => resize.observe(section));
  scope.own(() => resize.disconnect());
  update();
}
export function spatialParallax(root, scope) {
  const scroller = root.querySelector(".parallax-scroll");
  const layers = [...root.querySelectorAll("[data-depth]")];
  const motion = createMotionController(root, scope);
  const update = () =>
    layers.forEach((layer) => {
      layer.style.transform = motion.reduced()
        ? ""
        : `translateY(${-scrollRatio(scroller) * 100 * Number(layer.dataset.depth)}px)`;
    });
  scope.on(scroller, "scroll", update);
  scope.on(matchMedia("(prefers-reduced-motion: reduce)"), "change", update);
  scope.own(() => layers.forEach((layer) => (layer.style.transform = "")));
  update();
}
export function spatialCardTilt(root, scope) {
  const stage = root.querySelector("[data-tilt-stage]");
  const card = root.querySelector("[data-tilt-card]");
  const motion = createMotionController(root, scope);
  let pointerDriven = false;
  const tilt = (x, y) => {
    card.style.transform = motion.reduced()
      ? ""
      : `rotateX(${y}deg) rotateY(${x}deg)`;
  };
  scope.on(stage, "pointermove", (event) => {
    if (event.pointerType === "touch") return;
    pointerDriven = true;
    const bounds = stage.getBoundingClientRect();
    tilt(
      ((event.clientX - bounds.left) / bounds.width - 0.5) * 18,
      ((event.clientY - bounds.top) / bounds.height - 0.5) * -18,
    );
  });
  scope.on(stage, "pointerleave", () => {
    if (pointerDriven) tilt(0, 0);
  });
  scope.on(
    matchMedia("(prefers-reduced-motion: reduce)"),
    "change",
    (event) => {
      if (event.matches) tilt(0, 0);
    },
  );
  scope.on(root, "click", (event) => {
    const button = event.target.closest("[data-tilt]");
    if (!button) return;
    pointerDriven = false;
    const angles = {
      left: [-9, 0],
      right: [9, 0],
      up: [0, 9],
      down: [0, -9],
      reset: [0, 0],
    };
    tilt(...angles[button.dataset.tilt]);
    announce(
      root,
      motion.reduced()
        ? "움직임 줄이기 설정으로 카드를 평면으로 표시합니다."
        : `${button.getAttribute("aria-label") || "카드 초기화"}`,
    );
  });
  scope.own(() => tilt(0, 0));
}
export function spatialPageSlide(root, scope) {
  const page = root.querySelector("[data-page]");
  const previous = root.querySelector("[data-previous]");
  const next = root.querySelector("[data-next]");
  const motion = createMotionController(root, scope);
  const pages = [
    ["발견하기", "새로운 아이디어를 만나세요."],
    ["자세히 보기", "중요한 부분에 더 가까이."],
    ["완성하기", "당신의 시선으로 이어가세요."],
  ];
  let index = 0;
  function update(direction = 0) {
    root.querySelector("[data-page-count]").textContent = `0${index + 1} / 03`;
    root.querySelector("[data-page-title]").textContent = pages[index][0];
    root.querySelector("[data-page-desc]").textContent = pages[index][1];
    page.dataset.step = index;
    previous.disabled = index === 0;
    next.disabled = index === pages.length - 1;
    if (direction) {
      motion.cancel();
      motion.play(page, [
        { transform: `translateX(${direction * 45}%)`, opacity: 0 },
        { transform: "translateX(0)", opacity: 1 },
      ]);
      announce(root, `${index + 1}번째 화면, ${pages[index][0]}`);
    }
  }
  scope.on(previous, "click", () => {
    if (index > 0) {
      index--;
      update(-1);
    }
  });
  scope.on(next, "click", () => {
    if (index < pages.length - 1) {
      index++;
      update(1);
    }
  });
  update();
}
export function spatialSwipeStack(root, scope) {
  const card = root.querySelector("[data-swipe-card]");
  const motion = createMotionController(root, scope);
  const titles = ["빛의 리듬", "고요한 곡선", "균형의 순간", "새로운 궤도"];
  let index = 0;
  let pointer = null;
  function move(direction) {
    index = (index + direction + titles.length) % titles.length;
    root.querySelector("[data-stack-title]").textContent = titles[index];
    root.querySelector("[data-stack-count]").textContent = `0${index + 1} / 04`;
    card.dataset.step = index;
    card.style.transform = "";
    motion.cancel();
    motion.play(card, [
      {
        transform: `translateX(${direction * 90}px) rotate(${direction * 8}deg)`,
        opacity: 0,
      },
      { transform: "translateX(0) rotate(0)", opacity: 1 },
    ]);
    announce(root, `${index + 1}번째 카드, ${titles[index]}`);
  }
  scope.on(root.querySelector("[data-previous]"), "click", () => move(-1));
  scope.on(root.querySelector("[data-next]"), "click", () => move(1));
  scope.on(card, "pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    card.setPointerCapture(event.pointerId);
    motion.cancel();
  });
  scope.on(card, "pointermove", (event) => {
    if (!pointer || pointer.id !== event.pointerId || motion.reduced()) return;
    const delta = Math.max(-110, Math.min(110, event.clientX - pointer.x));
    card.style.transform = `translateX(${delta}px) rotate(${delta / 15}deg)`;
  });
  const finish = (event) => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const delta = event.clientX - pointer.x;
    const vertical = Math.abs(event.clientY - pointer.y);
    pointer = null;
    card.style.transform = "";
    if (
      event.type === "pointerup" &&
      Math.abs(delta) > 45 &&
      Math.abs(delta) > vertical
    )
      move(delta < 0 ? 1 : -1);
  };
  scope.on(card, "pointerup", finish);
  scope.on(card, "pointercancel", finish);
  scope.on(card, "lostpointercapture", () => {
    pointer = null;
    card.style.transform = "";
  });
  scope.on(matchMedia("(prefers-reduced-motion: reduce)"), "change", () => {
    card.style.transform = "";
  });
  scope.own(() => {
    pointer = null;
    card.style.transform = "";
  });
}

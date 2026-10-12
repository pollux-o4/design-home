import { announce } from "./lifecycle.js";
import { createMotionController } from "./motion-controller.js";

export function motionEasing(root, scope) {
  const motion = createMotionController(root, scope);
  const curves = [
    "linear",
    "cubic-bezier(.65,0,.35,1)",
    "cubic-bezier(.16,1,.3,1)",
  ];
  scope.on(root.querySelector("[data-replay]"), "click", () => {
    motion.cancel();
    root.querySelectorAll("[data-curve]").forEach((dot, index) => {
      const travel = dot.parentElement.clientWidth - dot.offsetWidth;
      motion.play(
        dot,
        [
          { transform: "translateX(0)" },
          { transform: `translateX(${travel}px)` },
          { transform: "translateX(0)" },
        ],
        { duration: 1800, easing: curves[index] },
      );
    });
    announce(root, "세 가지 속도 곡선을 같은 시간 동안 비교합니다.");
  });
}
export function motionStagger(root, scope) {
  const motion = createMotionController(root, scope);
  scope.on(root.querySelector("[data-replay]"), "click", () => {
    motion.cancel();
    root.querySelectorAll("[data-reveal]").forEach((item, index) =>
      motion.play(
        item,
        [
          { opacity: 0, transform: "translateY(22px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 650, delay: index * 130, fill: "backwards" },
      ),
    );
    announce(root, "콘텐츠가 위에서 아래로 순차적으로 등장합니다.");
  });
}
export function motionSpring(root, scope) {
  const motion = createMotionController(root, scope);
  const damping = root.querySelector("[data-damping]");
  function replay() {
    motion.cancel();
    const frames = Array.from({ length: 61 }, (_, index) => {
      const time = index / 60;
      const displacement =
        index === 60
          ? 0
          : -82 * Math.exp(-Number(damping.value) * time) * Math.cos(15 * time);
      return { transform: `translateX(${displacement}px)`, offset: time };
    });
    motion.play(root.querySelector("[data-orb]"), frames, {
      duration: 1400,
      easing: "linear",
    });
    announce(
      root,
      `감쇠 ${damping.value}의 스프링입니다. 값이 높을수록 빨리 안정됩니다.`,
    );
  }
  scope.on(root.querySelector("[data-replay]"), "click", replay);
  scope.on(damping, "change", replay);
}
export function motionFlip(root, scope) {
  const motion = createMotionController(root, scope);
  const grid = root.querySelector("[data-flip-grid]");
  scope.on(root.querySelector("[data-reorder]"), "click", () => {
    motion.cancel();
    const items = [...grid.children];
    const before = items.map((item) => item.getBoundingClientRect());
    grid.append(grid.firstElementChild);
    items.forEach((item, index) => {
      const after = item.getBoundingClientRect();
      motion.play(
        item,
        [
          {
            transform: `translate(${before[index].left - after.left}px, ${before[index].top - after.top}px)`,
          },
          { transform: "translate(0, 0)" },
        ],
        { duration: 650 },
      );
    });
    announce(
      root,
      `첫 번째 카드가 ${grid.firstElementChild.textContent.trim()}로 바뀌었습니다.`,
    );
  });
}
export function motionCrossfade(root, scope) {
  const motion = createMotionController(root, scope);
  const scenes = [...root.querySelectorAll("[data-scene]")];
  let selected = 0;
  let revision = 0;
  scope.own(() => {
    revision++;
  });
  scope.on(root.querySelector("[data-next]"), "click", async () => {
    const turn = ++revision;
    motion.cancel();
    const previous = selected;
    selected = 1 - selected;
    scenes.forEach((scene, index) => {
      scene.hidden = false;
      scene.inert = index !== selected;
      scene.setAttribute("aria-hidden", String(index !== selected));
    });
    await Promise.all([
      motion.play(scenes[previous], [{ opacity: 1 }, { opacity: 0 }], {
        duration: 650,
      }),
      motion.play(scenes[selected], [{ opacity: 0 }, { opacity: 1 }], {
        duration: 650,
      }),
    ]);
    if (turn !== revision) return;
    scenes[previous].hidden = true;
    announce(
      root,
      selected
        ? "초록의 장면으로 전환했습니다."
        : "파랑의 장면으로 전환했습니다.",
    );
  });
}
export function motionSharedElement(root, scope) {
  const motion = createMotionController(root, scope);
  const stage = root.querySelector(".mf-shared");
  const art = root.querySelector("[data-shared-art]");
  const detail = root.querySelector("[data-detail]");
  const open = root.querySelector("[data-open]");
  const close = root.querySelector("[data-close]");
  let expanded = false;
  let revision = 0;
  scope.own(() => {
    revision++;
  });
  async function change(next) {
    if (expanded === next) return;
    const turn = ++revision;
    motion.cancel();
    const before = art.getBoundingClientRect();
    expanded = next;
    if (!next && detail.contains(document.activeElement)) open.focus();
    stage.classList.toggle("is-expanded", next);
    detail.hidden = !next;
    open.setAttribute("aria-expanded", String(next));
    open.textContent = next ? "카드로 돌아가기" : "자세히 보기";
    const after = art.getBoundingClientRect();
    const transform = `translate(${before.left - after.left}px, ${before.top - after.top}px) scale(${before.width / after.width}, ${before.height / after.height})`;
    await Promise.all([
      motion.play(
        art,
        [
          { transform, borderRadius: next ? "20px" : "12px" },
          { transform: "none", borderRadius: next ? "12px" : "20px" },
        ],
        { duration: 650 },
      ),
      next
        ? motion.play(
            detail,
            [
              { opacity: 0, transform: "translateY(12px)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: 450, delay: 200, fill: "backwards" },
          )
        : Promise.resolve(),
    ]);
    if (turn !== revision) return;
    if (next && document.activeElement === open) close.focus();
    announce(
      root,
      next ? "카드 상세 정보를 열었습니다." : "카드로 돌아왔습니다.",
    );
  }
  scope.on(open, "click", () => change(!expanded));
  scope.on(close, "click", () => change(false));
  scope.on(stage, "keydown", (event) => {
    if (event.key === "Escape" && expanded) {
      event.preventDefault();
      change(false);
    }
  });
}

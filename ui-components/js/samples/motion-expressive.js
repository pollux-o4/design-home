import { createMotionController } from "./motion-controller.js";
import { announce } from "./lifecycle.js";

export function svgDraw(root, scope) {
  const motion = createMotionController(root, scope);
  const path = root.querySelector("[data-draw]");
  scope.on(root.querySelector("[data-motion-play]"), "click", () => {
    motion.play(path, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
      duration: 1200,
    });
    announce(root, motion.reduced() ? "심볼이 완성되었습니다." : "선을 따라 심볼을 그립니다.");
  });
}

export function metricCounter(root, scope) {
  const motion = createMotionController(root, scope);
  const metric = root.querySelector("[data-metric]");
  const summary = root.querySelector("[data-metric-summary]");
  const targets = [8420, 12000, 16480];
  let index = 0;
  let frame = 0;
  let value = targets[0];
  const cancel = () => cancelAnimationFrame(frame);
  scope.own(cancel);
  scope.on(root.querySelector("[data-motion-play]"), "click", () => {
    cancel();
    const from = value;
    const target = targets[(index = (index + 1) % targets.length)];
    const start = performance.now();
    summary.textContent = `이번 달 ${target.toLocaleString("ko-KR")} 걸음`;
    const tick = (now) => {
      const progress =
        motion.reduced() || document.hidden || root.closest("[hidden], [inert]")
          ? 1
          : Math.min(1, (now - start) / 1000);
      value = Math.round(from + (target - from) * (1 - Math.pow(1 - progress, 3)));
      metric.textContent = value.toLocaleString("ko-KR");
      if (progress < 1) frame = requestAnimationFrame(tick);
      else announce(root, `${target.toLocaleString("ko-KR")} 걸음으로 갱신되었습니다.`);
    };
    tick(start);
  });
}

export function textReveal(root, scope) {
  const motion = createMotionController(root, scope);
  scope.on(root.querySelector("[data-motion-play]"), "click", () => {
    Promise.all(
      [...root.querySelectorAll("[data-word]")].map((word, index) =>
        motion.play(
          word,
          [
            { transform: "translateY(20px)", opacity: 0, filter: "blur(6px)" },
            { transform: "translateY(0)", opacity: 1, filter: "blur(0)" },
          ],
          { duration: 700, delay: index * 120 },
        ),
      ),
    );
    announce(root, "Make room for wonder.");
  });
}

export function meshGradient(root, scope) {
  const motion = createMotionController(root, scope);
  const stage = root.querySelector("[data-mesh]");
  const button = root.querySelector("[data-motion-play]");
  let alternate = false;
  scope.on(button, "click", () => {
    motion.cancel();
    alternate = !alternate;
    stage.classList.toggle("mesh-alternate", alternate);
    button.setAttribute("aria-pressed", String(alternate));
    root.querySelectorAll("[data-light]").forEach((light, index) => {
      const distance = (index % 2 ? -1 : 1) * 26;
      motion.play(
        light,
        [
          { transform: `translate(${distance}px, ${-distance}px) scale(.86)` },
          { transform: "translate(0, 0) scale(1)" },
        ],
        { duration: 1400 },
      );
    });
    announce(
      root,
      alternate ? "보랏빛 분위기로 전환되었습니다." : "푸른빛 분위기로 전환되었습니다.",
    );
  });
}

export function productOrbit(root, scope) {
  const motion = createMotionController(root, scope);
  const track = root.querySelector("[data-orbit]");
  const play = root.querySelector("[data-motion-play]");
  const pause = root.querySelector("[data-motion-pause]");
  let paused = false;
  let running = false;
  let generation = 0;
  scope.own(() => {
    generation++;
    running = false;
  });
  scope.on(play, "click", async () => {
    const current = ++generation;
    motion.cancel();
    running = !motion.reduced();
    paused = false;
    pause.disabled = !running;
    pause.textContent = "일시 정지";
    announce(
      root,
      running ? "궤도 모션을 재생합니다." : "움직임 줄이기 설정으로 완성된 구성을 표시합니다.",
    );
    await motion.play(track, [{ transform: "rotate(0)" }, { transform: "rotate(360deg)" }], {
      duration: 4800,
      easing: "linear",
    });
    if (current !== generation) return;
    running = false;
    pause.disabled = true;
    pause.textContent = "일시 정지";
    announce(
      root,
      motion.reduced()
        ? "움직임 줄이기 설정으로 완성된 구성을 표시합니다."
        : "궤도 모션이 종료되었습니다.",
    );
  });
  scope.on(pause, "click", () => {
    if (!running) return;
    paused = !paused;
    track.getAnimations().forEach((animation) => (paused ? animation.pause() : animation.play()));
    pause.textContent = paused ? "계속 재생" : "일시 정지";
    announce(root, paused ? "일시 정지되었습니다." : "다시 재생합니다.");
  });
}

export function successBurst(root, scope) {
  const motion = createMotionController(root, scope);
  const seal = root.querySelector("[data-seal]");
  const label = root.querySelector("[data-success-label]");
  const button = root.querySelector("[data-motion-play]");
  scope.on(button, "click", () => {
    motion.cancel();
    label.textContent = "모두 완료했어요.";
    button.textContent = "다시 축하하기";
    seal.classList.add("success-complete");
    motion.play(
      seal,
      [
        { transform: "scale(.65)" },
        { transform: "scale(1.12)", offset: 0.65 },
        { transform: "scale(1)" },
      ],
      { duration: 550 },
    );
    root.querySelectorAll("[data-particle]").forEach((particle, index) => {
      const angle = (index / 12) * Math.PI * 2;
      const x = Math.cos(angle) * (64 + (index % 3) * 10);
      const y = Math.sin(angle) * 62;
      motion.play(
        particle,
        [
          { transform: "translate(0, 0) rotate(0)", opacity: 0 },
          { opacity: 1, offset: 0.15 },
          {
            transform: `translate(${x}px, ${y}px) rotate(${index * 35}deg)`,
            opacity: 0,
          },
        ],
        { duration: 900 },
      );
    });
    announce(root, "작업이 완료되었습니다.");
  });
}

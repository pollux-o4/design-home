import { createMotionController } from "./motion-controller.js";
import { announce } from "./lifecycle.js";
export function morphAction(root, scope) {
  const action = root.querySelector("[data-morph-action]"),
    label = root.querySelector("[data-action-label]"),
    cancel = root.querySelector("[data-action-cancel]");
  let timer,
    phase = "idle",
    progress = 0;
  // Phase is the state source; DOM attributes are its projection.
  function render() {
    const restoreFocus =
      document.activeElement === cancel && phase !== "progress";
    const sending = phase === "progress";
    action.dataset.state = phase;
    action.disabled = sending;
    cancel.hidden = !sending;
    if (sending) action.setAttribute("aria-busy", "true");
    else action.removeAttribute("aria-busy");
    if (phase === "idle") action.style.removeProperty("--morph-progress");
    else action.style.setProperty("--morph-progress", `${progress}%`);
    label.textContent = sending
      ? `보내는 중 ${progress}%`
      : phase === "done"
        ? "완료 · 다시 보내기"
        : "파일 보내기";
    if (restoreFocus && !root.closest("[hidden],[inert]"))
      action.focus({ preventScroll: true });
  }
  function reset(message) {
    scope.cancel(timer);
    phase = "idle";
    progress = 0;
    render();
    announce(root, message);
  }
  function tick() {
    progress += 20;
    if (progress === 100) phase = "done";
    render();
    if (phase === "progress") timer = scope.later(tick, 250);
    else announce(root, "로컬 전송 시뮬레이션이 완료되었습니다.");
  }
  scope.on(action, "click", () => {
    if (phase === "done") {
      reset("다시 보낼 준비가 되었습니다.");
      return;
    }
    if (phase !== "idle") return;
    phase = "progress";
    render();
    cancel.focus({ preventScroll: true });
    announce(root, "로컬 전송 시뮬레이션을 시작했습니다. 취소할 수 있습니다.");
    timer = scope.later(tick, 250);
  });
  scope.on(cancel, "click", () => reset("전송을 취소했습니다."));
}
export function morphIsland(root, scope) {
  const motion = createMotionController(root, scope);
  const island = root.querySelector("[data-island]"),
    toggle = root.querySelector("[data-island-toggle]"),
    detail = root.querySelector("[data-island-detail]"),
    play = root.querySelector("[data-play]");
  const tracks = ["Quiet Morning", "Ocean Light", "Evening Walk"];
  let index = 0,
    playing = false;
  function expand(open) {
    const from = island.getBoundingClientRect().height;
    motion.cancel();
    if (!open && detail.contains(document.activeElement))
      toggle.focus({ preventScroll: true });
    toggle.setAttribute("aria-expanded", String(open));
    detail.hidden = !open;
    island.classList.toggle("is-expanded", open);
    motion.play(
      island,
      [{ height: `${from}px` }, { height: `${island.scrollHeight}px` }],
      { duration: 350 },
    );
    announce(
      root,
      open ? "재생 컨트롤을 펼쳤습니다." : "작은 재생 상태로 돌아왔습니다.",
    );
  }
  scope.on(toggle, "click", () => expand(detail.hidden));
  scope.on(root.querySelector("[data-collapse]"), "click", () => expand(false));
  scope.on(island, "keydown", (event) => {
    if (event.key === "Escape" && !detail.hidden) {
      event.preventDefault();
      expand(false);
    }
  });
  scope.on(play, "click", () => {
    playing = !playing;
    play.textContent = playing ? "일시 정지" : "재생";
    root.querySelector("[data-play-state]").textContent = playing
      ? "재생 중"
      : "일시 정지";
    island.classList.toggle("is-playing", playing);
    announce(
      root,
      playing
        ? "재생 상태로 변경했습니다. 실제 오디오는 재생하지 않습니다."
        : "일시 정지 상태로 변경했습니다.",
    );
  });
  scope.on(root.querySelector("[data-next]"), "click", () => {
    index = (index + 1) % tracks.length;
    root.querySelector("[data-track]").textContent = tracks[index];
    announce(root, `${tracks[index]} 곡을 선택했습니다.`);
  });
}

import { announce } from "./lifecycle.js";
export function taskSteps(root, scope) {
  const steps = [...root.querySelectorAll("li")];
  const progress = root.querySelector("progress");
  const start = root.querySelector('[data-action="start"]');
  const cancel = root.querySelector('[data-action="cancel"]');
  let timer;
  let stage = 0;
  function render() {
    progress.value = stage;
    steps.forEach(
      (step, index) =>
        (step.dataset.state = index < stage ? "done" : index === stage ? "active" : "waiting"),
    );
  }
  function advance() {
    stage++;
    render();
    if (stage === 3) {
      start.disabled = false;
      cancel.disabled = true;
      start.textContent = "다시 시작";
      announce(root, "결과 생성 완료.");
      return;
    }
    announce(root, `${steps[stage].textContent} 중`);
    timer = scope.later(advance, 650);
  }
  scope.on(start, "click", () => {
    scope.cancel(timer);
    stage = 0;
    render();
    start.disabled = true;
    cancel.disabled = false;
    announce(root, "파일 준비 중");
    timer = scope.later(advance, 650);
  });
  scope.on(cancel, "click", () => {
    scope.cancel(timer);
    start.disabled = false;
    start.textContent = "다시 시도";
    cancel.disabled = true;
    announce(root, `${stage}단계 완료 후 취소했습니다.`);
  });
  cancel.disabled = true;
  render();
}
export function connectionState(root, scope) {
  const select = root.querySelector("select");
  const save = root.querySelector('[data-action="save"]');
  const queue = root.querySelector('[data-action="queue"]');
  let queued = false;
  function update() {
    const online = select.value === "online";
    save.disabled = !online;
    queue.disabled = online || queued;
    root.querySelector("[data-connection]").textContent = online ? "연결됨" : "연결 끊김";
    if (online && queued) {
      queued = false;
      announce(root, "연결 복구. 대기 중인 변경을 저장했습니다.");
    } else
      announce(
        root,
        online
          ? "온라인: 변경 사항을 저장할 수 있습니다."
          : "오프라인: 변경 사항을 대기열에 추가하세요.",
      );
  }
  scope.on(select, "change", update);
  scope.on(save, "click", () => announce(root, "변경 사항을 저장했습니다. (시뮬레이션)"));
  scope.on(queue, "click", () => {
    queued = true;
    queue.disabled = true;
    announce(root, "변경 사항 1개 대기 중. 온라인으로 전환하면 저장합니다.");
  });
  update();
}
export function optimisticSave(root, scope) {
  const favorite = root.querySelector('[data-action="favorite"]');
  const retry = root.querySelector('[data-action="retry"]');
  const scenario = root.querySelector("select");
  let saved = false;
  let failedTarget = null;
  function project(value) {
    favorite.setAttribute("aria-pressed", String(value));
    favorite.textContent = value ? "즐겨찾기됨" : "즐겨찾기";
  }
  function persist(target, success) {
    favorite.disabled = true;
    retry.disabled = true;
    scenario.disabled = true;
    project(target);
    announce(root, "먼저 반영했습니다. 저장 확인 중…");
    scope.later(() => {
      favorite.disabled = false;
      scenario.disabled = false;
      if (success) {
        saved = target;
        failedTarget = null;
        announce(root, "즐겨찾기를 저장했습니다.");
      } else {
        project(saved);
        failedTarget = target;
        retry.disabled = false;
        announce(root, "저장 실패. 이전 상태로 복구했습니다. 다시 시도할 수 있습니다.");
      }
    }, 650);
  }
  scope.on(favorite, "click", () => persist(!saved, scenario.value === "success"));
  scope.on(retry, "click", () => {
    if (failedTarget !== null) persist(failedTarget, true);
  });
  retry.disabled = true;
}
export function notificationCenter(root, scope) {
  const list = root.querySelector("[data-notifications]");
  const unread = root.querySelector("[data-unread]");
  const restore = root.querySelector('[data-action="restore"]');
  const items = [
    { id: 1, title: "프로젝트 검토 요청", read: false },
    { id: 2, title: "새로운 의견 2개", read: false },
    { id: 3, title: "디자인 저장 완료", read: true },
  ];
  let dismissed = [];
  function render() {
    list.replaceChildren();
    root.querySelector("[data-count]").textContent =
      `읽지 않음 ${items.filter((item) => !item.read && !item.dismissed).length}`;
    restore.disabled = !dismissed.length;
    items
      .filter((item) => !item.dismissed && (!unread.checked || !item.read))
      .forEach((item) => {
        const row = document.createElement("div");
        row.className = "workflow-notification";
        const label = document.createElement("strong");
        label.textContent = item.title;
        const state = document.createElement("span");
        state.className = "sample-muted";
        state.textContent = item.read ? "읽음" : "새 알림";
        const actions = document.createElement("div");
        actions.className = "sample-row";
        if (!item.read) {
          const read = document.createElement("button");
          read.className = "ui-btn";
          read.textContent = "읽음";
          read.dataset.read = String(item.id);
          read.setAttribute("aria-label", `${item.title} 읽음 처리`);
          actions.append(read);
        }
        const dismiss = document.createElement("button");
        dismiss.className = "ui-btn";
        dismiss.textContent = "지우기";
        dismiss.dataset.dismiss = String(item.id);
        dismiss.setAttribute("aria-label", `${item.title} 지우기`);
        actions.append(dismiss);
        row.append(label, state, actions);
        list.append(row);
      });
    if (!list.children.length) {
      const empty = document.createElement("p");
      empty.className = "sample-muted";
      empty.textContent = "표시할 알림이 없습니다.";
      list.append(empty);
    }
  }
  scope.on(unread, "change", render);
  scope.on(list, "click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const id = Number(button.dataset.read || button.dataset.dismiss);
    const item = items.find((item) => item.id === id);
    if (button.dataset.read) item.read = true;
    else {
      item.dismissed = true;
      dismissed.push(item);
    }
    render();
    unread.focus();
    announce(
      root,
      button.dataset.read ? "읽음 처리했습니다." : "알림을 지웠습니다. 복구할 수 있습니다.",
    );
  });
  scope.on(restore, "click", () => {
    dismissed.forEach((item) => (item.dismissed = false));
    dismissed = [];
    render();
    announce(root, "지운 알림을 복구했습니다.");
  });
  render();
}
export function autosave(root, scope) {
  const input = root.querySelector("textarea");
  const scenario = root.querySelector("select");
  const retry = root.querySelector('[data-action="retry"]');
  let committed = input.value;
  let revision = 0;
  let debounce;
  let pending;
  function save() {
    const version = revision;
    const snapshot = input.value;
    const succeeds = scenario.value === "success";
    retry.disabled = true;
    announce(root, "저장 중…");
    pending = scope.later(() => {
      if (version !== revision) return;
      if (succeeds) {
        committed = snapshot;
        announce(root, "모든 변경 사항을 저장했습니다.");
      } else {
        retry.disabled = false;
        announce(root, "저장 실패. 입력 내용은 유지됩니다. 저장 결과를 바꿔 다시 시도하세요.");
      }
    }, 550);
  }
  scope.on(input, "input", () => {
    revision++;
    scope.cancel(debounce);
    scope.cancel(pending);
    retry.disabled = true;
    if (input.value === committed) {
      announce(root, "저장된 내용과 같습니다.");
      return;
    }
    announce(root, "저장하지 않은 변경 사항");
    debounce = scope.later(save, 700);
  });
  scope.on(retry, "click", () => {
    scope.cancel(debounce);
    scope.cancel(pending);
    save();
  });
  retry.disabled = true;
  announce(root, "저장됨 · 이 카드 안의 시뮬레이션");
}

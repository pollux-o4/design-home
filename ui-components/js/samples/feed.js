/* Instance state prevents a removed feed's delayed response from updating a new feed. */
export function feed(root, scope) {
  const limit = 10,
    initialCount = 4;
  const list = root.querySelector("#infinite-scroll-list");
  const load = root.querySelector("#btn-load-more");
  const status = root.querySelector("#infinite-scroll-status");
  let count = initialCount,
    state = "idle",
    pending;
  function item(index) {
    const row = document.createElement("div");
    row.className = "infinite-item-card";
    const label = document.createElement("span");
    label.textContent = `데이터 피드 #${index}`;
    const badge = document.createElement("span");
    badge.className = "ui-badge ui-badge-success";
    badge.textContent = "정상";
    row.append(label, badge);
    return row;
  }
  function update() {
    status.textContent = `${count} / ${limit}개${state === "done" ? " · 완료" : ""}`;
    load.disabled = state !== "idle";
    load.textContent =
      state === "loading"
        ? "불러오는 중…"
        : state === "done"
          ? "모두 불러왔습니다"
          : "더 보기 (+2)";
    list.setAttribute("aria-busy", String(state === "loading"));
  }
  function reset() {
    scope.cancel(pending);
    state = "idle";
    count = initialCount;
    list.replaceChildren(
      ...Array.from({ length: initialCount }, (_, i) => item(i + 1)),
    );
    list.scrollTop = 0;
    update();
  }
  function next() {
    if (state !== "idle" || !list.isConnected) return;
    state = "loading";
    update();
    pending = scope.later(() => {
      if (!list.isConnected) return;
      const end = Math.min(count + 2, limit);
      while (count < end) list.append(item(++count));
      state = count === limit ? "done" : "idle";
      update();
    }, 400);
  }
  function scroll() {
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 10) next();
  }
  scope.on(load, "click", next);
  scope.on(root.querySelector("#btn-reset-infinite"), "click", reset);
  scope.on(list, "scroll", scroll);
  reset();
  return { next, reset, scroll };
}

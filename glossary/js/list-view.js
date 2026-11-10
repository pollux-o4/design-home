function table(items, context) {
  const table = context.el("table", "terms-table");
  const caption = context.el("caption", "sr-only", "용어, 뜻, 시각적 예시와 체험");
  const head = context.el("thead");
  const labels = context.el("tr");
  ["용어", "한 줄 뜻", "예시"].forEach((title) => {
    const cell = context.el("th", "", title);
    cell.scope = "col";
    labels.append(cell);
  });
  head.append(labels);
  const body = context.el("tbody");
  for (const entry of items) {
    const row = context.el("tr", "term-row");
    row.dataset.term = entry.id;
    const name = context.el("th", "term-name");
    name.scope = "row";
    const title = context.link(
      entry.title,
      { ...context.state, category: entry.category, id: entry.id, example: "" },
      "term-link",
    );
    const english = context.el("span", "term-english", entry.term);
    english.lang = "en";
    name.append(title, english);
    const definition = context.el("td", "term-definition", entry.desc);
    const preview = context.el("td", "term-preview");
    const trigger = context.button("", "try-button", () =>
      context.onExpand(entry, row, trigger),
    );
    trigger.dataset.expand = entry.id;
    trigger.setAttribute("aria-label", `${entry.title} 예시 체험`);
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", `example-${entry.id}`);
    trigger.append(context.visual(entry.visual), context.el("span", "try-label", "체험"));
    preview.append(trigger);
    row.append(name, definition, preview);
    const extra = context.el("tr", "expanded-row");
    extra.id = `example-${entry.id}`;
    extra.hidden = true;
    const extraCell = context.el("td");
    extraCell.colSpan = 3;
    extra.append(extraCell);
    body.append(row, extra);
  }
  table.append(caption, head, body);
  return table;
}
export function renderGlossaryList(context) {
  const { state, entries, categories, search, container, status, el, button, link } = context;
  const query = state.query.trim().toLocaleLowerCase();
  const filtered = entries.filter((entry) =>
    [entry.title, entry.term, entry.desc]
      .join(" ")
      .toLocaleLowerCase()
      .includes(query),
  );
  search.value = state.query;
  document.querySelector("#clear-search").hidden = !state.query;
  document.querySelector("#term-count").textContent = filtered.length;
  document.querySelector("#empty-state").hidden = filtered.length !== 0;
  container.replaceChildren();
  for (const category of categories) {
    const items = filtered.filter((entry) => entry.category === category.id);
    if (!items.length) continue;
    const section = el("section", `term-category category-${category.id}`);
    const heading = el("h2");
    const isOpen = state.category === category.id || Boolean(query);
    const toggle = button("", "category-toggle", () => {
      // Search reveals matching categories; choosing a category exits search into that list.
      context.navigate({
        category: state.category === category.id && !query ? "" : category.id,
        query: "",
      });
    });
    toggle.id = `category-${category.id}`;
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-controls", `panel-${category.id}`);
    const copy = el("span", "category-copy");
    copy.append(
      el("span", "category-title", category.title),
      el("span", "category-subtitle", category.subtitle),
    );
    toggle.append(
      el("span", "category-mark", category.mark),
      copy,
      el("span", "category-count", String(items.length)),
      el("span", "category-chevron", isOpen ? "−" : "+"),
    );
    heading.append(toggle);
    const panel = el("div", "category-panel");
    panel.id = `panel-${category.id}`;
    panel.hidden = !isOpen;
    if (isOpen) panel.append(table(items, context));
    section.append(heading, panel);
    container.append(section);
  }
  status.textContent = state.invalid
    ? "찾을 수 없는 용어 주소입니다. 용어집에서 다시 선택하세요."
    : `용어 ${filtered.length}개`;
  if (state.invalid) {
    const notice = el(
      "p",
      "route-notice",
      "이 주소의 용어를 찾을 수 없어요. 아래에서 다시 찾아보세요.",
    );
    container.prepend(notice);
  }
}

import { fields } from "./fields.js";
import { element, officialLink, exampleLink } from "./elements.js";
export function renderComparison(container, items, onRemove) {
  container.replaceChildren();
  if (!items.length) return;
  const scroller = element("div", "comparison-scroll");
  scroller.tabIndex = 0;
  scroller.setAttribute("role", "region");
  scroller.setAttribute("aria-label", "라이브러리 비교 표, 가로 스크롤 가능");
  const table = element("table");
  const caption = element(
    "caption",
    "sr-only",
    "선택한 라이브러리의 역할, 환경과 선택 기준",
  );
  const head = element("thead"),
    row = element("tr");
  const axis = element("th", "", "선택 기준");
  axis.scope = "col";
  row.append(axis);
  for (const item of items) {
    const cell = element("th");
    cell.scope = "col";
    const remove = element("button", "remove-library", "제거");
    remove.type = "button";
    remove.setAttribute("aria-label", `${item.name} 비교에서 제거`);
    remove.addEventListener("click", () => onRemove(item.id));
    cell.append(element("span", "", item.name), remove);
    row.append(cell);
  }
  head.append(row);
  const body = element("tbody");
  for (const { key, title } of [
    ...fields,
    { key: "docs", title: "더 알아보기" },
  ]) {
    const row = element("tr"),
      label = element("th", "", title);
    label.scope = "row";
    row.append(label);
    for (const item of items) {
      const cell = element("td");
      if (key === "docs")
        cell.append(exampleLink(item), element("br"), officialLink(item));
      else cell.textContent = item[key];
      row.append(cell);
    }
    body.append(row);
  }
  table.append(caption, head, body);
  scroller.append(table);
  container.append(
    element(
      "p",
      "comparison-help",
      "표를 좌우로 스크롤해 다른 도구와 비교하세요.",
    ),
    scroller,
  );
}

import { fields } from "./fields.js";
import { element, officialLink, exampleLink } from "./elements.js";
export function createLibraryCard(item, onCompare) {
  const card = element("article", "library-card");
  card.dataset.library = item.id;
  const header = element("div", "library-card-heading");
  header.append(element("h3", "", item.name));
  const compare = element("button", "compare-button", "비교에 추가");
  compare.type = "button";
  compare.addEventListener("click", () => onCompare(item.id));
  header.append(compare);
  const details = element("details", "library-details");
  details.append(element("summary", "", "특징과 선택 기준"));
  const list = element("dl");
  for (const { key, title } of fields.filter((field) => field.detail))
    list.append(element("dt", "", title), element("dd", "", item[key]));
  details.append(list);
  const outcomes = element("div", "library-outcomes");
  outcomes.append(
    element("p", "outcomes-label", fields.find((field) => field.key === "capabilities").title),
    element("p", "outcomes-description", item.capabilities),
  );
  const links = element("div", "library-links");
  links.append(exampleLink(item), officialLink(item));
  card.append(
    header,
    element("p", "library-summary", item.summary),
    element("p", "environment", item.environment),
    outcomes,
    links,
    details,
  );
  return {
    element: card,
    update(selected, full) {
      compare.textContent = selected ? "비교에서 제거" : "비교에 추가";
      compare.setAttribute("aria-pressed", String(selected));
      compare.setAttribute("aria-label", `${item.name} ${compare.textContent}`);
      compare.disabled = full && !selected;
    },
  };
}

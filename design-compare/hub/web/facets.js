import { element } from "./render.js";
import { tagDisclosure } from "./tag-disclosure.js";

function tagChip(tag, selected, clickable, toggle) {
  const chip = element(
    clickable ? "button" : "span",
    `${tag.label}${tag.count !== undefined ? ` ${tag.count}` : ""}${selected ? " ×" : ""}`,
    "facet-chip",
  );
  chip.title = `${tag.groupLabel} · ${tag.id}`;
  if (clickable) {
    chip.type = "button";
    chip.dataset.tag = tag.id;
    chip.setAttribute("aria-pressed", String(selected));
    chip.addEventListener("click", () => toggle(tag.id));
  }
  return chip;
}

export function renderFacets(result, toggle) {
  const container = document.querySelector("#facets");
  container.replaceChildren();
  for (const [title, tags, selected, clickable] of [
    ["인식한 의도", result.recognizedTags, false, false],
    ["선택한 태그", result.selectedTags, true, true],
    ["연관 태그", result.relatedTags, false, true],
  ]) {
    if (!tags.length) continue;
    const section = element("section", null, "facet-section");
    section.setAttribute("aria-label", title);
    section.append(element("h2", title, "facet-heading"));
    for (const group of result.tagGroups) {
      const members = tags.filter((tag) => tag.group === group.id);
      if (!members.length) continue;
      const row = element("div", null, "facet-row");
      row.dataset.group = group.id;
      row.setAttribute("role", "group");
      row.setAttribute("aria-label", group.label);
      row.append(element("span", group.label, "facet-label"));
      if (title === "연관 태그") {
        row.append(
          tagDisclosure(members, group, (tag) =>
            tagChip(tag, selected, clickable, toggle),
          ),
        );
      } else {
        const chips = element("div", null, "facet-chips");
        for (const tag of members)
          chips.append(tagChip(tag, selected, clickable, toggle));
        row.append(chips);
      }
      section.append(row);
    }
    container.append(section);
  }
  if (result.relatedTags.length)
    container.append(element("p", result.relationBasis, "facet-help"));
}

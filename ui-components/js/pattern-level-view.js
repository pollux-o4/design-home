import { levels } from "./pattern-levels.js";
// An opened topic renders each available difficulty once, in reading order.
export function createLevelView({ id, definitions, createCard }) {
  const element = document.createElement("div");
  element.className = "pattern-level-view";
  let created = false;
  return {
    element,
    update({ active = false } = {}) {
      if (!active || created) return;
      created = true;
      for (const level of levels) {
        const items = definitions.filter((definition) => definition.level === level.id);
        if (!items.length) continue;
        const section = document.createElement("section");
        section.className = "pattern-level-section";
        section.dataset.level = level.id;
        const heading = document.createElement("h2");
        heading.id = `level-heading-${id}-${level.id}`;
        heading.className = "pattern-level-heading";
        heading.textContent = level.title;
        section.setAttribute("aria-labelledby", heading.id);
        const description = document.createElement("p");
        description.className = "pattern-level-description";
        description.textContent = `${level.description} · ${items.length}개`;
        const grid = document.createElement("div");
        grid.className = "components-grid";
        grid.append(...items.map(createCard));
        section.append(heading, description, grid);
        element.append(section);
      }
    },
  };
}

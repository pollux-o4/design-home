/* Card presentation knows nothing about sample behavior or category state. */
import { levels } from "./pattern-levels.js";
export function createSampleCard(definition) {
  const card = document.createElement("article");
  card.className = "component-card";
  const header = document.createElement("div");
  header.className = "component-card-header";
  const content = document.createElement("div");
  const title = document.createElement("h3");
  title.className = "component-title";
  title.textContent = definition.title;
  const term = document.createElement("p");
  term.className = "component-term";
  term.lang = "en";
  term.textContent = definition.term;
  const description = document.createElement("p");
  description.className = "component-subdesc";
  description.textContent = definition.desc;
  const level = document.createElement("span");
  level.className = "component-level";
  level.textContent = levels.find((item) => item.id === definition.level).title;
  content.append(level, title, term, description);
  const reference = document.createElement("a");
  reference.className = "component-reference";
  reference.dataset.compId = definition.id;
  reference.href = definition.reference;
  reference.target = "_blank";
  reference.rel = "noopener noreferrer";
  reference.textContent = "공식 문서 ↗";
  reference.setAttribute("aria-label", `${definition.title} 공식 문서 (새 탭)`);
  header.append(content, reference);
  const body = document.createElement("div");
  body.className = "component-body";
  body.innerHTML = definition.render();
  card.append(header, body);
  return card;
}

export function createSampleGrid(definitions) {
  const grid = document.createElement("div");
  grid.className = "components-grid";
  definitions.forEach((definition) => grid.append(createSampleCard(definition)));
  return grid;
}

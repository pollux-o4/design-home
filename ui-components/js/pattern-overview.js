import { routeHref } from "./pattern-route.js";
export function createOverview(topics, view) {
  const grid = document.createElement("div");
  grid.className = "pattern-overview";
  for (const [index, topic] of topics.entries()) {
    const link = document.createElement("a");
    link.className = "pattern-topic-card";
    link.href = routeHref({ category: topic.id, view });
    const number = document.createElement("span");
    number.className = "pattern-topic-number";
    number.textContent = String(index + 1).padStart(2, "0");
    const title = document.createElement("h2");
    title.textContent = topic.title;
    const term = document.createElement("p");
    term.className = "pattern-topic-term";
    term.lang = "en";
    term.textContent = topic.term;
    const description = document.createElement("p");
    description.className = "pattern-topic-desc";
    description.textContent = topic.desc;
    const action = document.createElement("span");
    action.className = "pattern-topic-action";
    action.textContent = document.documentElement.lang === "en" ? "Explore →" : "살펴보기 →";
    link.append(number, title);
    if (document.documentElement.lang !== "en") link.append(term);
    link.append(description, action);
    grid.append(link);
  }
  return grid;
}

import { routeHref, selectPatternGroup } from "./pattern-route.js";
import { createDisclosure } from "./disclosure.js";
import { createSampleCard } from "./sample-card.js";
import { createLevelView } from "./pattern-level-view.js";

// A topic owns its hierarchy and projections, not sample behavior or history.
export function createTopicView(topic, navigate) {
  const element = document.createDocumentFragment();
  let currentState;
  const breadcrumb = document.createElement("nav");
  breadcrumb.className = "pattern-breadcrumb";
  breadcrumb.setAttribute("aria-label", "현재 위치");
  const home = document.createElement("a");
  home.href = "#/";
  home.textContent = "Patterns";
  const current = document.createElement("span");
  current.textContent = topic.title;
  current.setAttribute("aria-current", "page");
  breadcrumb.append(home, " / ", current);
  const header = document.createElement("header");
  header.className = "pattern-topic-header";
  const title = document.createElement("h1");
  title.textContent = topic.title;
  const term = document.createElement("p");
  term.className = "pattern-topic-term";
  term.lang = "en";
  term.textContent = topic.term;
  const desc = document.createElement("p");
  desc.textContent = topic.desc;
  header.append(title, term, desc);
  element.append(breadcrumb, header);
  const groups = [];
  for (const group of topic.groups) {
    const disclosure = createDisclosure({
      id: `content-${topic.id}-${group.id}`,
      title: group.title,
      subtitle: group.term ? `${group.term} · ${group.desc}` : group.desc,
      onToggle: (nextOpen) => {
        navigate(selectPatternGroup(currentState, topic.id, nextOpen ? group.id : null));
      },
    });
    const collection = createLevelView({
      id: `${topic.id}-${group.id}`,
      definitions: group.components,
      createCard: createSampleCard,
    });
    if (group.reference) {
      const reference = document.createElement("a");
      reference.className = "principle-reference";
      reference.href = group.reference;
      reference.target = "_blank";
      reference.rel = "noopener noreferrer";
      reference.textContent = "원칙 설명 읽기 ↗";
      reference.setAttribute("aria-label", `${group.title} 원칙 설명 (새 탭)`);
      disclosure.content.append(reference);
    }
    disclosure.content.append(collection.element);
    element.append(disclosure.element);
    groups.push({ id: group.id, disclosure, collection });
  }
  function update(state) {
    currentState = state;
    home.href = routeHref({ view: state.view });
    for (const group of groups) {
      const active = group.id === state.group;
      group.collection.update({ active });
      group.disclosure.setOpen(active);
    }
  }
  return {
    element,
    update,
    groupTarget: (id) => groups.find((group) => group.id === id)?.disclosure.button,
    settled: () => Promise.all(groups.map(({ disclosure }) => disclosure.settled())),
    dispose: () =>
      groups.forEach(({ disclosure }) => {
        disclosure.dispose();
      }),
  };
}

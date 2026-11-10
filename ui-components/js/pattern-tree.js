import { createDisclosure } from "./disclosure.js";
import { routeHref, selectPatternGroup } from "./pattern-route.js";
export function createPatternTree(root, model, navigate) {
  let entries = [],
    currentView;
  function build(view) {
    entries.forEach((entry) => entry.dispose());
    root.replaceChildren();
    currentView = view;
    entries = model.topicsFor(view).map((topic) => {
      const item = document.createElement("li");
      item.className = "layer-item";
      item.dataset.target = topic.id;
      const disclosure = createDisclosure({
        id: `tree-${topic.id}`,
        title: topic.title,
        onToggle: (nextOpen) =>
          navigate({
            view,
            category: nextOpen ? topic.id : null,
            group: null,
            query: "",
          }),
      });
      disclosure.button.classList.add("category-button");
      for (const group of topic.groups) {
        const link = document.createElement("a");
        link.className = "pattern-shortcut";
        link.href = routeHref({ view, category: topic.id, group: group.id });
        link.dataset.group = group.id;
        link.textContent = group.title;
        disclosure.content.append(link);
      }
      item.append(disclosure.element);
      root.append(item);
      return { topic, ...disclosure };
    });
  }
  return {
    invalidate() { currentView = undefined; },
    update(state) {
      if (currentView !== state.view) build(state.view);
      for (const entry of entries) {
        const selected = entry.topic.id === state.category;
        entry.setOpen(selected);
        entry.button.setAttribute("aria-current", selected ? "true" : "false");
        for (const link of entry.panel.querySelectorAll("a")) {
          link.href = routeHref(
            selectPatternGroup(state, entry.topic.id, link.dataset.group),
          );
          if (selected && link.dataset.group === state.group)
            link.setAttribute("aria-current", "page");
          else link.removeAttribute("aria-current");
        }
      }
    },
  };
}

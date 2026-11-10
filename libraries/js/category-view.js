import { createDisclosure } from "../../shared/js/disclosure.js";
import { createLibraryCard } from "./library-card.js";
import { element } from "./elements.js";
import { matches, comparisonLimit } from "./route.js";
// A category owns card projection and disclosure lifetime, not URL/history.
export function createCategoryView(category, items, { onToggle, onCompare }) {
  const view = createDisclosure({
    id: `library-${category.id}`,
    title: category.title,
    subtitle: `${category.term} · ${items.length}개`,
    onToggle,
  });
  view.content.append(element("p", "category-description", category.description));
  const grid = element("div", "library-grid");
  const cards = items.map((item) => ({
    item,
    ...createLibraryCard(item, onCompare),
  }));
  grid.append(...cards.map((card) => card.element));
  view.content.append(grid);
  return {
    element: view.element,
    dispose: view.dispose,
    update(state, initial = false) {
      let visible = 0;
      for (const card of cards) {
        card.element.hidden = !matches(card.item, state.query);
        if (!card.element.hidden) visible++;
        card.update(state.compare.includes(card.item.id), state.compare.length === comparisonLimit);
      }
      view.element.hidden = !visible;
      view.setOpen(!!visible && state.category === category.id, !initial);
      return visible;
    },
  };
}

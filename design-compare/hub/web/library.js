import { createListView } from './list.js';
import { createDetailView } from './detail.js';

// Facade: navigation only knows show(route, current), not the internal views.
export function createLibraryView(source) {
  const list = createListView(source), detail = createDetailView(source);
  return {
    show(route, current) {
      list.cancelPendingSearch();
      return (route.id ? detail : list).show(route, current);
    },
  };
}

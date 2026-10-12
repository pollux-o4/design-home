import { staticMode } from "./api.js";
import { startNavigation } from "./navigation.js";
import { createLibraryView } from "./library.js";
import { createActivityView } from "./activity.js";

if (staticMode) {
  for (const link of document.querySelectorAll("[data-local-only]")) link.remove();
}

const library = createLibraryView(),
  activity = createActivityView();
const views = { trends: library, components: library, work: library, activity };
startNavigation((route, current) => views[route.category].show(route, current));

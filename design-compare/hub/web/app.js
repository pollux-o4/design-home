import { staticMode, getJSON } from "./api.js";
import { startNavigation } from "./navigation.js";
import { createLibrarySource } from "./library-source.js";
import { createLibraryView } from "./library.js";
import { createActivityView } from "./activity.js";
import { createAccessibilityView } from "./accessibility.js";
import { showProject } from './project.js';

if (staticMode) {
  for (const link of document.querySelectorAll("[data-local-only]")) link.remove();
}

const library = createLibraryView(createLibrarySource(getJSON)),
  activity = createActivityView(),
  accessibility = createAccessibilityView();
const views = { features: { show() {} }, trends: library, components: library, work: library, activity, accessibility };
startNavigation((route, current) => views[route.category].show(route, current));
showProject().catch(error => {
  document.querySelector('#project-status').textContent = error.message;
});

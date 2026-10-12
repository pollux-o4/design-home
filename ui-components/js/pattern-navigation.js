import { readRoute, routeHref } from "./pattern-route.js";
// URL owns selection; session memory only restores the last subgroup on entry.
export function createPatternNavigation({ model, browser = window, onChange }) {
  let state;
  let appliedHash;
  const lastGroups = new Map();
  function apply({ syncSearch = true } = {}) {
    const route = readRoute(browser.location.hash);
    const previous = state?.view === route.view ? state?.category : null;
    const topic = model.find(route.category, route.view);
    if (!topic) route.category = null;
    if (!topic?.groups.some((group) => group.id === route.group))
      route.group = null;
    if (
      route.category &&
      !route.group &&
      previous !== route.category &&
      !route.query &&
      lastGroups.has(`${route.view}/${route.category}`)
    ) {
      route.group = lastGroups.get(`${route.view}/${route.category}`);
      browser.history.replaceState(null, "", routeHref(route));
    }
    if (route.category && !route.query) {
      if (route.group)
        lastGroups.set(`${route.view}/${route.category}`, route.group);
      else if (previous === route.category)
        lastGroups.delete(`${route.view}/${route.category}`);
    }
    const previousState = state;
    state = route;
    appliedHash = browser.location.hash;
    onChange(state, previousState, { syncSearch });
  }
  function navigate(next, { replace = false, keepInput = false } = {}) {
    const href = routeHref(next);
    if (browser.location.hash !== href)
      browser.history[replace ? "replaceState" : "pushState"](null, "", href);
    apply({ syncSearch: !keepInput });
  }
  function onHistory() {
    if (browser.location.hash !== appliedHash) apply();
  }
  return {
    navigate,
    start() {
      browser.addEventListener("hashchange", onHistory);
      browser.addEventListener("popstate", onHistory);
      apply();
    },
    dispose() {
      browser.removeEventListener("hashchange", onHistory);
      browser.removeEventListener("popstate", onHistory);
    },
  };
}

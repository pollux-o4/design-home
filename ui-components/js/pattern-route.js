// Keep the existing "purpose" URL token for the UX perspective.
export function readRoute(hash) {
  const [path, query] = hash.replace(/^#\/?/, "").split("?");
  const [category, group] = path.split("/");
  const params = new URLSearchParams(query);
  return {
    view: params.get("view") === "purpose" ? "purpose" : "kind",
    category: category || null,
    group: group || null,
    query: params.get("q") || "",
    // Older difficulty links remain readable; both sections are now displayed.
    level: params.get("level") === "advanced" ? "advanced" : "basic",
  };
}
export function routeHref({ category, group, query, level, view }) {
  const path = [category, group]
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
  const params = new URLSearchParams();
  if (view === "purpose") params.set("view", view);
  if (query) params.set("q", query);
  if (level === "advanced") params.set("level", level);
  return `#/${path}${params.size ? "?" + params : ""}`;
}

// Selection policy is shared by accordion actions and shortcut links.
export function selectPatternGroup(state, category, group) {
  return {
    ...state,
    category,
    group,
    query: "",
    level: "basic",
  };
}

import { categories, libraryById } from "./catalog.js";
export const comparisonLimit = 3;
export function readRoute(hash = location.hash) {
  const [path, query = ""] = hash.replace(/^#\/?/, "").split("?");
  const params = new URLSearchParams(query);
  const category = categories.some((item) => item.id === path) ? path : "";
  const compare = [...new Set((params.get("compare") ?? "").split(","))]
    .filter((id) => libraryById.has(id))
    .slice(0, comparisonLimit);
  return { category, query: (params.get("q") ?? "").slice(0, 120), compare };
}
export function routeUrl(state) {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.compare.length) params.set("compare", state.compare.join(","));
  return `#/${state.category}${params.size ? "?" + params : ""}`;
}
export function matches(item, query) {
  return `${item.name} ${item.environment} ${item.summary} ${item.useCase} ${item.capabilities}`
    .toLocaleLowerCase()
    .includes(query.trim().toLocaleLowerCase());
}

import { loadDesigns } from "./catalog.js";
import { searchDocuments } from "./query.js";

export function searchDesigns(query = "", selectedTags = [], { documentsRoot, kind } = {}) {
  return searchDocuments(loadDesigns(documentsRoot), query, selectedTags, kind);
}

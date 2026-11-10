import { loadDesigns } from "./catalog.js";
import { selectReferences } from "./selection.js";
import { searchDesigns } from "./search.js";
import { getDesignContext } from "./context.js";
export { parseDesignDocument, loadDesigns } from "./catalog.js";
export { rankReferences } from "./selection.js";

// Both callers use one catalog; the host supplies its source location.
export function createLibrary({ documentsRoot, sourceRoot } = {}) {
  return {
    select: (intent, { references = [], limit = 3 } = {}) =>
      selectReferences(
        intent,
        [
          ...loadDesigns(documentsRoot).map((item) => ({ ...item, origin: "library" })),
          ...references,
        ],
        limit,
      ),
    search: (query = "", tags = [], kind) => searchDesigns(query, tags, { documentsRoot, kind }),
    context: (id) => getDesignContext(id, { documentsRoot, sourceRoot }),
  };
}

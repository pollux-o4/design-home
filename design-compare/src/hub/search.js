import { createLibrary } from '../library/index.js';
const library = createLibrary({ documentsRoot: process.env.DESIGN_DOCUMENTS_ROOT });
export const searchDesigns = (query, tags, kind) => library.search(query, tags, kind);

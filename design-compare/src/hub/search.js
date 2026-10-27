import { createLibrary } from '../library/index.js';
import { loadProject } from '../project.js';
const library = createLibrary(loadProject());
export const searchDesigns = (query, tags, kind) => library.search(query, tags, kind);

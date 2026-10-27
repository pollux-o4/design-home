import { loadProject } from '../project.js';
import { createLibrary } from '../library/index.js';

// Design Home host configuration; the reusable library knows no workspace layout.
const library = createLibrary(loadProject());
export const getDesignContext = id => library.context(id);

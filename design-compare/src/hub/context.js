import { fileURLToPath } from 'node:url';
import { createLibrary } from '../library/index.js';

// Design Home host configuration; the reusable library knows no workspace layout.
const library = createLibrary({ sourceRoot: process.env.DESIGN_HOME_ROOT ?? fileURLToPath(new URL('../../../', import.meta.url)), documentsRoot: process.env.DESIGN_DOCUMENTS_ROOT });
export const getDesignContext = id => library.context(id);

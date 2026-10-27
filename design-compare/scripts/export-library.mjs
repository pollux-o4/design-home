import { mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { loadDesigns } from '../src/library/index.js';
import { getDesignContext } from '../src/hub/index.js';
import { loadProject } from '../src/project.js';

const output = fileURLToPath(new URL('../../design-library/data/', import.meta.url));
const shell = await readFile(new URL('../hub/index.html', import.meta.url), 'utf8');
const hostedShell = shell
  .replace('<body >', '<body class="design-workspace">')
  .replace('data-standalone-only>', 'data-standalone-only hidden>')
  .replace('</head>', '    <script src="../shared/js/global-nav.js" defer></script>\n    <script type="module" src="../shared/js/i18n.js"></script>\n</head>');
await writeFile(new URL('../../design-library/index.html', import.meta.url), hostedShell);
await rm(output, { recursive: true, force: true });
await mkdir(join(output, 'contexts'), { recursive: true });
const project = loadProject();
await writeFile(join(output, 'project.json'), JSON.stringify({ name: project.name, configured: project.configured }));
const designs = loadDesigns(project.documentsRoot).map(({ documentPath, ...design }) => design);
await writeFile(join(output, 'catalog.json'), JSON.stringify({ schemaVersion: 1, designs }));
for (const design of designs) {
  const { documentPath, nextActions, ...context } = await getDesignContext(design.id);
  context.sourceFiles = context.sourceFiles.map(({ absolutePath, ...file }) => file);
  await writeFile(join(output, 'contexts', `${design.id}.json`), JSON.stringify(context));
}
console.log(`Design System Library: ${designs.length} designs exported`);

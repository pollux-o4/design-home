import { mkdir, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { loadDesigns } from '../src/library/index.js';
import { getDesignContext } from '../src/hub/index.js';

const output = fileURLToPath(new URL('../../design-library/data/', import.meta.url));
await rm(output, { recursive: true, force: true });
await mkdir(join(output, 'contexts'), { recursive: true });
const designs = loadDesigns().map(({ documentPath, ...design }) => design);
await writeFile(join(output, 'catalog.json'), JSON.stringify({ schemaVersion: 1, designs }));
for (const design of designs) {
  const { documentPath, nextActions, ...context } = await getDesignContext(design.id);
  context.sourceFiles = context.sourceFiles.map(({ absolutePath, ...file }) => file);
  await writeFile(join(output, 'contexts', `${design.id}.json`), JSON.stringify(context));
}
console.log(`Design Library: ${designs.length} designs exported`);

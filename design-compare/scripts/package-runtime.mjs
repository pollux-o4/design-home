import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const workspace = resolve(packageRoot, '..');
const output = resolve(packageRoot, 'dist/runtime');
await rm(output, { recursive: true, force: true });
await mkdir(resolve(output, 'design-library'), { recursive: true });
await cp(resolve(packageRoot, 'hub/index.html'), resolve(output, 'design-library/index.html'));
for (const file of [
  'css/interface.css', 'css/global-nav.css', 'css/scrollbar.css',
  'js/page-transitions.js', 'js/theme.js', 'js/clipboard.js', 'js/icons.js', 'js/design-system-audit.js', 'js/design-system-audit-runtime.js',
  'js/scrollbar.js', 'js/scrollbar-axis.js', 'js/scrollbar-frame.js',
  'assets/interface-icons.svg',
]) {
  const destination = resolve(output, 'shared', file);
  await mkdir(resolve(destination, '..'), { recursive: true });
  await cp(resolve(workspace, 'shared', file), destination);
}
await cp(resolve(packageRoot, 'hub/web'), resolve(output, 'design-compare/hub/web'), { recursive: true });
await cp(resolve(packageRoot, 'src/library'), resolve(output, 'design-compare/src/library'), { recursive: true });

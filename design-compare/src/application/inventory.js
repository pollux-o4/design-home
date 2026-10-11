import { readdir, readFile } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
export async function inventory({ project }) {
  const root = resolve(project), candidates = [], previews = [];
  async function walk(directory) {
    for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith('.') || ['node_modules', 'dist', 'build', 'coverage'].includes(entry.name)) continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) { await walk(path); continue; }
      if (!/\.(tsx|jsx)$/.test(entry.name)) continue;
      const source = await readFile(path, 'utf8'), sourcePath = relative(root, path);
      if (/\.ui-preview\.(tsx|jsx)$/.test(entry.name)) { previews.push({ path: sourcePath, absolutePath: path, status: 'needs-review' }); continue; }
      const names = [...source.matchAll(/export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const)\s+([A-Z][\w]*)/g)].map(match => match[1]);
      if (names.length) candidates.push({ path: sourcePath, absolutePath: path, exports: names, status: 'needs-review' });
    }
  }
  await walk(root);
  return { schemaVersion: 1, status: 'inventoried', project: root, method: 'static-export-candidates', candidates, previews,
    nextActions: ['AI가 원본을 읽고 분류·샘플 연결 확인', './design link --manifest file.json --json'],
    notice: '내보낸 이름으로 찾은 후보. 실제 컴포넌트 여부와 샘플 연결은 AI 검토 필요.' };
}

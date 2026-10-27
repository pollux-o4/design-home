import { readFile, realpath } from 'node:fs/promises';
import { dirname, resolve, relative, isAbsolute, sep } from 'node:path';
import { loadDesigns } from './catalog.js';

const MAX_TEXT = 24000;
const links = (text, pattern) => [...text.matchAll(pattern)].map(match => match[1]);
export async function getDesignContext(id, { sourceRoot, documentsRoot } = {}) {
  if (!sourceRoot) throw new Error('원본 프로젝트 sourceRoot 설정 필요');
  const root = await realpath(resolve(sourceRoot)), designs = loadDesigns(documentsRoot);
  const design = designs.find(item => item.id === id);
  if (!design) throw Object.assign(new Error(`없는 디자인 ID: ${id}`), { code: 'DESIGN_NOT_FOUND' });
  const visited = new Set(), sourceFiles = [], remote = new Set();
  let remaining = MAX_TEXT;
  async function visit(path) {
    if (/^(https?:)?\/\//.test(path)) { remote.add(path); return; }
    const fullPath = resolve(root, path), localPath = relative(root, fullPath);
    if (localPath.startsWith('..') || visited.has(localPath)) return;
    const actualPath = await realpath(fullPath), actualRelative = relative(root, actualPath);
    if (actualRelative === '..' || actualRelative.startsWith(`..${sep}`) || isAbsolute(actualRelative)) throw new Error('원본 파일은 sourceRoot 내부에 있어야 합니다.');
    visited.add(localPath);
    const text = await readFile(fullPath, 'utf8');
    const excerpt = text.slice(0, Math.min(remaining, localPath.endsWith('.html') ? 3000 : 1000)); remaining -= excerpt.length;
    sourceFiles.push({ path: localPath, absolutePath: fullPath, role: localPath.endsWith('.html') ? 'markup' : localPath.endsWith('.css') ? 'styles' : 'interaction', text: excerpt, truncated: excerpt.length < text.length });
    const dependencies = localPath.endsWith('.html') ? links(text, /(?:src|href)="([^"]+\.(?:js|css)(?:\?[^" ]*)?)"/g)
      : localPath.endsWith('.css') ? links(text, /@import\s+url\(["']([^"']+)["']\)/g) : [];
    for (const dependency of dependencies) await visit(/^(https?:)?\/\//.test(dependency) ? dependency : relative(root, resolve(dirname(fullPath), dependency)));
    for (const url of links(text, /(?:src|href)="(https?:\/\/[^" ]+)"/g)) remote.add(url);
  }
  await visit(design.sourcePath);
  const html = await readFile(resolve(root, design.sourcePath), 'utf8');
  const interactionLabels = [
    [/class="[^"]*(?:theme-btn|version-btn)/, '테마 변형 전환'],
    [/toggleAccordion/, '탐색 아코디언 펼침·접힘'], [/openModal/, '프로젝트 생성 모달'],
    [/draggable="true"/, '위젯 드래그 정렬'], [/tooltip/, '차트 툴팁'], [/<form/, '입력 폼'],
  ];
  const detectedInteractions = interactionLabels.filter(([pattern]) => pattern.test(html)).map(([, label]) => label);
  const interactions = [...new Set([...design.interactions, ...detectedInteractions])];
  return { schemaVersion: 1, status: 'context', ...design, interactions,
    sourceFiles, dependencies: { local: [...visited], remote: [...remote] },
    budget: { maxCharacters: MAX_TEXT, emittedCharacters: MAX_TEXT - remaining, truncated: sourceFiles.some(file => file.truncated) },
    adoption: ['원본 HTML을 시작점으로 선택', 'styles.css의 @import 순서와 script 순서 유지', '상대 경로에 연결된 assets와 shared 의존성 함께 가져오기', '콘텐츠 교체 후 반응형·키보드·대비·모션 검증'],
    nextActions: [{ purpose: '실제 동작 화면 확인', path: design.previewPath }, { purpose: '원본 구현 확인', path: resolve(root, design.sourcePath) }] };
}

import { searchDocuments } from '../../src/library/query.js';
export const staticMode = document.documentElement.dataset.mode === 'static';
const dataRoot = new URL('data/', document.baseURI);
let catalog;
async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('불러오지 못했습니다.');
  return response.json();
}
export function contextDownload(id, kind) {
  return staticMode ? new URL(`contexts/${encodeURIComponent(id)}.json`, dataRoot).href
    : `${kind === 'work' ? '/api/components' : '/api/context'}?id=${encodeURIComponent(id)}`;
}
export function previewUrl(path) {
  return staticMode && path.startsWith('/')
    ? new URL(path.slice(1), new URL('../', document.baseURI)).href : path;
}
export async function getJSON(url) {
  if (!staticMode) {
    const response = await fetch(url), data = await response.json();
    if (!response.ok) throw new Error(data.error ?? '불러오지 못했습니다.');
    return data;
  }
  const request = new URL(url, location.href);
  const { pathname, searchParams } = request;
  if (pathname === '/api/search' || pathname === '/api/context') {
    catalog ??= fetchJSON(new URL('catalog.json', dataRoot));
    const { designs } = await catalog;
    if (pathname === '/api/search') return searchDocuments(designs, searchParams.get('q') ?? '', searchParams.getAll('tag'), searchParams.get('kind'));
    const id = searchParams.get('id');
    if (!designs.some(design => design.id === id)) throw new Error(`없는 디자인 ID: ${id}`);
    return fetchJSON(contextDownload(id));
  }
  throw new Error('등록 작업과 호출 기록은 로컬 Design Library에서 확인하세요.');
}

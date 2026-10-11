import { readdirSync, readFileSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateTags, tagDetails } from './tags.js';

export const defaultDocumentsRoot = fileURLToPath(new URL('../../library/documents/', import.meta.url));
const textList = value => Array.isArray(value) && value.every(item => typeof item === 'string');

export function parseDesignDocument(text, documentPath = '<document>') {
  const match = /^```json\r?\n([\s\S]*?)\r?\n```(?:\r?\n|$)/.exec(text);
  if (!match) throw new Error(`${documentPath}: 첫 JSON 블록에 디자인 메타데이터 필요`);
  let data;
  try { data = JSON.parse(match[1]); }
  catch { throw new Error(`${documentPath}: 잘못된 JSON 메타데이터`); }
  if (data?.schemaVersion !== 1 || typeof data.id !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(data.id)) throw new Error(`${documentPath}: schemaVersion 1과 유효한 ID 필요`);
  for (const key of ['title', 'summary', 'sourcePath', 'previewPath']) {
    if (typeof data[key] !== 'string' || !data[key].trim()) throw new Error(`${documentPath}: ${key} 필요`);
  }
  if (isAbsolute(data.sourcePath) || data.sourcePath.includes('\\') || data.sourcePath.split('/').includes('..')) throw new Error(`${documentPath}: sourcePath는 프로젝트 내부 상대 경로 필요`);
  if (!data.previewPath.startsWith('/') || data.previewPath.startsWith('//')) throw new Error(`${documentPath}: previewPath는 같은 서버의 경로 필요`);
  for (const key of ['structure', 'interactions', 'constraints']) if (!textList(data[key])) throw new Error(`${documentPath}: ${key} 문자열 목록 필요`);
  if (!data.viewport || !['width','height'].every(key => Number.isInteger(data.viewport[key]) && data.viewport[key] >= 200 && data.viewport[key] <= 3000)) throw new Error(`${documentPath}: viewport 정수 200~3000 필요`);
  for (const key of ['keywords', 'useCases', 'sources']) if (data[key] !== undefined && !textList(data[key])) throw new Error(`${documentPath}: ${key} 문자열 목록 필요`);
  if (data.capture !== undefined && (!data.capture || typeof data.capture.selector !== 'string' || !data.capture.selector.trim() || typeof data.capture.parts !== 'object' || !data.capture.parts)) throw new Error(`${documentPath}: capture selector와 parts 필요`);
  const tags = validateTags(data.tags), details = tagDetails(tags);
  return { ...data, kind: data.kind === 'page' || !data.kind ? 'trend' : data.kind, tags, tagDetails: details, intent: details.map(tag => tag.label), documentation: text.slice(match[0].length).trim(), documentPath };
}

export function loadDesigns(documentsRoot = defaultDocumentsRoot) {
  const root = resolve(documentsRoot), ids = new Set();
  return readdirSync(root).filter(name => name.endsWith('.md')).sort().map(name => {
    const path = resolve(root, name);
    if (relative(root, path).startsWith('..')) throw new Error('문서 경로 오류');
    const design = parseDesignDocument(readFileSync(path, 'utf8'), path);
    if (ids.has(design.id)) throw new Error(`${path}: 중복 디자인 ID ${design.id}`);
    ids.add(design.id); return design;
  });
}

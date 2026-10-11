import { loadDesigns } from './catalog.js';
import { searchFacets } from './facets.js';
import { validateTags } from './tags.js';
import { rankReferences } from './selection.js';

export function searchDesigns(query = '', selectedTags = [], { documentsRoot, kind } = {}) {
  validateTags(selectedTags);
  if (kind && !['trend', 'component'].includes(kind)) throw new Error('자료 종류: trend 또는 component');
  const documents = loadDesigns(documentsRoot).filter(item => !kind || item.kind === kind);
  const { results, unmatchedTerms } = rankReferences(query, documents, selectedTags);
  return { schemaVersion: 1, status: 'searched', query, method: 'document-usage-and-tags', results, ...searchFacets(results, selectedTags), unmatchedTerms,
    notice: '문서의 용도·이름·태그를 근거로 검색. 추천 적합성·접근성 검증을 의미하지 않음.' };
}

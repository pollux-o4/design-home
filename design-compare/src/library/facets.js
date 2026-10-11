import { TAGS, TAG_GROUPS, tagDetails } from './tags.js';
export function searchFacets(results, selectedTags) {
  const matchedIds = [...new Set(results.flatMap(design => design.reasons.map(reason => reason.tagId).filter(Boolean)))];
  const excluded = new Set([...matchedIds, ...selectedTags]);
  const counts = new Map();
  for (const design of results) for (const id of design.tags) if (!excluded.has(id)) counts.set(id, (counts.get(id) ?? 0) + 1);
  return {
    tagGroups: Object.entries(TAG_GROUPS).map(([id, label]) => ({ id, label })),
    recognizedTags: tagDetails(matchedIds), selectedTags: tagDetails(selectedTags),
    relatedTags: [...counts].map(([id, count]) => ({ ...TAGS[id], count }))
      .sort((a,b) => b.count-a.count || a.id.localeCompare(b.id)),
    relationBasis: '검색 결과에 함께 쓰인 태그 · 개수는 추가 선택 시 남는 디자인 수',
  };
}

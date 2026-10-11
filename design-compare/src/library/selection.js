import { TAGS, resolveTagIds } from './tags.js';

const stopWords = new Set(['화면', '페이지', '스타일', '디자인', '원해', '만들', '있는', '만들려고']);
export function rankReferences(intent, candidates, selectedTags = []) {
  const normalized = intent.normalize('NFKC').toLowerCase().trim();
  const terms = [...new Set(normalized.split(/[^\p{L}\p{N}-]+/u).filter(term => term.length > 1 && !stopWords.has(term)))];
  const matched = new Set();
  const results = candidates.map(item => {
    const reasons = [];
    const keywords = [...(item.keywords ?? []), ...(item.useCases ?? []), item.category, ...(item.tags ?? []).filter(tag => !TAGS[tag])].filter(Boolean);
    for (const word of keywords) if (normalized.includes(word.toLowerCase())) {
      const term = terms.find(term => term.includes(word.toLowerCase())) ?? word;
      reasons.push({ term, matched: word, basis: 'usage', tagId: null, group: null }); matched.add(term);
    }
    for (const term of terms) {
      const tag = resolveTagIds(term).find(id => (item.tags ?? []).includes(id));
      if (tag) { reasons.push({ term, matched: TAGS[tag].label, basis: 'curated-intent', tagId: tag, group: TAGS[tag].group }); matched.add(term); }
      if (`${item.id} ${item.title}`.toLowerCase().includes(term)) { reasons.push({ term, matched: item.title, basis: 'name', tagId: null, group: null }); matched.add(term); }
    }
    const unique = [...new Map(reasons.map(reason => [reason.tagId ?? `${reason.basis}:${reason.matched}`, reason])).values()];
    const score = unique.reduce((sum, reason) => sum + (reason.basis === 'usage' ? 3 : 1), 0);
    return { ...item, reasons: unique, score };
  }).filter(item => (!normalized || item.score > 0) && selectedTags.every(tag => (item.tags ?? []).includes(tag) || item.category === tag))
    .sort((a,b) => b.score - a.score || a.id.localeCompare(b.id));
  return { results, unmatchedTerms: terms.filter(term => !matched.has(term)) };
}

export function selectReferences(intent, candidates, limit = 3) {
  const ranked = rankReferences(intent, candidates);
  return { ...ranked, results: ranked.results.slice(0, limit), matchedCount: ranked.results.length,
    capabilities: [...new Set(candidates.flatMap(item => item.useCases ?? item.keywords ?? []).filter(Boolean))].slice(0, 20) };
}

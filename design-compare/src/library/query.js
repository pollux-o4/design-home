import { searchFacets } from "./facets.js";
import { validateTags } from "./tags.js";
import { rankReferences } from "./selection.js";

// Pure search shared by the CLI, local HTTP server and static browser adapter.
export function searchDocuments(documents, query = "", selectedTags = [], kind) {
  validateTags(selectedTags);
  if (kind && !["trend", "component"].includes(kind))
    throw new Error("자료 종류: trend 또는 component");
  const { results, unmatchedTerms } = rankReferences(
    query,
    documents.filter((item) => !kind || item.kind === kind),
    selectedTags,
  );
  return {
    schemaVersion: 1,
    status: "searched",
    query,
    method: "document-usage-and-tags",
    results,
    ...searchFacets(results, selectedTags),
    unmatchedTerms,
    notice: "문서의 용도·이름·태그를 근거로 검색. 추천 적합성·접근성 검증을 의미하지 않음.",
  };
}

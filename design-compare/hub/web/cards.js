import { previewUrl } from "./api.js";
import { element } from "./dom.js";
import { icon } from "../../../shared/js/icons.js";
import { kindLabel } from "./design-presentation.js";

export function renderResults(result, { select, reset }) {
  document.querySelector("#count").textContent = `${result.results.length}개`;
  document.querySelector("#notice").textContent = result.unmatchedTerms?.length
    ? `다른 표현으로도 검색해보세요: ${result.unmatchedTerms.join(", ")}`
    : "";
  const list = document.querySelector("#results");
  list.replaceChildren();
  if (!result.results.length) {
    const empty = element("div", null, "empty-state");
    empty.append(
      element("strong", "일치하는 디자인이 없습니다."),
      element("p", "다른 용도나 분위기로 검색해보세요."),
    );
    const clear = element("button", "전체 디자인 보기");
    clear.type = "button";
    clear.addEventListener("click", reset);
    empty.append(clear);
    list.append(empty);
  }
  for (const design of result.results) {
    const card = element("button", null, "design-card");
    card.type = "button";
    card.dataset.id = design.id;
    if (design.kind !== "work" && design.thumbnail !== null) {
      const preview = element("img", null, "design-thumbnail");
      preview.src = previewUrl(`/design-library/previews/${encodeURIComponent(design.id)}.png`);
      preview.alt = `${design.title} 미리보기`;
      preview.loading = "lazy";
      preview.decoding = "async";
      preview.width = 640;
      preview.height = 400;
      card.append(preview);
    }
    card.append(
      element("span", kindLabel(design.kind), "card-label"),
      element("strong", design.title),
      element("p", design.summary),
      element("span", null, "card-action"),
    );
    card.querySelector(".card-action").append(icon("chevron"));
    const reasons = design.reasons?.map((reason) =>
      typeof reason === "string" ? reason : `${reason.term} → ${reason.matched}`,
    );
    if (reasons?.length) card.title = reasons.join(" · ");
    const tags = element("div", null, "tags");
    for (const tag of (design.tagDetails ?? []).slice(0, 2)) {
      const badge = element("span", tag.label);
      badge.title = `${tag.groupLabel} · ${tag.id}`;
      tags.append(badge);
    }
    card.append(tags);
    card.addEventListener("click", () => select(design.id));
    list.append(card);
  }
}

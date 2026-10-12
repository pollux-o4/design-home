import { contextDownload, previewUrl } from "./api.js";
export function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}
export function renderResults(result, select) {
  document.querySelector("#count").textContent = `${result.results.length}개`;
  document.querySelector("#notice").textContent = result.unmatchedTerms?.length
    ? `다른 표현으로도 검색해보세요: ${result.unmatchedTerms.join(", ")}`
    : "";
  const list = document.querySelector("#results");
  list.replaceChildren();
  if (!result.results.length)
    list.append(
      element(
        "p",
        "일치하는 디자인이 없습니다. 다른 용도나 분위기로 검색해보세요.",
      ),
    );
  for (const design of result.results) {
    const card = element("button", null, "design-card");
    card.type = "button";
    card.dataset.id = design.id;
    if (design.kind !== 'work') {
      const preview = element('img', null, 'design-thumbnail');
      preview.src = previewUrl(`/design-library/previews/${encodeURIComponent(design.id)}.png`);
      preview.alt = `${design.title} 미리보기`;
      preview.loading = 'lazy'; preview.decoding = 'async';
      preview.width = 640; preview.height = 400;
      card.append(preview);
    }
    card.append(
      element(
        "span",
        design.kind === "component"
          ? "COMPONENT"
          : design.kind === "work"
            ? "YOUR WORK"
            : "DESIGN TREND",
        "card-label",
      ),
      element("strong", design.title),
      element("p", design.summary),
      element("span", "자세히 보기 ↗", "card-action"),
    );
    const reasons = design.reasons?.map((reason) =>
      typeof reason === "string"
        ? reason
        : `${reason.term} → ${reason.matched}`,
    );
    if (reasons?.length) card.title = reasons.join(" · ");
    const tags = element("div", null, "tags");
    for (const tag of (design.tagDetails ?? []).slice(0, 2)) {
      const badge = element("span", tag.label);
      badge.title = `${tag.groupLabel} · ${tag.id}`;
      tags.append(badge);
    }
    card.append(tags);
    card.addEventListener("click", () => select(design.id, true));
    list.append(card);
  }
}
export function renderContext(design) {
  const detail = document.querySelector("#detail");
  detail.hidden = false;
  document.querySelector("#detail-kind").textContent =
    design.kind === "component"
      ? "COMPONENT"
      : design.kind === "work"
        ? "YOUR WORK"
        : "DESIGN TREND";
  document.querySelector("#title").textContent = design.title;
  document.querySelector("#summary").textContent = design.summary;
  const preview = document.querySelector("#preview");
  preview.onload = () => {
    if (!design.capture?.openSelector) return;
    try {
      preview.contentDocument
        ?.querySelector(design.capture.openSelector)
        ?.click();
    } catch {
      /* External sample servers own their interaction state. */
    }
  };
  preview.src = previewUrl(design.previewPath);
  document.querySelector("#open-preview").href = previewUrl(design.previewPath);
  const context = document.querySelector("#context");
  context.replaceChildren();
  for (const [label, items] of [
    [
      "적합한 의도",
      (design.tagDetails ?? []).map(
        (tag) => `${tag.groupLabel} · ${tag.label}`,
      ),
    ],
    ["화면 구조", design.structure],
    ["상호작용", design.interactions],
    ["적용 전 확인", design.constraints],
    ["적용 순서", design.adoption],
  ]) {
    const section = element("section");
    section.append(element("h3", label));
    const list = element("ul");
    for (const item of items ?? [])
      list.append(
        element("li", typeof item === "string" ? item : JSON.stringify(item)),
      );
    section.append(list);
    context.append(section);
  }
  if (design.documentation) {
    const section = element("section");
    section.append(element("h3", "디자인 문서"));
    const body = element("div");
    for (const block of design.documentation.split(/\n\s*\n/)) {
      const heading = /^(#{1,6}) (.+)$/.exec(block);
      if (heading)
        body.append(
          element(`h${Math.min(heading[1].length + 1, 6)}`, heading[2]),
        );
      else if (block.split("\n").every((line) => /^[-*] /.test(line))) {
        const list = element("ul");
        for (const line of block.split("\n"))
          list.append(element("li", line.slice(2)));
        body.append(list);
      } else body.append(element("p", block));
    }
    section.append(body);
    context.append(section);
  }
  const sources = element("details");
  sources.append(
    element(
      "summary",
      `구현 원본 · ${(design.sourceFiles ?? []).length}개 파일`,
    ),
  );
  for (const file of design.sourceFiles ?? [])
    sources.append(element("p", file.path, "source"));
  context.append(sources);
  document.querySelector("#command").textContent =
    design.kind === "work"
      ? `./design inspect --reference ${design.id} --json`
      : `./design context --id ${design.id} --json`;
  document.querySelector("#download").href =
    contextDownload(design.id, design.kind);
  document.querySelector("#download").download = `${design.id}.json`;
}

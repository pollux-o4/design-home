import { contextDownload, previewUrl } from "./api.js";
import { element } from "./dom.js";
import { kindLabel } from "./design-presentation.js";

export function renderContext(design) {
  const detail = document.querySelector("#detail");
  detail.hidden = false;
  document.querySelector("#detail-kind").textContent = kindLabel(design.kind);
  document.querySelector("#title").textContent = design.title;
  document.querySelector("#summary").textContent = design.summary;
  const preview = document.querySelector("#preview");
  preview.onload = () => {
    if (!design.capture?.openSelector) return;
    try {
      preview.contentDocument?.querySelector(design.capture.openSelector)?.click();
    } catch {
      /* External sample servers own their interaction state. */
    }
  };
  const openPreview = document.querySelector("#open-preview");
  let missing = document.querySelector("#preview-unavailable");
  if (!missing) {
    missing = element("p", "미리보기를 연결하려면 프로젝트 설정에 baseUrl을 지정하세요.", "muted");
    missing.id = "preview-unavailable";
    preview.before(missing);
  }
  const available = Boolean(design.previewPath);
  missing.hidden = available;
  preview.hidden = !available;
  openPreview.hidden = !available;
  if (available) {
    preview.src = previewUrl(design.previewPath);
    openPreview.href = previewUrl(design.previewPath);
  } else {
    preview.removeAttribute("src");
    openPreview.removeAttribute("href");
  }
  const context = document.querySelector("#context");
  context.replaceChildren();
  for (const [label, items] of [
    ["적합한 의도", (design.tagDetails ?? []).map((tag) => `${tag.groupLabel} · ${tag.label}`)],
    ["화면 구조", design.structure],
    ["상호작용", design.interactions],
    ["적용 전 확인", design.constraints],
    ["적용 순서", design.adoption],
  ]) {
    const section = element("section");
    section.append(element("h3", label));
    const list = element("ul");
    for (const item of items ?? [])
      list.append(element("li", typeof item === "string" ? item : JSON.stringify(item)));
    section.append(list);
    context.append(section);
  }
  if (design.documentation) {
    const section = element("section");
    section.append(element("h3", "디자인 문서"));
    const body = element("div");
    for (const block of design.documentation.split(/\n\s*\n/)) {
      const heading = /^(#{1,6}) (.+)$/.exec(block);
      if (heading) body.append(element(`h${Math.min(heading[1].length + 1, 6)}`, heading[2]));
      else if (block.split("\n").every((line) => /^[-*] /.test(line))) {
        const list = element("ul");
        for (const line of block.split("\n")) list.append(element("li", line.slice(2)));
        body.append(list);
      } else body.append(element("p", block));
    }
    section.append(body);
    context.append(section);
  }
  const sources = element("details");
  sources.append(element("summary", `구현 원본 · ${(design.sourceFiles ?? []).length}개 파일`));
  for (const file of design.sourceFiles ?? []) sources.append(element("p", file.path, "source"));
  context.append(sources);
  document.querySelector("#command").textContent =
    design.kind === "work"
      ? `./design inspect --reference ${design.id} --json`
      : `./design context --id ${design.id} --json`;
  document.querySelector("#download").href = contextDownload(design.id, design.kind);
  document.querySelector("#download").download = `${design.id}.json`;
}

import { FILES } from "../domain/artifacts.js";
import { escape } from "./html.js";

export function renderComponents(
  report,
  { keys, actionableGroups, comparisonWidth, comparisonHeight },
) {
  const { findings } = report;
  const rows = findings
    .map(
      (
        f,
      ) => `<tr data-part="${escape(f.part)}" data-allowed="${f.allowed}" ${f.allowed ? "hidden" : ""}>
<th scope="row">${escape(f.part)}</th>
<td>${escape(f.kind)}<br>
<code>${escape(f.property)}</code>
</td>
<td>
<code>${escape(f.actual)}</code>
</td>
<td>
<code>${escape(f.expected)}</code>
</td>
<td>${f.allowed ? "허용" : "확인"}</td>
</tr>`,
    )
    .join("");
  const tasks = actionableGroups
    .map((group) => {
      const key = group.part;
      const related = group.fixes.filter((f) => !f.allowed);
      const candidate = report.candidate.snapshot.parts[key];
      const source = candidate?.source ?? report.reference.snapshot.parts[key]?.source;
      return `<button class="task" data-select-part="${escape(key)}" aria-pressed="false">
<strong>${escape(key === "$root" ? "전체 박스" : key)}</strong>
<span>${group.violations}개 차이 · ${taskLabel(related)}</span>
<code>${escape(source ?? candidate?.selector ?? "매핑 확인")}</code>
</button>`;
    })
    .join("");
  const overlays = (side) =>
    `<svg class="region" viewBox="0 0 ${comparisonWidth} ${comparisonHeight}" aria-hidden="true">${keys
      .map((key) => {
        const bounds = report[side].snapshot.parts[key]?.bounds;
        return bounds
          ? `<rect data-region="${escape(key)}" x="${escape(bounds.x)}" y="${escape(bounds.y)}" width="${escape(bounds.width)}" height="${escape(bounds.height)}" fill="none" stroke="#176ac4" stroke-width="2" vector-effect="non-scaling-stroke" visibility="hidden"/>`
          : "";
      })
      .join("")}</svg>`;
  const parts = Object.entries(report.reference.snapshot.parts)
    .map(
      ([key, reference]) => `
<details>
<summary>${escape(key)} · 매핑·클래스·소스</summary>
<div class="mapping">
${renderMetadata("기준", reference)}
${renderMetadata("신규", report.candidate.snapshot.parts[key])}
</div>
</details>`,
    )
    .join("");
  return { rows, tasks, overlays, parts };
}

function taskLabel(fixes) {
  if (fixes.some((fix) => fix.kind === "mapping")) return "요소 매핑 확인";
  if (fixes.some((fix) => fix.kind === "style" || fix.kind === "pseudo")) return "스타일 확인";
  return "부모 레이아웃 확인";
}

function renderMetadata(label, part) {
  return `<div>
<h3>${label}</h3>
<p>선택자 <code>${escape(part?.selector)}</code></p>
<p>클래스 <code>${escape(part?.classes.join(" "))}</code></p>
<p>소스 <code>${escape(part?.source ?? "미지정")}</code></p>
</div>`;
}

export function renderScreens(report, overlays) {
  const { visual, referenceId } = report;
  const screens = [
    {
      label: "기준",
      path: FILES.reference,
      aligned: FILES.referenceAligned,
      size: visual.referenceSize,
      side: "reference",
    },
    {
      label: "신규",
      path: FILES.candidate,
      aligned: FILES.candidateAligned,
      size: visual.candidateSize,
      side: "candidate",
    },
    { label: "차이 표시", path: FILES.diff, aligned: FILES.diff, side: "candidate" },
  ];
  return screens
    .map(
      ({ label, path, aligned, size, side }) => `<figure class="screen">
<figcaption>${label}${size ? ` · ${size.width}×${size.height}` : " · 빨간색"}</figcaption>
<div class="image-wrap">
<a href="${path}" target="_blank" rel="noopener" aria-label="${label} 이미지 원본 열기">
<div class="image-stage">
<img src="${aligned}" alt="${escape(referenceId)} ${label} 캡처">${overlays(side)}
</div>
</a>
</div>
</figure>`,
    )
    .join("");
}

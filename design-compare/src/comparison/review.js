import { partKeys, partMetadata, getPart } from "../domain/snapshots.js";

const actions = {
  geometry: "기준 상대 좌표·크기를 참고해 부모 레이아웃·간격 확인",
  mapping: "동일한 부분 이름으로 요소 매핑 확인",
  style: "해당 요소의 기준 스타일 확인·적용",
  pseudo: "해당 요소의 기준 스타일 확인·적용",
};

export function repairPlan(report) {
  return partKeys(report.reference.snapshot.parts, report.candidate.snapshot.parts).map((part) => {
    const baseline = getPart(report.reference.snapshot.parts, part);
    const candidate = getPart(report.candidate.snapshot.parts, part);
    const findings = report.findings.filter((finding) => finding.part === part);
    return {
      part,
      violations: findings.filter((finding) => !finding.allowed).length,
      allowedDifferences: findings.filter((finding) => finding.allowed).length,
      reference: partMetadata(baseline),
      candidate: partMetadata(candidate),
      fixes: findings.map((finding) => ({
        kind: finding.kind,
        property: finding.property,
        current: finding.actual,
        target: finding.expected,
        allowed: finding.allowed,
        action: actions[finding.kind],
      })),
    };
  });
}

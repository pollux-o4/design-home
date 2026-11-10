import { comparisonPolicy } from "./policy.js";
import { compareParts } from "./rules.js";
import { comparePixels } from "./pixels.js";

export function compare(reference, candidate, options) {
  const policy = comparisonPolicy(options);
  const findings = compareParts(reference.snapshot.parts, candidate.snapshot.parts, policy.ignore);
  const { visual, images } = comparePixels(reference.png, candidate.png, policy.pixelBudget);
  const violations = findings.filter((finding) => !finding.allowed).length;
  return {
    status: violations === 0 && visual.withinBudget ? "pass" : "fail",
    findings,
    visual,
    images,
    summary: { violations, allowedDifferences: findings.length - violations },
  };
}

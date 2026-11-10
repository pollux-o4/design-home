import { repairPlan } from "../comparison/review.js";

// Both AI repair data and human task cards use the same domain grouping.
export function projectReport(report) {
  const groups = repairPlan(report);
  const actionableGroups = groups.filter((group) => group.violations);
  return {
    groups,
    keys: groups.map((group) => group.part),
    actionableGroups,
    actionable: actionableGroups.map((group) => group.part),
    comparisonHeight: Math.max(
      report.visual.referenceSize.height,
      report.visual.candidateSize.height,
    ),
    comparisonWidth: Math.max(report.visual.referenceSize.width, report.visual.candidateSize.width),
  };
}

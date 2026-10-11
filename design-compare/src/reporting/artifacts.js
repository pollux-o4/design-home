import { FILES } from '../domain/artifacts.js';
import { renderReport } from './index.js';
import { repairPlan } from '../comparison/review.js';

// Artifact schema belongs to reporting; storage only persists the resulting files.
export function createReportArtifacts(report, images) {
  const repair = {
    schemaVersion: 1,
    referenceId: report.referenceId,
    comparisonStatus: report.status,
    conditions: report.conditions,
    policy: report.policy,
    visual: report.visual,
    review: report.review,
    parts: repairPlan(report),
  };
  return {
    ...images,
    [FILES.report]: JSON.stringify(report, null, 2),
    [FILES.repair]: JSON.stringify(repair, null, 2),
    [FILES.html]: renderReport(report),
  };
}

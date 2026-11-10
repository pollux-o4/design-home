import { join } from "node:path";
import { compare } from "../comparison/index.js";
import { comparisonPolicy } from "../comparison/policy.js";
import { repairPlan } from "../comparison/review.js";
import { FILES } from "../domain/artifacts.js";
import { createReportArtifacts } from "../reporting/artifacts.js";

function comparisonReport(reference, candidate, result, policy, now) {
  const { images, ...checks } = result;
  const conditions = reference.capture;
  const report = {
    schemaVersion: 1,
    referenceMode: reference.mode ?? "snapshot",
    referenceId: reference.id,
    createdAt: now(),
    ...checks,
    conditions: {
      viewport: conditions.viewport,
      theme: conditions.theme,
      state: conditions.state,
      deviceScaleFactor: 1,
      browserVersion: conditions.browserVersion,
    },
    policy,
    reference: { url: conditions.url, selector: conditions.selector, snapshot: reference.snapshot },
    candidate: {
      url: candidate.capture.url,
      selector: candidate.capture.selector,
      snapshot: candidate.snapshot,
    },
    review: {
      required: true,
      note: "pass는 설정한 CSS·기하·픽셀 검사를 통과했다는 뜻. 시각적 적합성·접근성·실제 사용성은 별도 리뷰 필요.",
    },
    artifacts: { reference: FILES.reference, candidate: FILES.candidate, diff: FILES.diff },
  };
  return report;
}

export async function comparePage(request, { repository, capture, read, now }) {
  const policy = comparisonPolicy(request);
  const stored = await repository.load(request.id);
  const live = stored.mode === "live" ? await capture(stored.capture) : null;
  const reference = live ? { ...stored, snapshot: live.snapshot, capture: live.capture } : stored;
  const png = live ? live.png : await read(reference.imagePath);
  const target = request.candidateId
    ? (await repository.load(request.candidateId)).capture
    : reference.capture;
  const candidate = await capture({
    ...reference.capture,
    openSelector: request.openSelector ?? (request.candidateId ? target.openSelector : undefined),
    url: request.url ?? target.url,
    selector: request.selector ?? target.selector,
    parts: request.parts ?? target.parts,
  });
  if (reference.capture.browserVersion !== candidate.capture.browserVersion)
    throw new Error("기준 자료와 Chromium 버전 불일치. 현재 브라우저로 새 기준 ID 등록 필요.");
  const result = compare({ ...reference, png }, candidate, policy);
  const report = comparisonReport(reference, candidate, result, policy, now);
  if (request.candidateId) report.candidateReferenceId = request.candidateId;
  const directory = await repository.publish(
    report.referenceId,
    createReportArtifacts(report, result.images),
  );
  return {
    ...report,
    repair: repairPlan(report),
    directory,
    reportPath: join(directory, FILES.html),
    jsonPath: join(directory, FILES.report),
    repairPath: join(directory, FILES.repair),
  };
}

import { dirname, join, resolve } from "node:path";
import { assertReport } from "../domain/records.js";
import { partMetadata, requirePart } from "../domain/snapshots.js";
import { FILES } from "../domain/artifacts.js";
import { repairPlan } from "../comparison/review.js";

export async function inspectReport({ reportPath, part }, read) {
  const report = assertReport(JSON.parse(await read(reportPath, "utf8")));
  const groups = repairPlan(report);
  requirePart(
    part,
    groups.map((group) => group.part),
  );
  const directory = dirname(resolve(reportPath));
  return {
    schemaVersion: 1,
    status: "inspected",
    referenceId: report.referenceId,
    comparisonStatus: report.status,
    summary: report.summary,
    visual: report.visual,
    conditions: report.conditions,
    policy: report.policy,
    review: report.review,
    evidence: {
      reportPath: resolve(reportPath),
      images: Object.fromEntries(
        ["reference", "candidate", "diff"].map((key) => [key, join(directory, FILES[key])]),
      ),
    },
    parts: part
      ? groups.filter((group) => group.part === part)
      : groups.map(({ fixes, ...group }) => group),
  };
}

export async function inspectReference({ id, part }, repository) {
  const reference = await repository.load(id);
  if (reference.mode === "live") {
    requirePart(part, ["$root", ...Object.keys(reference.capture.parts)]);
    return {
      schemaVersion: 1,
      status: "inspected",
      referenceId: id,
      mode: "live",
      title: reference.title,
      category: reference.category,
      description: reference.description,
      sources: reference.sources,
      conditions: reference.capture,
      parts: part
        ? { [part]: part === "$root" ? reference.capture.selector : reference.capture.parts[part] }
        : reference.capture.parts,
    };
  }
  requirePart(part, Object.keys(reference.snapshot.parts));
  return {
    schemaVersion: 1,
    status: "inspected",
    referenceId: id,
    conditions: reference.capture,
    parts: part
      ? { [part]: reference.snapshot.parts[part] }
      : Object.fromEntries(
          Object.entries(reference.snapshot.parts).map(([key, value]) => [
            key,
            partMetadata(value),
          ]),
        ),
  };
}

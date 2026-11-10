import { createHash } from "node:crypto";
import { createLibrary } from "../library/index.js";

export async function prepareBrief(
  { intent, baseUrl, limit, operation },
  { repository, capture, documentsRoot },
) {
  const registered = (await repository.list()).filter(
    (item) => item.mode === "live" && item.status === "ready" && !item.transient,
  );
  const references = await Promise.all(
    registered.map(async (item) => {
      const record = await repository.load(item.id);
      return {
        ...record,
        origin: "registered",
        summary: record.description,
        keywords: record.keywords ?? [record.category],
        constraints: [],
        documentation: "",
      };
    }),
  );
  const selection = createLibrary({ documentsRoot }).select(intent, { references, limit }),
    items = [],
    failures = [];
  for (const item of selection.results) {
    try {
      if (item.origin === "library") {
        if (!baseUrl) throw new Error("프로젝트 baseUrl 또는 --base-url을 지정하세요");
        item.capture = {
          url: new URL(item.previewPath, baseUrl).href,
          selector: item.capture?.selector ?? "body",
          parts: item.capture?.parts ?? {},
          viewport: item.viewport,
          theme: item.capture?.theme ?? "light",
          state: item.capture?.state ?? "default",
          openSelector: item.capture?.openSelector,
        };
      }
      const captured = await capture(item.capture);
      const referenceId = `brief-${operation.id.slice(-8)}-${createHash("sha256").update(item.id).digest("hex").slice(0, 12)}`;
      await repository.link({
        schemaVersion: 1,
        mode: "live",
        id: referenceId,
        transient: true,
        title: item.title,
        description: item.summary,
        category: item.category ?? item.kind ?? "page",
        sources: item.sources ?? [item.sourcePath],
        capture: item.capture,
      });
      const imagePath = await operation.image(`${items.length + 1}.png`, captured.png, item.title);
      items.push({
        id: item.id,
        referenceId,
        title: item.title,
        origin: item.origin,
        reasons: item.reasons,
        imagePath,
        guidance: {
          category: item.category ?? item.kind ?? "page",
          summary: item.summary,
          constraints: item.constraints ?? [],
          documentation: item.documentation ?? "",
          sources: item.sources ?? [item.sourcePath],
        },
        conditions: item.capture,
      });
    } catch (error) {
      failures.push({ id: item.id, title: item.title, message: error.message });
    }
  }
  return {
    schemaVersion: 1,
    status: !selection.results.length
      ? "no-match"
      : !items.length
        ? "error"
        : failures.length
          ? "partial"
          : "prepared",
    intent,
    selection: { method: "document-usage-and-tags", matchedCount: selection.matchedCount },
    items,
    failures,
    ...(!selection.results.length
      ? {
          capabilities: selection.capabilities,
          notice: "일치하는 용도 자료 없음. 가능한 용도나 분위기를 더 구체적으로 입력하세요.",
        }
      : {}),
    registrationTemplate: items.length
      ? {
          id: "new-component",
          title: "새 작업물 이름",
          description: intent,
          category: items[0].guidance.category ?? "component",
          tags: [...new Set(selection.results.flatMap((item) => item.tags ?? []))],
          keywords: [],
          sources: ["실제 소스 파일 경로"],
          capture: {
            url: "<개발 화면 URL>",
            selector: "<개발 요소 선택자>",
            parts: {},
            viewport: items[0].conditions.viewport,
            theme: items[0].conditions.theme,
            state: "default",
          },
        }
      : null,
    nextActions: [
      ...(items.length
        ? [
            {
              purpose: "완성한 작업물 등록",
              argv: [
                "./design",
                "link",
                "--manifest",
                "<작성한 등록 JSON의 절대 경로>",
                "--task",
                operation.taskId,
                "--store",
                operation.store,
                "--json",
              ],
            },
          ]
        : []),
      ...items.map((item) => ({
        purpose: `${item.title} 기준으로 작업 후 비교`,
        argv: [
          "./design",
          "compare",
          "--reference",
          item.referenceId,
          "--candidate",
          "<등록한 작업물 ID>",
          "--task",
          operation.taskId,
          "--store",
          operation.store,
          "--json",
        ],
      })),
    ],
  };
}

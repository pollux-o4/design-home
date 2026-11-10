export function failure(error, { stage, store }) {
  const codes = {
    DESIGN_NOT_FOUND: "DESIGN_NOT_FOUND",
    PART_NOT_FOUND: "PART_NOT_FOUND",
    INVALID_RECORD: "INVALID_RECORD",
    EEXIST: "REFERENCE_EXISTS",
  };
  const code =
    codes[error.code] ??
    (error.code === "ENOENT"
      ? stage === "report"
        ? "REPORT_NOT_FOUND"
        : "REFERENCE_NOT_FOUND"
      : stage === "arguments"
        ? "INVALID_ARGUMENT"
        : "EXECUTION_FAILED");
  const messages = {
    REFERENCE_EXISTS: "이미 등록된 기준 ID. 새 ID로 등록하여 기존 기준 보존.",
    REFERENCE_NOT_FOUND: "기준 자료 없음. ID와 --store 확인 후 register 실행.",
    REPORT_NOT_FOUND: "보고서 없음. --report에 report.json 경로 지정.",
  };
  const recovery = ["REFERENCE_NOT_FOUND", "REFERENCE_EXISTS"].includes(code)
    ? {
        hint: "등록된 ID 확인 후 재실행",
        argv: ["./design", "list", ...(store ? ["--store", store] : []), "--json"],
      }
    : {
        hint: stage === "arguments" ? "명령별 옵션 확인" : "페이지 실행 상태·선택자·자료 경로 확인",
        argv: ["./design", "--help"],
      };
  return {
    schemaVersion: 1,
    status: "error",
    code,
    message: messages[code] ?? error.message,
    recovery,
    ...(error.availableParts ? { availableParts: error.availableParts } : {}),
  };
}

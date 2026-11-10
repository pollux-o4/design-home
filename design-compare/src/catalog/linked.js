import { validateCapture } from "../capture/contract.js";
import { validateId } from "../domain/identifiers.js";
export function assertLinked(record, id) {
  if (record?.schemaVersion !== 1 || record.mode !== "live" || record.id !== validateId(id))
    throw new Error("유효한 원본 연결 자료 필요");
  validateCapture(record.capture);
  for (const key of ["title", "category", "description"])
    if (typeof record[key] !== "string") throw new Error(`${key}: 문자열 필요`);
  if (
    !Array.isArray(record.sources) ||
    !record.sources.every((source) => typeof source === "string")
  )
    throw new Error("sources: 파일 경로 목록 필요");
  for (const key of ["tags", "keywords"])
    if (
      record[key] !== undefined &&
      (!Array.isArray(record[key]) ||
        record[key].some((value) => typeof value !== "string" || !value.trim()))
    )
      throw new Error(`${key}: 비어 있지 않은 문자열 목록 필요`);
  return record;
}

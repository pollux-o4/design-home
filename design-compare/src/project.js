import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve, parse } from "node:path";

export function loadProject({ cwd = process.cwd(), config = process.env.DESIGN_CONFIG } = {}) {
  let file = config ? resolve(cwd, config) : null;
  if (!file) {
    let directory = resolve(cwd);
    while (true) {
      const candidate = resolve(directory, "design-system.config.json");
      if (existsSync(candidate)) {
        file = candidate;
        break;
      }
      if (directory === parse(directory).root) break;
      directory = dirname(directory);
    }
  }
  const data = file ? JSON.parse(readFileSync(file, "utf8")) : {};
  if (file && (data.schemaVersion !== 1 || typeof data.name !== "string" || !data.name.trim()))
    throw new Error("프로젝트 설정: schemaVersion 1과 name 필요");
  for (const key of ["sourceRoot", "documentsRoot", "store", "baseUrl"]) {
    if (data[key] !== undefined && (typeof data[key] !== "string" || !data[key].trim()))
      throw new Error(`프로젝트 설정: ${key} 문자열 필요`);
  }
  const root = file ? dirname(file) : resolve(cwd);
  const sourceRoot = resolve(root, process.env.DESIGN_HOME_ROOT ?? data.sourceRoot ?? ".");
  const documents = process.env.DESIGN_DOCUMENTS_ROOT ?? data.documentsRoot;
  const baseUrl = process.env.DESIGN_BASE_URL ?? data.baseUrl ?? null;
  if (baseUrl) {
    const url = new URL(baseUrl);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password)
      throw new Error("프로젝트 설정: 인증정보 없는 HTTP(S) baseUrl 필요");
  }
  return {
    name: data.name ?? "내 프로젝트",
    sourceRoot,
    documentsRoot: documents ? resolve(root, documents) : null,
    store: resolve(root, process.env.DESIGN_STORE ?? data.store ?? ".design-compare"),
    baseUrl,
    configured: !!file,
  };
}

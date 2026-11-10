export function parseScenarioUrl(value) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("schemaVersion 1과 인증정보 없는 HTTP(S) URL 필요");
  }
  return url;
}

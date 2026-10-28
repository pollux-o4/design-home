import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { chromium } from "playwright";

const sourceRuntime = new URL("../../../shared/js/design-system-audit-runtime.js", import.meta.url);
const packagedRuntime = new URL("../../dist/runtime/shared/js/design-system-audit-runtime.js", import.meta.url);
const runtime = existsSync(sourceRuntime) ? sourceRuntime : packagedRuntime;

function validUrl(value) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("인증정보 없는 HTTP(S) URL 필요");
  }
  return url.href;
}

export async function auditUi({ url, selector = "body", allow = [], strict = false, theme = "light" }) {
  const target = validUrl(url);
  if (!["light", "dark"].includes(theme)) throw new Error("--theme: light 또는 dark 필요");
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      colorScheme: theme,
      locale: "ko-KR",
      timezoneId: "Asia/Seoul",
    });
    await context.addInitScript({ content: await readFile(runtime, "utf8") });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const response = await page.goto(target, { waitUntil: "domcontentloaded", timeout: 20000 });
    if (!response?.ok()) throw new Error(`페이지 로드 실패: HTTP ${response?.status() ?? "unknown"}`);
    await page.evaluate(() => document.fonts.ready);
    const root = page.locator(selector);
    if (await root.count() !== 1) throw new Error(`검사 선택자는 정확히 1개 필요: ${selector}`);
    await root.waitFor({ state: "visible" });
    const result = await page.evaluate(({ selector, allow, strict }) => {
      const roots = document.querySelectorAll(selector);
      const findings = globalThis.DesignSystemAudit.inspectControlBaseline(roots[0], { allow, strict });
      return { findings, summary: globalThis.DesignSystemAudit.summarizeControlAudit(findings) };
    }, { selector, allow, strict });
    return {
      schemaVersion: 1,
      status: strict && result.summary.blocking ? "fail" : result.summary.total ? "review" : "pass",
      target: { url: target, selector, theme },
      ...result,
    };
  } finally {
    await browser.close();
  }
}

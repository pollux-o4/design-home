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

export async function auditUi({ url, selector = "body", allow = [], strict = false, theme = "light", viewport = { width: 1280, height: 900 }, openSelector }) {
  const target = validUrl(url);
  if (!["light", "dark"].includes(theme)) throw new Error("--theme: light 또는 dark 필요");
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport,
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
    if (openSelector) {
      const opener = page.locator(openSelector);
      if (await opener.count() !== 1) throw new Error('열기 선택자는 정확히 1개 필요');
      await opener.click();
    }
    const root = page.locator(selector);
    if (await root.count() !== 1) throw new Error(`검사 선택자는 정확히 1개 필요: ${selector}`);
    await root.waitFor({ state: "visible" });
    const findings = [], coverage = [];
    async function scan(frame, scanRoot, framePath) {
      const entries = await scanRoot.evaluate((element, policy) => globalThis.DesignSystemAudit.inspectControlBaseline(element, policy), { allow, strict });
      findings.push(...entries.map(entry => framePath.length ? { ...entry, framePath } : entry));
      const rootHandle = await scanRoot.elementHandle();
      try {
        for (const child of frame.childFrames()) {
          let path = [...framePath, 'iframe (위치 확인 실패)'];
          try {
            const element = await child.frameElement();
            if (!await element.isVisible()) continue;
            const allowed = await element.evaluate((node, selectors) => {
              for (let current = node; current; current = current.getRootNode().host) {
                if (current.closest('[data-ds-native="allow"]') || selectors.some(selector => current.closest(selector))) return true;
              }
              return false;
            }, allow);
            if (allowed) continue;
            const inside = await element.evaluate((node, root) => {
              for (let current = node; current; current = current.getRootNode().host) if (root.contains(current)) return true;
              return false;
            }, rootHandle);
            if (!inside) continue;
            const frameTarget = await element.evaluate(node => {
              if (node.id) return `#${CSS.escape(node.id)}`;
              const siblings = [...node.parentElement.children].filter(item => item.tagName === node.tagName);
              return `${node.tagName.toLowerCase()}:nth-of-type(${siblings.indexOf(node) + 1})`;
            });
            path = [...framePath, frameTarget];
            await child.waitForLoadState('domcontentloaded', { timeout: 10000 });
            const childRoot = child.locator('body');
            await childRoot.waitFor({ state: 'attached', timeout: 10000 });
            await scan(child, childRoot, path);
          } catch (error) {
            coverage.push({ framePath: path, reason: error.message.split('\n')[0] });
          }
        }
      } finally { await rootHandle?.dispose(); }
    }
    await scan(page.mainFrame(), root, []);
    const summary = await page.evaluate(entries => globalThis.DesignSystemAudit.summarizeControlAudit(entries), findings);
    return {
      schemaVersion: 1,
      status: coverage.length ? "error" : strict && summary.blocking ? "fail" : summary.total ? "review" : "pass",
      target: { url: target, selector, theme, viewport, ...(openSelector ? { openSelector } : {}) },
      findings, summary, coverage,
    };
  } finally {
    await browser.close();
  }
}

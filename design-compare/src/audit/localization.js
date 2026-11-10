import { readFile } from "node:fs/promises";
import { chromium } from "playwright";
import { parseScenarioUrl } from "./scenario-contract.js";

export async function auditLocalization({ scenario, strict = false }) {
  const config = JSON.parse(await readFile(scenario, "utf8"));
  const url = parseScenarioUrl(config.url);
  if (config.schemaVersion !== 1)
    throw new Error("schemaVersion 1과 인증정보 없는 HTTP(S) URL 필요");
  if (
    typeof config.scope !== "string" ||
    !config.scope.trim() ||
    !Array.isArray(config.languages) ||
    !config.languages.length ||
    config.languages.length > 10
  )
    throw new Error("scope와 languages 배열(1~10개) 필요");
  if (
    config.openEach !== undefined &&
    (typeof config.openEach !== "string" || !config.openEach.trim())
  )
    throw new Error("openEach 선택자 필요");
  if (
    config.afterEach !== undefined &&
    (typeof config.afterEach !== "string" || !config.afterEach.trim())
  )
    throw new Error("afterEach 선택자 필요");
  for (const language of config.languages) {
    if (
      !language ||
      ["code", "control", "rejectPattern"].some(
        (key) => typeof language[key] !== "string" || !language[key].trim(),
      )
    )
      throw new Error("각 언어에 code, control, rejectPattern 필요");
    new RegExp(language.rejectPattern, "u");
  }
  const findings = [],
    coverage = [];
  const browser = await chromium.launch({ headless: true });
  try {
    for (const language of config.languages) {
      const context = await browser.newContext({ reducedMotion: "reduce" });
      try {
        const page = await context.newPage();
        page.setDefaultTimeout(10000);
        const response = await page.goto(url.href, { waitUntil: "domcontentloaded" });
        if (!response?.ok()) throw new Error(`페이지 로드 실패: HTTP ${response?.status()}`);
        const control = page.locator(language.control);
        if ((await control.count()) !== 1) throw new Error("언어 버튼은 정확히 1개 필요");
        await control.click();
        const scan = async (state) => {
          const root = page.locator(config.scope);
          if ((await root.count()) !== 1) throw new Error("scope는 정확히 1개 필요");
          const residual = await root.evaluate((element, pattern) => {
            const reject = new RegExp(pattern, "u");
            const values = element.innerText
              .split("\n")
              .map((text) => text.trim())
              .filter((text) => reject.test(text));
            for (const node of [
              element,
              ...element.querySelectorAll("[aria-label],[placeholder],[title],[alt]"),
            ]) {
              if (!node.checkVisibility()) continue;
              for (const attribute of ["aria-label", "placeholder", "title", "alt"]) {
                const value = node.getAttribute(attribute);
                if (value && reject.test(value)) values.push(`${attribute}: ${value}`);
              }
            }
            return [...new Set(values)];
          }, language.rejectPattern);
          const actualLanguage = await page.locator("html").getAttribute("lang");
          if (actualLanguage !== language.code)
            findings.push({
              language: language.code,
              state,
              kind: "document-language",
              actual: actualLanguage,
            });
          for (const text of residual)
            findings.push({ language: language.code, state, kind: "untranslated-text", text });
          coverage.push({ language: language.code, state });
        };
        await scan("selected");
        if (config.openEach) {
          const openers = page.locator(config.openEach);
          const count = await openers.count();
          if (!count || count > 200) throw new Error("openEach 대상은 1~200개 필요");
          for (let i = 0; i < count; i++) {
            const opener = openers.nth(i);
            const label = (await opener.getAttribute("aria-label")) || `#${i + 1}`;
            await opener.click();
            await scan(label);
            if (config.afterEach) {
              const action = page
                .locator(config.scope)
                .locator(config.afterEach)
                .filter({ visible: true });
              const count = await action.count();
              if (count > 1) throw new Error("afterEach는 최대 1개 필요");
              if (count === 1 && (await action.isEnabled())) {
                await action.click();
                await scan(`${label} · action`);
              }
            }
          }
        }
        await page.reload({ waitUntil: "domcontentloaded" });
        await scan("reloaded");
      } finally {
        await context.close();
      }
    }
    return {
      schemaVersion: 1,
      status: findings.length ? (strict ? "fail" : "review") : "pass",
      target: { url: url.href, scope: config.scope },
      findings,
      coverage,
      summary: { checked: coverage.length, findings: findings.length },
    };
  } finally {
    await browser.close();
  }
}

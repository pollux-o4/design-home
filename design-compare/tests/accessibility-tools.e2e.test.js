import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";
import { createHubServer } from "../hub/server.js";

test("Design System Library exposes contrast and native-UI consistency checks without accessibility violations", async () => {
  const server = createHubServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("https://**/*", (route) => route.abort());
  try {
    await page.goto(`${base}/design-library/#/features`);
    assert.deepEqual(
      await page.locator("#feature-index .feature-row").evaluateAll((rows) => rows.map((row) => row.getAttribute("href"))),
      ["#/trends", "#/components", "#/accessibility", "#/work", "#/activity"],
    );
    await page.getByRole("link", { name: /품질 점검/ }).click();
    assert.deepEqual(
      await page.locator("#accessibility-index .feature-row").evaluateAll((rows) => rows.map((row) => row.getAttribute("href"))),
      ["#/accessibility/contrast", "#/accessibility/controls"],
    );
    await page.goto(`${base}/design-library/#/accessibility/contrast`);
    await page.locator("#screen-title").filter({ hasText: "색 대비 검사" }).waitFor();
    await page.locator("#contrast-foreground").fill("#777777");
    await page.locator("#contrast-checker").evaluate((form) => form.requestSubmit());
    assert.match(await page.locator("#contrast-result").textContent(), /4\.48:1 · AA 미달/);
    await page.locator("#contrast-foreground").fill("#000000");
    await page.locator("#contrast-checker").evaluate((form) => form.requestSubmit());
    assert.match(await page.locator("#contrast-result").textContent(), /21\.00:1 · AA 통과 · AAA 통과/);
    await page.goto(`${base}/design-library/#/accessibility/controls`);
    await page.getByRole("button", { name: "이 예시 점검", exact: true }).click();
    const results = await page.locator("#control-audit-results").textContent();
    assert.match(results, /사각형 컨트롤.*기본 select.*기본 날짜 선택.*기본 파일 선택.*기본 스크롤바/s);
    assert.doesNotMatch(results, /의도적으로 허용한 기본 select/);
    const auditCases = await page.evaluate(async () => {
      const { inspectControlBaseline } = await import('/shared/js/design-system-audit.js');
      const host = document.createElement('div');
      host.innerHTML = '<input type="file" aria-label="숨긴 파일" style="opacity:0"><select id="field:one" aria-label="보이는 선택"><option>선택</option></select><div data-scroll-region aria-label="스크롤 영역" style="height:30px;overflow:auto"><div style="height:200px"></div></div>';
      document.body.append(host);
      const findings = inspectControlBaseline(host, { strict: true });
      host.remove();
      return findings;
    });
    assert.equal(auditCases.some(({ name }) => name === '숨긴 파일'), false);
    assert.ok(auditCases.some(({ kind, target }) => kind === 'native-select' && target === '#field\\:one'));
    assert.ok(auditCases.some(({ kind, name }) => kind === 'native-scrollbar' && name === '스크롤 영역'));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

    await page.addScriptTag({ content: await readFile(new URL("../node_modules/axe-core/axe.min.js", import.meta.url), "utf8") });
    const violations = await page.evaluate(async () => (await axe.run("#accessibility-section")).violations.map(({ id }) => id));
    assert.deepEqual(violations, []);
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";
import { createStaticServer } from "./support/static-server.mjs";

test("home learning cards use dark surfaces when the system is dark", async () => {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch();
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    const surfaces = await page.evaluate(() => {
      const color = (selector) =>
        getComputedStyle(document.querySelector(selector)).backgroundColor;
      return {
        card: color(".hub-card"),
        art: color(".learning-art--patterns"),
      };
    });
    assert.deepEqual(surfaces, {
      card: "rgb(32, 32, 36)",
      art: "rgb(48, 48, 53)",
    });
  } finally {
    await context.close();
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});

test("core dark-mode entry screens have no color contrast violations", async () => {
  const axe = await readFile(new URL(import.meta.resolve("axe-core/axe.min.js")), "utf8");
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch();
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();
  try {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    await page.addScriptTag({ content: axe });
    await page.locator("#dh-theme-toggle").click();
    assert.deepEqual(
      await page.evaluate(
        async () =>
          (
            await axe.run(document, {
              runOnly: { type: "rule", values: ["color-contrast", "label-content-name-mismatch"] },
            })
          ).violations,
      ),
      [],
      "light home contrast and visible labels",
    );
    await page.emulateMedia({ colorScheme: "dark" });
    for (const path of [
      "index.html",
      "design-library/#/features",
      "glossary/index.html",
      "libraries/index.html",
      "ui-components/index.html",
    ]) {
      await page.goto(`http://127.0.0.1:${server.address().port}/${path}`);
      if (path === "index.html") await page.locator("#dh-theme-toggle").click();
      if (path === "glossary/index.html") {
        await page.locator("#category-ui").click();
        await page.locator(".term-row").first().hover();
      }
      await page.addScriptTag({ content: axe });
      const violations = await page.evaluate(
        async () =>
          (await axe.run(document, { runOnly: { type: "rule", values: ["color-contrast"] } }))
            .violations,
      );
      assert.deepEqual(violations, [], path);
    }
  } finally {
    await context.close();
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});

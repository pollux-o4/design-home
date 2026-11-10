import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "../design-compare/node_modules/playwright/index.mjs";
import { createStaticServer } from "./support/static-server.mjs";
test("every opened topic presents Basic then Advanced without switching or hiding cards", async () => {
  const server = createStaticServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    await page.goto(
      `http://127.0.0.1:${server.address().port}/ui-components/index.html#/motion/adaptive?level=advanced`,
    );
    const sections = page.locator(".pattern-level-section");
    assert.deepEqual(
      await sections.evaluateAll((nodes) => nodes.map((node) => node.dataset.level)),
      ["basic", "advanced"],
    );
    assert.ok(await page.locator("[data-morph-action]").isVisible());
    assert.ok(await page.locator("[data-island]").isVisible());
    const bounds = await sections.evaluateAll((nodes) =>
      nodes.map((node) => node.getBoundingClientRect()),
    );
    assert.ok(bounds[1].top > bounds[0].bottom);
    await page.locator("[data-island]").scrollIntoViewIfNeeded();
    await page.screenshot({ path: "/tmp/pattern-sequential-desktop.png" });
    await page.setViewportSize({ width: 390, height: 900 });
    await page.locator("[data-island]").scrollIntoViewIfNeeded();
    await page.screenshot({ path: "/tmp/pattern-sequential-mobile.png" });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.locator("#summary-content-motion-expressive").click();
    assert.equal(
      await page.locator("#panel-content-motion-expressive .component-card:visible").count(),
      6,
    );
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }
});

import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "../design-compare/node_modules/playwright/index.mjs";
import { createStaticServer } from "./support/static-server.mjs";
test("collapsed categories create no samples and opening a topic creates both difficulty sections once", async () => {
  const server = createStaticServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.route(/https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    await page.goto(
      `http://127.0.0.1:${server.address().port}/ui-components/index.html`,
    );
    await page.locator("[data-target=motion] .category-button").click();
    assert.equal(await page.locator(".sample").count(), 0);
    await page.locator("#summary-content-motion-expressive").click();
    assert.equal(await page.locator(".sample").count(), 6);
    await page
      .locator("[data-sample-id=motion-counter] [data-motion-play]")
      .click();
    await page.waitForFunction(
      () => document.querySelector("[data-metric]").textContent === "12,000",
    );
    assert.equal(await page.locator(".sample").count(), 6);
    assert.equal(await page.locator("[data-metric]").textContent(), "12,000");
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }
});

test("fixed-size text animation does not trigger document-wide scrollbar geometry scans", async () => {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route(/https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
    await page.addInitScript(() => {
      const rect = Element.prototype.getBoundingClientRect;
      window.scrollGeometryReads = 0;
      Element.prototype.getBoundingClientRect = function (...args) {
        if (this.classList.contains("dh-scroll-native")) scrollGeometryReads++;
        return rect.apply(this, args);
      };
    });
    await page.goto(
      `http://127.0.0.1:${server.address().port}/ui-components/index.html#/motion/expressive`,
    );
    await page.locator("[data-metric]").waitFor({ state: "visible" });
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    const reads = await page.evaluate(async () => {
      scrollGeometryReads = 0;
      for (let frame = 0; frame < 25; frame++) {
        document.querySelector("[data-metric]").textContent = String(
          8420 + frame,
        );
        await new Promise(requestAnimationFrame);
      }
      return scrollGeometryReads;
    });
    assert.ok(reads <= 8, `text-only animation caused ${reads} layout reads`);
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});

test("unchanged normalized search preserves sample state instead of remounting it", async () => {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.route(/https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    await page.goto(
      `http://127.0.0.1:${server.address().port}/ui-components/index.html`,
    );
    await page.locator("#search-input").fill("Checkbox");
    const checkbox = page.locator("[data-sample-id=checkbox] input").first();
    await checkbox.uncheck();
    await page.locator("#search-input").fill("Checkbox ");
    assert.equal(await checkbox.isChecked(), false);
    assert.equal(await page.locator("#search-input").inputValue(), "Checkbox ");
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});

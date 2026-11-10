import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "../design-compare/node_modules/playwright/index.mjs";
import { createStaticServer } from "./support/static-server.mjs";
test("Patterns starts at the top and exclusively opens categories and subtopics, shortcuts and history", async () => {
  const server = createStaticServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await chromium.launch();
  try {
    const p = await browser.newPage();
    await p.route(/https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    const errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    const base = `http://127.0.0.1:${server.address().port}/ui-components/index.html`;
    for (const width of [390, 1440]) {
      await p.setViewportSize({ width, height: 1000 });
      await p.goto(base);
      assert.equal(await p.locator(".pattern-topic-card").count(), 6);
      assert.equal(await p.locator(".layer-tree [aria-expanded=true]").count(), 0);
      assert.equal(await p.locator(".component-card:visible").count(), 0);
      assert.equal(await p.locator("[data-i18n=nav_components]").textContent(), "Patterns");
      const components = p.locator("[data-target=components] .category-button"),
        layout = p.locator("[data-target=layout-navigation] .category-button");
      await components.click();
      assert.equal(await components.getAttribute("aria-expanded"), "true");
      await layout.click();
      assert.equal(await components.getAttribute("aria-expanded"), "false");
      assert.equal(await layout.getAttribute("aria-expanded"), "true");
      await p.waitForFunction(() => document.getElementById("panel-tree-components").hidden);
      assert.equal(await p.locator(".layer-tree [aria-expanded=true]").count(), 1);
      await p.locator("[data-target=layout-navigation] [data-group=structure]").click();
      await p.locator("[data-sample-id=lnb-sidebar]").waitFor({ state: "visible" });
      assert.match(p.url(), /#\/layout-navigation\/structure/);
      const structure = p.locator("#summary-content-layout-navigation-structure"),
        content = p.locator("#summary-content-layout-navigation-content");
      await content.click();
      assert.equal(await structure.getAttribute("aria-expanded"), "false");
      assert.equal(await content.getAttribute("aria-expanded"), "true");
      await p.goBack();
      assert.equal(await structure.getAttribute("aria-expanded"), "true");
      await p.reload();
      assert.equal(await structure.getAttribute("aria-expanded"), "true");
      assert.equal(await p.locator(".layer-tree [aria-expanded=true]").count(), 1);
      await components.click();
      await layout.click();
      assert.equal(await structure.getAttribute("aria-expanded"), "true");
      await p.keyboard.press("Control+k");
      assert.equal(
        await p.locator("#search-input").evaluate((e) => e === document.activeElement),
        true,
      );
      await p.locator("#search-input").fill("Accordion");
      assert.equal(await p.locator(".component-title").textContent(), "접이식 영역");
      await p.locator("#search-input").fill("화면 이동 ");
      assert.equal(await p.locator("#search-input").inputValue(), "화면 이동 ");
      await p.keyboard.press("Escape");
      assert.equal(await p.locator("#search-input").inputValue(), "");
      await p.locator("#summary-content-layout-navigation-structure").click();
      await p.waitForFunction(
        () => document.getElementById("panel-content-layout-navigation-structure").hidden,
      );
      assert.equal(
        await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
    }
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }
});

test("subtopic folds preserve sample state and reduced motion skips animations", async () => {
  const server = createStaticServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await chromium.launch();
  try {
    const p = await browser.newPage();
    await p.route(/https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    await p.goto(
      `http://127.0.0.1:${server.address().port}/ui-components/index.html#/components/selection`,
    );
    const checkbox = p.locator("[data-sample-id=checkbox] input").first();
    await checkbox.uncheck();
    await p.locator("#summary-content-components-inputs").click();
    await p.locator("#summary-content-components-selection").click();
    assert.equal(await checkbox.isChecked(), false);
    await p.emulateMedia({ reducedMotion: "reduce" });
    await p.locator("[data-target=layout-navigation] .category-button").click();
    assert.equal(await p.locator("#panel-tree-components").evaluate((e) => e.hidden), true);
    assert.equal(
      await p.locator("#panel-tree-layout-navigation").evaluate((e) => e.getAnimations().length),
      0,
    );
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }
});

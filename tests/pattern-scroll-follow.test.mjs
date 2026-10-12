import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "../design-compare/node_modules/playwright/index.mjs";
import { createStaticServer } from "./support/static-server.mjs";
test("clicking the next content heading follows its position after the previous topic collapses", async () => {
  const server = createStaticServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(
        `http://127.0.0.1:${server.address().port}/ui-components/index.html#/motion/expressive`,
      );
      const next = page.locator("#summary-content-motion-loading");
      await next.scrollIntoViewIfNeeded();
      await next.click();
      await page.waitForFunction(() => {
        const target = document.querySelector(
          "#summary-content-motion-loading",
        );
        const rect = target.getBoundingClientRect();
        const nav = document
          .querySelector("#dh-global-nav")
          .getBoundingClientRect();
        return (
          document.querySelector("#panel-content-motion-expressive").hidden &&
            target.getAttribute("aria-expanded") === "true" &&
          rect.top >= nav.bottom &&
          rect.top < 250
        );
      });
      assert.ok(await next.evaluate((el) => document.activeElement === el));
      assert.equal(
        await page.locator("#panel-content-motion-expressive").isVisible(),
        false,
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      const earlier = page.locator("#summary-content-motion-transitions");
      await earlier.scrollIntoViewIfNeeded();
      await earlier.click();
      await page.waitForFunction(() => {
        const rect = document
          .querySelector("#summary-content-motion-transitions")
          .getBoundingClientRect();
        return (
          rect.top >=
            document.querySelector("#dh-global-nav").getBoundingClientRect()
              .bottom && rect.top < 250
        );
      });
      await page.close();
    }
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }
});

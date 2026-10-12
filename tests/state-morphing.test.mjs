import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "../design-compare/node_modules/playwright/index.mjs";
import { createStaticServer } from "./support/static-server.mjs";
test("state morphing supports completion, cancellation, expansion, controls, reduced motion and navigation cleanup", async () => {
  const server = createStaticServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
      }),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const base = `http://127.0.0.1:${server.address().port}/ui-components/index.html`;
    await page.goto(base + "#/motion/adaptive");
    await page.locator("[data-morph-action]").click();
    await page.locator("[data-action-cancel]").click();
    assert.equal(
      await page.locator("[data-morph-action]").getAttribute("data-state"),
      "idle",
    );
    await page.locator("[data-morph-action]").click();
    await page.waitForFunction(
      () =>
        document.querySelector("[data-morph-action]").dataset.state === "done",
    );
    assert.ok(
      await page
        .locator("[data-morph-action]")
        .evaluate((el) => el === document.activeElement),
    );
    await page.locator("[data-island-toggle]").click();
    await page.locator("[data-play]").click();
    assert.equal(
      await page.locator("[data-play-state]").textContent(),
      "재생 중",
    );
    await page.locator("[data-next]").click();
    assert.equal(
      await page.locator("[data-track]").textContent(),
      "Ocean Light",
    );
    await page.waitForTimeout(400);
    await page
      .locator("[data-island]")
      .evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.screenshot({ path: "/tmp/morph-island-desktop.png" });
    await page.keyboard.press("Escape");
    assert.equal(
      await page.locator("[data-island-toggle]").getAttribute("aria-expanded"),
      "false",
    );
    assert.ok(
      await page
        .locator("[data-island-toggle]")
        .evaluate((el) => el === document.activeElement),
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator("[data-island-toggle]").click();
    assert.equal(await page.locator("[data-island-detail]").isVisible(), true);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator("[data-island]").scrollIntoViewIfNeeded();
    await page.screenshot({ path: "/tmp/morph-island-mobile.png" });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.goto(base + "#/heuristics/visibility?view=purpose");
    assert.ok(await page.locator("[data-morph-action]").isVisible());
    await page.locator("[data-morph-action]").click();
    await page.getByRole("radio", { name: "UI 관점" }).check();
    await page.waitForTimeout(1500);
    assert.equal(await page.locator("[data-morph-action]").count(), 0);
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }
});

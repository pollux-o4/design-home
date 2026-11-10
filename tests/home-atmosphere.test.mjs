import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "../design-compare/node_modules/playwright/index.mjs";
import { createStaticServer } from "./support/static-server.mjs";

test("page gradient follows the pointer while title sparkles pause offscreen and respect reduced motion", async () => {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const scene = page.locator(".hero");
    const background = page.locator(".hero-atmosphere");
    await page.waitForFunction(() => document.body.classList.contains("is-motion-running"));
    assert.equal(await page.locator(".hero-atmosphere").getAttribute("aria-hidden"), "true");
    assert.equal(await scene.locator(".hero-title-sparkles i").count(), 48);
    assert.equal(await scene.locator(".atmosphere-tiles").count(), 0);
    const initial = await background
      .locator(".atmosphere-bloom")
      .first()
      .evaluate((element) => getComputedStyle(element).transform);
    await page.waitForTimeout(5200);
    assert.notEqual(
      await background
        .locator(".atmosphere-bloom")
        .first()
        .evaluate((element) => getComputedStyle(element).transform),
      initial,
    );
    assert.ok(
      await scene.evaluate((element) =>
        element
          .getAnimations({ subtree: true })
          .every((animation) => animation.playState === "running"),
      ),
    );
    assert.equal(await page.locator(".hero-motion-toggle").count(), 0);
    await page.mouse.move(150, 170);
    await page.waitForTimeout(300);
    const pointer = background.locator(".atmosphere-pointer");
    const firstPosition = await pointer.getAttribute("style");
    await page.mouse.move(700, 400);
    await page.waitForTimeout(300);
    assert.notEqual(
      await pointer.getAttribute("style"),
      firstPosition,
      "background reacts to the cursor",
    );
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 932 });
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `no overflow at ${width}`,
      );
      const bounds = await scene.boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width);
    }
    await page.getByRole("button", { name: "EN · Switch to English" }).click();
    const nav = await page.locator("#dh-global-nav").boundingBox();
    for (const selector of [".dh-brand", ".dh-nav-right", ".dh-nav-links"]) {
      const bounds = await page.locator(`#dh-global-nav ${selector}`).boundingBox();
      assert.ok(
        bounds.y + bounds.height <= nav.y + nav.height,
        `${selector} stays inside the small English header`,
      );
    }
    await page.locator("footer").scrollIntoViewIfNeeded();
    await page.waitForFunction(() => !document.querySelector(".hero.is-title-visible"));
    assert.ok(
      await scene.evaluate((element) =>
        element
          .getAnimations({ subtree: true })
          .every((animation) => animation.playState === "paused"),
      ),
    );
    assert.ok(
      await background.evaluate((element) =>
        element
          .getAnimations({ subtree: true })
          .every((animation) => animation.playState === "running"),
      ),
    );
    const backgroundBounds = await background.boundingBox();
    assert.equal(backgroundBounds.y, 0, "background covers the viewport after scrolling");
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
    await page.reload();
    assert.equal(
      await scene.evaluate((element) => element.getAnimations({ subtree: true }).length),
      0,
    );
    assert.equal(
      await background.evaluate((element) => element.getAnimations({ subtree: true }).length),
      0,
    );
    assert.equal(
      await page.locator(".hero-title").evaluate((element) => getComputedStyle(element).textAlign),
      "center",
    );
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});

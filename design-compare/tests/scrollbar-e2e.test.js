import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createHubServer } from "../hub/server.js";

test("page keeps the native scrollbar while an embedded scrollbar supports drag and keyboard", async () => {
  const server = createHubServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`,
    browser = await chromium.launch();
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  await page.route("https://**/*", (route) => route.abort());
  try {
    await page.goto(`${base}/design-library/#/components`);
    const card = page.locator('.design-card[data-id="component-scrollbar"]');
    await card.waitFor();
    await card.scrollIntoViewIfNeeded();
    const image = card.locator("img");
    await image.waitFor();
    await image.evaluate((node) =>
      node.complete
        ? Promise.resolve()
        : new Promise((resolve) => node.addEventListener("load", resolve, { once: true })),
    );
    await page.evaluate(() => scrollTo(0, 0));
    assert.ok(await image.evaluate((node) => node.complete && node.naturalWidth > 0));
    await page.screenshot({
      path: "../.legacy-review/design-library-components.png",
      fullPage: true,
    });
    assert.equal(await page.locator(".dh-scroll-rail[data-root]").count(), 0);
    assert.equal(
      await page.evaluate(() => document.scrollingElement.classList.contains("dh-scroll-native")),
      false,
    );
    await card.click();
    const frame = page.frameLocator("#preview");
    await page.locator("#preview").scrollIntoViewIfNeeded();
    const region = frame.locator("[data-scroll-region]");
    await region.waitFor();
    const rail = frame.locator('.dh-scroll-rail[data-axis="y"]');
    await rail.hover();
    await page.waitForTimeout(220);
    assert.ok(
      await rail
        .locator(".dh-scroll-thumb")
        .evaluate((node) => parseFloat(getComputedStyle(node, "::after").width) >= 7),
    );
    await rail.focus();
    await page.keyboard.press("End");
    assert.ok(await region.evaluate((node) => node.scrollTop > 100));
    await page.keyboard.press("Home");
    assert.equal(await region.evaluate((node) => node.scrollTop), 0);
    const thumb = await rail.locator(".dh-scroll-thumb").boundingBox();
    await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + 10);
    await page.mouse.down();
    await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + 100, { steps: 10 });
    await page.mouse.up();
    assert.ok(await region.evaluate((node) => node.scrollTop > 100));
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await rail
        .locator(".dh-scroll-thumb")
        .evaluate((node) => getComputedStyle(node, "::after").transitionDuration),
      "0s",
    );
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});

test("horizontal scrollbar follows resized content, removes unused tracks and keeps native high-contrast scrolling", async () => {
  const server = createHubServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch(),
    page = await browser.newPage();
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}/ui-components/scrollbar/index.html`);
    const region = page.locator("[data-scroll-region]");
    await region.locator(".sample-content").evaluate((node) => {
      node.style.width = "1200px";
    });
    const horizontal = page.locator('.dh-scroll-rail[data-axis="x"]');
    await horizontal.waitFor();
    await horizontal.focus();
    await page.keyboard.press("End");
    assert.ok(await region.evaluate((node) => node.scrollLeft > 100));
    await page.emulateMedia({ forcedColors: "active" });
    assert.equal(await region.evaluate((node) => getComputedStyle(node).scrollbarWidth), "auto");
    assert.equal(await horizontal.evaluate((node) => getComputedStyle(node).display), "none");
    await page.emulateMedia({ forcedColors: "none" });
    await region.locator(".sample-content").evaluate((node) => {
      node.style.width = "";
    });
    await horizontal.waitFor({ state: "hidden" });
    await region.evaluate((node) => {
      node.style.height = "1200px";
    });
    await page.locator('.dh-scroll-rail[data-axis="y"]').waitFor({ state: "hidden" });
    await region.evaluate((node) => node.remove());
    await page.waitForFunction(() => document.querySelectorAll(".dh-scroll-rail").length === 0);
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});

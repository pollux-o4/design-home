import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createStaticServer } from "./support/static-server.mjs";

test("home previews: hover, keyboard dismissal, touch hold/cancel, links and reduced motion", async () => {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch();
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 1100 });
    const previewRequests = [];
    page.on("request", (request) => {
      if (request.url().includes("/assets/index/previews/")) previewRequests.push(request.url());
    });
    await page.goto(base);
    const entry = page.locator(".learning-entry").first();
    await entry.locator(".preview-screen").waitFor({ state: "attached" });
    assert.equal(await page.locator(".preview-toggle").count(), 0);
    await page.waitForTimeout(200);
    assert.equal(previewRequests.length, 0, "idle home must not fetch hidden previews");
    // Keep both rows visible so handoff checks exercise pointer movement, not scrolling dismissal.
    await page.evaluate(() =>
      window.scrollTo({
        top: document.querySelector(".hub-section").offsetTop - 110,
        behavior: "instant",
      }),
    );
    await entry.hover();
    await page.waitForFunction(() =>
      document.querySelector(".learning-entry").classList.contains("is-previewing"),
    );
    await entry.locator(".preview-screen").waitFor({ state: "visible" });
    await page.waitForFunction(
      () => document.querySelector(".preview-screen img").naturalWidth > 0,
    );
    assert.equal(previewRequests.length, 1, "opening one preview fetches only that image");
    assert.equal(
      await entry.locator(".preview-screen img").first().getAttribute("src"),
      `${base}/assets/index/previews/trends.png`,
    );
    const bounds = await entry.boundingBox();
    const previewBounds = await entry.locator(".preview-screen").boundingBox();
    assert.ok(previewBounds.x >= 0 && previewBounds.y >= 0);
    assert.ok(previewBounds.x + previewBounds.width <= 1280);
    await page.mouse.move(bounds.x + 80, bounds.y + 70);
    await page.waitForTimeout(200);
    const followed = await entry.locator(".preview-screen").boundingBox();
    await page.mouse.move(bounds.x + 40, bounds.y + 70);
    await page.waitForTimeout(200);
    const moved = await entry.locator(".preview-screen").boundingBox();
    assert.ok(Math.abs(moved.x - followed.x) > 5, "preview follows pointer movement");
    const overlap = { x: Math.max(bounds.x, moved.x) + 45, y: Math.max(bounds.y, moved.y) + 45 };
    assert.equal(
      await page.evaluate(
        ({ x, y }) => document.elementFromPoint(x, y)?.closest(".preview-screen") === null,
        overlap,
      ),
      true,
      "visual preview must not intercept the pointer",
    );
    await page.mouse.move(overlap.x, overlap.y);
    await page.waitForTimeout(200);
    const throughPreview = await entry.locator(".preview-screen").boundingBox();
    assert.ok(
      Math.abs(throughPreview.x - moved.x) + Math.abs(throughPreview.y - moved.y) > 5,
      "tracking continues when the pointer crosses the displayed preview",
    );
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 100);
    await page.waitForTimeout(300);
    const outside = await entry.locator(".preview-screen").boundingBox();
    const outsidePoint = {
      x: Math.min(outside.x + outside.width - 20, bounds.x + bounds.width + 8),
      y: Math.max(bounds.y, outside.y) + 65,
    };
    assert.ok(
      outsidePoint.x > bounds.x + bounds.width,
      "test reaches preview beyond the source card",
    );
    await page.mouse.move(outsidePoint.x, outsidePoint.y);
    await page.waitForTimeout(280);
    assert.equal(
      await entry.evaluate((el) => el.classList.contains("is-previewing")),
      true,
      "preview-only area keeps the source preview tracking",
    );
    assert.equal(
      await page.locator(".learning-entry.is-previewing").count(),
      1,
      "crossing the preview must not activate an obscured adjacent card",
    );
    await page.mouse.move(0, 0);
    await page.waitForTimeout(220);
    assert.equal(
      await entry.evaluate((el) => el.classList.contains("is-previewing")),
      false,
      "leaving both the card and preview dismisses it",
    );
    await page.evaluate(() => {
      window.previewOverlapFrames = 0;
      const sample = () => {
        const visible = [...document.querySelectorAll(".preview-screen")].filter((el) => {
          const css = getComputedStyle(el);
          return (
            css.display !== "none" && css.visibility !== "hidden" && Number(css.opacity) > 0.01
          );
        });
        if (visible.length > 1) window.previewOverlapFrames++;
        window.previewSampleFrame = requestAnimationFrame(sample);
      };
      sample();
    });
    for (const index of [0, 2, 0, 2]) {
      const target = page.locator(".learning-entry").nth(index);
      await target.hover();
      await page.waitForTimeout(220);
      assert.equal(
        await target.evaluate((el) => el.classList.contains("is-previewing")),
        true,
        "entering the next row transfers preview ownership",
      );
      assert.equal(await page.locator(".learning-entry.is-previewing").count(), 1);
    }
    for (const index of [0, 2, 0, 2]) {
      await page.locator(".learning-entry").nth(index).hover();
      await page.waitForTimeout(40);
      assert.equal(
        await page.locator(".learning-entry.is-previewing").count(),
        1,
        "rapid direction changes retain one preview",
      );
    }
    assert.equal(
      await page.evaluate(() => {
        cancelAnimationFrame(window.previewSampleFrame);
        return window.previewOverlapFrames;
      }),
      0,
      "no rendered frame may contain overlapping previews",
    );
    await page.mouse.move(0, 0);
    await page.waitForTimeout(110);
    assert.equal(
      await page.locator(".preview-screen:visible").count(),
      0,
      "leaving the preview region must not leave a fading stale image",
    );
    await entry.hover();
    await page.waitForFunction(() =>
      document.querySelector(".learning-entry").classList.contains("is-previewing"),
    );
    // The learning grid may already be at the document's lower scroll limit.
    await page.mouse.wheel(0, -140);
    await page.waitForTimeout(100);
    assert.equal(
      await page.locator(".learning-entry.is-previewing").count(),
      0,
      "scrolling clears old previews and pending timers",
    );
    await page.keyboard.press("Escape");
    assert.equal(await entry.evaluate((el) => el.classList.contains("is-previewing")), false);
    const closedBounds = await entry.boundingBox();
    assert.equal(closedBounds.width, bounds.width);
    assert.equal(closedBounds.height, bounds.height);
    await page.mouse.move(0, 0);
    await entry.locator("a").focus();
    assert.equal(await entry.evaluate((el) => el.classList.contains("is-previewing")), true);
    await page.locator(".learning-entry a").last().focus();
    await page.waitForTimeout(100);
    assert.equal(
      await page
        .locator(".learning-entry")
        .last()
        .evaluate((el) => el.classList.contains("is-previewing")),
      true,
      "keyboard auto-scroll keeps the newly focused preview",
    );
    assert.equal(await page.locator(".learning-entry.is-previewing").count(), 1);
    await page.keyboard.press("Escape");
    assert.equal(await entry.evaluate((el) => el.classList.contains("is-previewing")), false);
    await page.locator("#dh-lang-en").click();
    assert.match(await entry.locator(".preview-screen-caption").textContent(), /Screen preview/);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await entry.hover();
    await page.waitForFunction(() =>
      document.querySelector(".learning-entry").classList.contains("is-previewing"),
    );
    assert.equal(
      await entry
        .locator(".preview-screen")
        .evaluate((el) => getComputedStyle(el).transitionDuration),
      "0s",
    );

    const mobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const touch = await mobile.newPage();
    await touch.goto(base);
    const card = touch.locator(".learning-entry").first();
    const link = card.locator("a");
    await card.locator(".preview-screen").waitFor({ state: "attached" });
    await card.scrollIntoViewIfNeeded();
    const cdp = await mobile.newCDPSession(touch);
    const box = await link.boundingBox();
    const x = box.x + box.width - 65,
      y = box.y + box.height - 65;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    await touch.waitForTimeout(480);
    assert.equal(await card.evaluate((el) => el.classList.contains("is-previewing")), true);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    assert.equal(new URL(touch.url()).pathname, "/");
    await touch.locator(".preview-hint").tap();
    assert.equal(await card.evaluate((el) => el.classList.contains("is-previewing")), false);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y: y - 70 }],
    });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
    await touch.waitForTimeout(450);
    assert.equal(await card.evaluate((el) => el.classList.contains("is-previewing")), false);
    assert.equal(
      await touch.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
    await link.tap();
    await touch.waitForURL("**/trend-style/index.html");
    await mobile.close();
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});

test("preview slides rotate on dwell, mark the current dot and stop when closed or motion is reduced", async () => {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    const entry = page.locator(".learning-entry").first();
    await entry.hover();
    await page.waitForFunction(() =>
      document.querySelector(".learning-entry").classList.contains("is-preview-ready"),
    );
    assert.equal(await entry.locator(".preview-dots span").count(), 3);
    await page.waitForFunction(
      () => document.querySelector(".preview-screen").dataset.slide === "1",
      null,
      { timeout: 5000 },
    );
    assert.equal(
      await entry
        .locator(".preview-dots .is-current")
        .evaluate((el) => [...el.parentElement.children].indexOf(el)),
      1,
    );
    assert.equal(
      await entry.locator(".preview-slide.is-current").getAttribute("src"),
      `http://127.0.0.1:${server.address().port}/assets/index/previews/glassmorphism.png`,
    );
    await page.waitForFunction(
      () => document.querySelector(".preview-screen").dataset.slide === "2",
      null,
      { timeout: 5000 },
    );
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);
    await page.waitForTimeout(2800);
    assert.equal(await entry.locator(".preview-screen").getAttribute("data-slide"), "0");
    assert.equal(await entry.locator(".preview-screen").isVisible(), false);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await entry.hover();
    await page.waitForTimeout(2900);
    assert.equal(await entry.locator(".preview-screen").getAttribute("data-slide"), "0");
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});

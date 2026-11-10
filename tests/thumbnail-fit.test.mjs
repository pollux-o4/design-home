import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createHubServer } from "../design-compare/hub/server.js";

let server, browser, base;
before(async () => {
  server = createHubServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch();
});
after(async () => {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
});

async function assertFittedImage(page, image, width) {
  await image.scrollIntoViewIfNeeded();
  await image.evaluate((image) => image.decode());
  for (const hover of [false, true]) {
    if (hover) await image.hover();
    else await page.mouse.move(0, 0);
    const fit = await image.evaluate((image) => {
      const style = getComputedStyle(image);
      const width =
        image.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const height =
        image.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      const contain = Math.min(width / image.naturalWidth, height / image.naturalHeight);
      const scale =
        style.objectFit === "scale-down"
          ? Math.min(1, contain)
          : style.objectFit === "contain"
            ? contain
            : style.objectFit === "cover"
              ? Math.max(width / image.naturalWidth, height / image.naturalHeight)
              : Infinity;
      const rect = image.getBoundingClientRect(),
        frame = image.parentElement.getBoundingClientRect();
      return {
        id: image.closest(".design-card")?.dataset.id || image.id || image.src.split("/").pop(),
        complete:
          image.naturalWidth * scale <= width + 1 && image.naturalHeight * scale <= height + 1,
        inFrame:
          rect.left >= frame.left - 1 &&
          rect.right <= frame.right + 1 &&
          rect.top >= frame.top - 1 &&
          rect.bottom <= frame.bottom + 1,
        scale,
        transform: style.transform,
      };
    });
    assert.ok(fit.complete && fit.inFrame, `${fit.id} is cropped at ${width}px (hover=${hover})`);
    assert.ok(fit.scale <= 1, `${fit.id} is enlarged ${fit.scale.toFixed(2)}× at ${width}px`);
    assert.equal(fit.transform, "none", `${fit.id} zooms on hover`);
  }
}

test("every library thumbnail preserves the whole source without enlarging small captures", async () => {
  const page = await browser.newPage();
  try {
    for (const category of ["components", "trends"]) {
      await page.goto(`${base}/design-library/#/${category}`);
      await page.locator(".design-thumbnail").first().waitFor();
      for (const width of [390, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const image of await page.locator(".design-thumbnail").all()) {
          await assertFittedImage(page, image, width);
        }
      }
    }
  } finally {
    await page.close();
  }
});

test("home previews preserve the entire artwork inside their frame", async () => {
  const page = await browser.newPage();
  try {
    await page.goto(`${base}/index.html`);
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const image of await page.locator("#stage-image, .card-art img").all()) {
        await assertFittedImage(page, image, width);
      }
    }
  } finally {
    await page.close();
  }
});

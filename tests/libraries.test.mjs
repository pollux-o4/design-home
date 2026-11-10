import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createStaticServer } from "./support/static-server.mjs";
import { libraries } from "../libraries/js/catalog.js";
import { readRoute, routeUrl } from "../libraries/js/route.js";

test("library routes validate category and comparison IDs", () => {
  const state = readRoute("#/unknown?compare=motion,motion,gsap,bad,anime-js,lenis");
  assert.deepEqual(state, {
    category: "",
    query: "",
    compare: ["motion", "gsap", "anime-js"],
  });
  assert.deepEqual(readRoute(routeUrl(state)), state);
});

test("Libraries supports exclusive categories, search, comparison and responsive navigation", async () => {
  const server = createStaticServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
      }),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/libraries/index.html`);
    assert.equal(await page.locator(".pattern-summary[aria-expanded=true]").count(), 0);
    assert.equal(
      await page
        .locator("#dh-global-nav .dh-study-link.active")
        .textContent()
        .then((s) => s.trim()),
      "Libraries",
    );
    await page.locator("#summary-library-motion").click();
    for (const item of libraries) {
      const card = page.locator(`[data-library="${item.id}"]`);
      assert.equal(await card.locator(".outcomes-description").textContent(), item.capabilities);
      const example = card.locator(".example-link");
      assert.equal(await example.getAttribute("href"), item.examples);
      assert.equal(await example.getAttribute("target"), "_blank");
      assert.ok(item.examples.startsWith("https://"));
    }
    await page.route("https://motion.dev/examples", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<h1>Official examples destination</h1>",
      }),
    );
    const popupPromise = page.waitForEvent("popup");
    await page.locator("[data-library=motion] .example-link").click();
    const popup = await popupPromise;
    await popup.waitForLoadState();
    assert.equal(popup.url(), "https://motion.dev/examples");
    await popup.close();

    await page.getByRole("button", { name: "Motion 비교에 추가", exact: true }).click();
    await page.getByRole("button", { name: "GSAP 비교에 추가", exact: true }).click();
    await page.getByRole("button", { name: "Anime.js 비교에 추가", exact: true }).click();
    assert.equal(await page.locator("[data-library=lenis] .compare-button").isDisabled(), true);
    assert.equal(await page.locator("#comparison thead th").count(), 4);
    await page.locator("[data-library=motion] summary").click();
    assert.equal(
      await page.locator("[data-library=motion] .official-link").getAttribute("href"),
      "https://motion.dev/docs",
    );
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: "/tmp/libraries-motion-1440.png",
      fullPage: true,
    });
    await page.locator("#summary-library-graphics").click();
    await page.locator("#panel-library-motion").waitFor({ state: "hidden" });
    assert.equal(await page.locator(".pattern-summary[aria-expanded=true]").count(), 1);
    assert.equal(await page.locator("#panel-library-motion").isVisible(), false);
    await page.goBack();
    assert.equal(
      await page.locator("#summary-library-motion").getAttribute("aria-expanded"),
      "true",
    );
    await page.goForward();
    assert.equal(
      await page.locator("#summary-library-graphics").getAttribute("aria-expanded"),
      "true",
    );
    await page.reload();
    assert.equal(await page.locator("#comparison thead th").count(), 4);
    await page.locator("#library-search").fill("React Aria");
    assert.equal(await page.locator(".library-card:visible").count(), 1);
    assert.equal(await page.locator(".library-card:visible h3").textContent(), "React Aria");
    await page.locator("#summary-library-headless").click();
    assert.equal(
      await page.locator("#summary-library-headless").getAttribute("aria-expanded"),
      "false",
    );
    await page.locator("#summary-library-headless").click();
    await page.locator("#library-search").fill("no-such-tool");
    assert.equal(await page.locator("#empty").isVisible(), true);
    await page.locator("#reset-search").click();
    await page.locator("#clear-comparison").click();
    assert.equal(await page.locator("#comparison").isVisible(), false);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.locator("#summary-library-motion").click();
      await page.waitForTimeout(300);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `overflow at ${width}`,
      );
      await page.getByRole("button", { name: "Motion 비교에 추가", exact: true }).click();
      await page.getByRole("button", { name: "GSAP 비교에 추가", exact: true }).click();
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `comparison overflow at ${width}`,
      );
      await page.evaluate(() => scrollTo(0, 0));
      if (width === 390)
        await page.screenshot({
          path: "/tmp/libraries-motion-390.png",
          fullPage: true,
        });
      await page.locator("#clear-comparison").click();
      await page.locator("#summary-library-motion").click();
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator("#summary-library-headless").click();
    await page.locator("#summary-library-kits").click();
    assert.equal(await page.locator("#panel-library-headless").isVisible(), false);
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createStaticServer } from "./support/static-server.mjs";

test("component browsing, full sample bounds, search recovery and official references", async () => {
  const server = createStaticServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
    const url = `http://127.0.0.1:${server.address().port}/ui-components/index.html`;
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(url);
      await page.locator(".pattern-topic-card").first().waitFor();
      const categories = page.locator(".category-button");
      for (let i = 0; i < (await categories.count()); i++) {
        await categories.nth(i).click();
        assert.equal(await page.locator(".pattern-topic-header").count(), 1);
        for (const group of await page.locator("#canvas-grid .pattern-summary").all())
          await group.click();
        const bounds = await page.evaluate(() => {
          const view = document.querySelector("main");
          return {
            page: document.body.scrollWidth,
            width: innerWidth,
            view: view.scrollWidth,
            client: view.clientWidth,
            cards: [...document.querySelectorAll(".component-body")].every(
              (e) => e.scrollWidth <= e.clientWidth + 1,
            ),
          };
        });
        assert.ok(bounds.page <= bounds.width, JSON.stringify(bounds));
        assert.ok(bounds.view <= bounds.client + 1, JSON.stringify(bounds));
        assert.ok(bounds.cards, `sample overflow at ${width}, category ${i}`);
      }
    }
    await page.locator("#search-input").fill("Accordion");
    assert.equal(await page.locator(".component-title").textContent(), "접이식 영역");
    assert.equal(await page.locator(".component-term").textContent(), "Accordion");
    assert.equal(await page.locator(".component-term").getAttribute("lang"), "en");
    await page.locator("#search-input").fill("접이식");
    assert.equal(
      await page
        .locator(".component-card:has([data-sample-id=accordion]) .component-term")
        .textContent(),
      "Accordion",
    );
    assert.ok(
      await page.evaluate(() =>
        Object.values(ComponentModules)
          .flatMap((m) => CanvasCatalog.create().components(m))
          .every((c) => typeof c.term === "string" && c.term.length > 0),
      ),
    );
    await page.locator("#search-input").fill("Toggle");
    assert.ok((await page.locator(".component-card").count()) > 0);
    await page.locator("#search-input").fill("no-matching-component-xyz");
    await page.locator("#reset-search").click();
    assert.equal(await page.locator("#search-input").inputValue(), "");
    await page.locator(".sidebar-accordion-header").click();
    assert.equal(
      await page.locator(".sidebar-accordion-header").getAttribute("aria-expanded"),
      "true",
    );
    const reference = page.locator(".component-reference").first();
    assert.equal(await reference.getAttribute("target"), "_blank");
    assert.match(
      await reference.getAttribute("href"),
      /^https:\/\/(developer\.mozilla\.org|developer\.apple\.com|www\.w3\.org)\//,
    );
    assert.equal(await page.locator("#code-modal-overlay").count(), 0);
    assert.ok(
      await page.evaluate(() =>
        Object.values(ComponentModules)
          .flatMap((m) => CanvasCatalog.create().components(m))
          .every((c) => c.reference?.startsWith("https://")),
      ),
    );
    await page.goto(url + "?view=specimen&component=toggle-switch");
    await page.locator(".component-card").waitFor();
    assert.equal(await page.locator(".component-card").count(), 1);
    const toggle = page.locator(".ui-toggle");
    const input = toggle.locator("input");
    const before = await input.isChecked();
    await toggle.click();
    assert.notEqual(await input.isChecked(), before);
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }
});

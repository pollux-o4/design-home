import test from "node:test";
import assert from "node:assert/strict";
import principles from "../ui-components/js/pattern-principles.js";
import { topics } from "../ui-components/js/pattern-taxonomy.js";
import { readRoute, routeHref } from "../ui-components/js/pattern-route.js";
import { chromium } from "../design-compare/node_modules/playwright/index.mjs";
import { createStaticServer } from "./support/static-server.mjs";
test("UX principles refer to existing samples without duplicates within a category", () => {
  const originals = new Set(topics.flatMap((topic) => topic.groups.flatMap((group) => group.ids)));
  for (const topic of principles) {
    const ids = topic.groups.flatMap((group) => group.ids);
    assert.equal(new Set(ids).size, ids.length, topic.id);
    for (const id of ids) {
      assert.ok(originals.has(id), id);
    }
  }
  assert.equal(principles[0].groups.length, 10);
  assert.equal(principles[1].groups.length, 4);
  const state = {
    view: "purpose",
    category: "heuristics",
    group: "minimalism",
    level: "advanced",
    query: "",
  };
  assert.deepEqual(readRoute(routeHref(state)), state);
  assert.equal(readRoute("#/motion/transitions").view, "kind");
});
test("view switcher preserves search and restores deep links with native keyboard navigation", async () => {
  const server = createStaticServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
      }),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/ui-components/index.html`);
    await page.getByRole("radio", { name: "UX 관점" }).check();
    assert.equal(await page.locator(".layer-item").count(), 2);
    await page.locator("[data-target=heuristics] .category-button").click();
    await page.locator("#summary-content-heuristics-minimalism").click();
    assert.ok(await page.locator("[data-sample-id=motion-shared-element]").isVisible());
    assert.equal(await page.locator(".sample:visible").count(), 4);
    await page.reload();
    assert.ok(await page.getByRole("radio", { name: "UX 관점" }).isChecked());
    await page.screenshot({ path: "/tmp/pattern-purpose-desktop.png" });
    await page.getByRole("radio", { name: "UI 관점" }).check();
    assert.equal(await page.locator(".layer-item").count(), 6);
    await page.goBack();
    assert.ok(await page.locator("[data-sample-id=motion-shared-element]").isVisible());
    await page.locator(".pattern-breadcrumb a").click();
    assert.ok(page.url().includes("view=purpose"));
    await page.locator("#search-input").fill("Fitts");
    assert.equal(await page.locator(".pattern-topic-card h2").textContent(), "인지·행동 법칙");
    await page.locator("#search-input").fill("accordion");
    await page.getByRole("radio", { name: "UI 관점" }).check();
    assert.equal(await page.locator("#search-input").inputValue(), "accordion");
    await page.locator("#search-input").fill("");
    const kind = page.getByRole("radio", { name: "UI 관점" });
    await kind.focus();
    await page.keyboard.press("ArrowRight");
    assert.ok(await page.getByRole("radio", { name: "UX 관점" }).isChecked());
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    await page.setViewportSize({ width: 390, height: 900 });
    await page.screenshot({ path: "/tmp/pattern-purpose-mobile.png" });
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }
});

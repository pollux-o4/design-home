import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "../design-compare/node_modules/playwright/index.mjs";
import { createStaticServer } from "./support/static-server.mjs";

let server, browser, base;
before(async () => {
  server = createStaticServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  browser = await chromium.launch();
  base = `http://127.0.0.1:${server.address().port}/ui-components/index.html`;
});
after(async () => {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
});
async function pageAt(suffix = "") {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  await page.route(/https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
  await page.goto(base + suffix);
  await page.locator("#canvas-grid > *").first().waitFor();
  return page;
}
async function specimen(page, id) {
  await page.goto(`${base}?view=specimen&component=${id}`);
  await page.locator(`[data-sample-id=${id}]`).waitFor();
}
const running = (page) =>
  page
    .locator(".sample")
    .evaluateAll(
      (roots) =>
        roots
          .flatMap((root) => root.getAnimations({ subtree: true }))
          .filter((animation) =>
            ["running", "paused"].includes(animation.playState),
          ).length,
    );

test("Basic and Advanced stay visible in reading order and preserve sample state", async () => {
  const page = await pageAt("#/motion/expressive?level=advanced");
  try {
    assert.equal(await page.locator(".component-card:visible").count(), 6);
    assert.equal(
      await page.locator(".pattern-level-view [role=tab]").count(),
      0,
    );
    await page
      .locator("[data-sample-id=motion-counter] [data-motion-play]")
      .click();
    await page.waitForFunction(
      () => document.querySelector("[data-metric]").textContent === "12,000",
    );
    await page
      .locator(".pattern-level-section[data-level=advanced]")
      .scrollIntoViewIfNeeded();
    assert.equal(await page.locator("[data-metric]").textContent(), "12,000");
    await page.locator("#summary-content-motion-expressive").click();
    await page.locator("#summary-content-motion-expressive").click();
    assert.equal(await page.locator("[data-metric]").textContent(), "12,000");
    assert.equal(await page.locator(".component-card:visible").count(), 6);
  } finally {
    await page.close();
  }
});

test("layout and shared-element transitions change real content, recover focus and cancel on navigation", async () => {
  const page = await pageAt();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await specimen(page, "motion-flip");
    const first = await page.locator("[data-tile]").first().textContent();
    await page.locator("[data-reorder]").click();
    assert.notEqual(
      await page.locator("[data-tile]").first().textContent(),
      first,
    );
    assert.ok((await running(page)) > 0);
    await specimen(page, "motion-crossfade");
    await page.locator("[data-next]").click();
    await page.locator("[data-next]").click();
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll("[data-scene]")].filter(
          (scene) => !scene.hidden,
        ).length === 1,
    );
    assert.match(
      await page.locator("[data-scene]:visible").textContent(),
      /OCEAN/,
    );
    await specimen(page, "motion-shared-element");
    await page.locator("[data-open]").click();
    await page.waitForFunction(() =>
      document.activeElement?.hasAttribute("data-close"),
    );
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("[data-detail]").isVisible(), false);
    assert.equal(
      await page
        .locator("[data-open]")
        .evaluate((element) => document.activeElement === element),
      true,
    );
    await page.goto(base + "#/motion/foundations");
    await page.locator("[data-sample-id=motion-stagger] [data-replay]").click();
    await page.evaluate(() => {
      window.removedSample = document.querySelector(
        '[data-sample-id="motion-stagger"]',
      );
      window.removedAnimations = removedSample.getAnimations({ subtree: true });
    });
    await page.locator("[data-target=components] .category-button").click();
    assert.equal(await page.evaluate(() => removedSample.isConnected), false);
    assert.equal(
      await page.evaluate(() =>
        removedAnimations.every((animation) => animation.playState === "idle"),
      ),
      true,
    );
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test("scroll demos follow actual scroll and spatial controls support keyboard and reduced motion", async () => {
  const page = await pageAt();
  try {
    await specimen(page, "motion-scroll-progress");
    await page.locator(".reading-scroll").focus();
    await page.keyboard.press("End");
    await page.waitForFunction(
      () =>
        document
          .querySelector('[role="progressbar"]')
          .getAttribute("aria-valuenow") === "100",
    );
    assert.equal(
      await page.locator("[data-reading-output]").textContent(),
      "100%",
    );
    await page.locator(".reading-scroll").evaluate((element) => {
      element.style.height = "180px";
    });
    await page.waitForFunction(() => {
      const scroller = document.querySelector(".reading-scroll");
      return (
        Number(
          document
            .querySelector('[role="progressbar"]')
            .getAttribute("aria-valuenow"),
        ) ===
        Math.round(
          (scroller.scrollTop /
            (scroller.scrollHeight - scroller.clientHeight)) *
            100,
        )
      );
    });
    assert.ok(
      Number(
        await page
          .locator('[role="progressbar"]')
          .getAttribute("aria-valuenow"),
      ) < 100,
    );
    await specimen(page, "motion-scroll-reveal");
    await page.locator(".reveal-scroll").evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await page.waitForFunction(
      () => document.querySelectorAll(".is-revealed").length === 3,
    );
    await specimen(page, "motion-parallax");
    await page.locator(".parallax-scroll").evaluate((element) => {
      element.scrollTop = 150;
    });
    await page.waitForFunction(
      () =>
        document.querySelector("[data-depth]").style.transform !==
        "translateY(0px)",
    );
    const moved = await page
      .locator("[data-depth]")
      .first()
      .evaluate((element) => element.style.transform);
    assert.match(moved, /translateY/);
    await page.locator(".parallax-scroll").evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await page.waitForFunction(
      () =>
        document.querySelector("[data-depth='0.55']").style.transform ===
        "translateY(-55px)",
    );
    assert.equal(
      await page.locator("[data-depth]").evaluateAll((layers) => {
        const stage = document
          .querySelector(".parallax-stage")
          .getBoundingClientRect();
        return layers.every((layer) => {
          const bounds = layer.getBoundingClientRect();
          return bounds.bottom > stage.top && bounds.top < stage.bottom;
        });
      }),
      true,
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForFunction(
      () => document.querySelector("[data-depth]").style.transform === "",
    );
    await specimen(page, "motion-card-tilt");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.locator('[data-tilt="left"]').focus();
    await page.keyboard.press("Enter");
    assert.match(
      await page
        .locator("[data-tilt-card]")
        .evaluate((element) => element.style.transform),
      /-9deg/,
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForFunction(
      () => document.querySelector("[data-tilt-card]").style.transform === "",
    );
    await specimen(page, "motion-swipe-stack");
    await page.locator("[data-next]").click();
    assert.equal(
      await page.locator("[data-stack-count]").textContent(),
      "02 / 04",
    );
    await page.locator("[data-previous]").click();
    assert.equal(
      await page.locator("[data-stack-count]").textContent(),
      "01 / 04",
    );
    const card = await page.locator("[data-swipe-card]").boundingBox();
    const x = card.x + card.width / 2,
      y = card.y + card.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 60, y + 110, { steps: 6 });
    await page.mouse.up();
    assert.equal(
      await page.locator("[data-stack-count]").textContent(),
      "01 / 04",
    );
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x - 90, y, { steps: 6 });
    await page.mouse.up();
    assert.equal(
      await page.locator("[data-stack-count]").textContent(),
      "02 / 04",
    );
  } finally {
    await page.close();
  }
});

test("expressive motion can pause, replay and fold topics without leaving hidden animations", async () => {
  const page = await pageAt("#/motion/expressive?level=advanced");
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    const orbit = page.locator("[data-sample-id=motion-orbit]");
    await orbit.locator("[data-motion-play]").click();
    await orbit.locator("[data-motion-pause]").click();
    assert.equal(
      await orbit
        .locator("[data-orbit]")
        .evaluate((element) => element.getAnimations()[0].playState),
      "paused",
    );
    await orbit.locator("[data-motion-pause]").click();
    assert.equal(
      await orbit
        .locator("[data-orbit]")
        .evaluate((element) => element.getAnimations()[0].playState),
      "running",
    );
    await orbit.locator("[data-motion-play]").click();
    await page
      .locator("[data-sample-id=motion-gradient] [data-motion-play]")
      .click();
    assert.equal(
      await page
        .locator("[data-mesh]")
        .evaluate((element) => element.classList.contains("mesh-alternate")),
      true,
    );
    await page
      .locator("[data-sample-id=motion-success-burst] [data-motion-play]")
      .click();
    assert.equal(
      await page.locator("[data-success-label]").textContent(),
      "모두 완료했어요.",
    );
    await page.locator("#summary-content-motion-expressive").click();
    await page.waitForFunction(() =>
      [...document.querySelectorAll(".pattern-panel[hidden] .sample")].every(
        (root) =>
          root
            .getAnimations({ subtree: true })
            .every(
              (animation) =>
                !["running", "paused"].includes(animation.playState),
            ),
      ),
    );
    await page.locator("#summary-content-motion-expressive").click();
    assert.equal(await orbit.locator("[data-motion-pause]").isDisabled(), true);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

test("all eighteen added techniques remain functional with reduced motion and produce no running animation", async () => {
  const page = await pageAt();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    const definitions = await page.evaluate(() =>
      Object.values(ComponentModules)
        .flatMap((module) => CanvasCatalog.create().components(module))
        .filter((definition) => definition.id.startsWith("motion-")),
    );
    assert.equal(definitions.length, 18);
    assert.equal(
      definitions.filter((definition) => definition.level === "advanced")
        .length,
      9,
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const definition of definitions) {
      await specimen(page, definition.id);
      for (const control of await page
        .locator(".sample button:visible:not(:disabled)")
        .all()) {
        if (await control.isVisible()) await control.click();
      }
      assert.equal(await running(page), 0, definition.id);
    }
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createStaticServer } from "./support/static-server.mjs";
import { chromium } from "../design-compare/node_modules/playwright/index.mjs";
import { createHubServer } from "../design-compare/hub/server.js";
let browser, local, staticServer, bases;
before(async () => {
  local = createHubServer();
  staticServer = createStaticServer();
  await Promise.all(
    [local, staticServer].map(
      (server) =>
        new Promise((resolve) => server.listen(0, "127.0.0.1", resolve)),
    ),
  );
  bases = [local, staticServer].map(
    (server) => `http://127.0.0.1:${server.address().port}`,
  );
  browser = await chromium.launch();
});
after(async () => {
  await browser.close();
  await Promise.all(
    [local, staticServer].map(
      (server) => new Promise((resolve) => server.close(resolve)),
    ),
  );
});
for (const mode of [0, 1])
  test(`${mode ? "static" : "local"}: style selection → detail, search recovery, keyboard, history, clipboard, responsive`, async () => {
    const base = bases[mode];
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage(),
      errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.url().startsWith(base) && response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    await page.route("https://**/*", (route) => route.abort());
    try {
      await page.goto(`${base}/index.html`);
      await page.locator('[data-style="glassmorphism"]').focus();
      await page.keyboard.press("Enter");
      await page.waitForFunction(() =>
        document
          .querySelector("#stage-image")
          .src.endsWith("/glassmorphism.png"),
      );
      assert.equal(
        await page
          .locator('[data-style="glassmorphism"]')
          .getAttribute("aria-pressed"),
        "true",
      );
      await page.locator("#stage-link").click();
      await page
        .locator("#title")
        .filter({ hasText: "글래스모피즘" })
        .waitFor();
      await page.locator("#copy-link").click();
      assert.equal(
        await page.evaluate(() => navigator.clipboard.readText()),
        page.url(),
      );
      await page.locator("#show-guide").click();
      assert.equal(await page.locator("#guide-panel").isVisible(), true);
      await page.reload();
      await page.locator("#guide-panel").waitFor();
      await page.locator("#back").click();
      await page.locator(".design-card").first().waitFor();
      await page.locator("#query").fill("우주선엔진");
      await page
        .getByRole("button", { name: "전체 디자인 보기", exact: true })
        .waitFor();
      await page
        .getByRole("button", { name: "전체 디자인 보기", exact: true })
        .click();
      await page.waitForFunction(
        () => document.querySelectorAll(".design-card").length === 15,
      );
      assert.equal(await page.locator("#query").inputValue(), "");
      await page.locator("#query").fill("미니멀");
      await page.waitForFunction(
        () =>
          document.querySelector("main").getAttribute("aria-busy") ===
            "false" && location.hash.includes("q="),
      );
      await page.locator("#clear-search").click();
      await page.waitForFunction(
        () => document.querySelectorAll(".design-card").length === 15,
      );
      const card = page.locator(".design-card").nth(7),
        id = await card.getAttribute("data-id");
      await card.scrollIntoViewIfNeeded();
      const scroll = await page.evaluate(() => scrollY);
      await card.focus();
      await page.keyboard.press("Enter");
      await page.locator("#title").waitFor();
      await page.goBack();
      await page.waitForFunction(
        (id) => document.activeElement?.dataset.id === id,
        id,
      );
      assert.ok(Math.abs((await page.evaluate(() => scrollY)) - scroll) < 10);
      for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
          `library overflow ${width}`,
        );
        await page.goto(`${base}/index.html`);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
          `home overflow ${width}`,
        );
        assert.equal(
          await page.locator("#dh-global-nav .dh-nav-links").isVisible(),
          true,
        );
        assert.equal(
          await page.evaluate(() =>
            /\p{Emoji_Presentation}/u.test(document.body.innerText),
          ),
          false,
        );
        await page.goto(`${base}/design-library/`);
        await page.locator(".design-card").first().waitFor();
      }
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.locator(".design-card").first().click();
      await page.locator("#title").waitFor();
      assert.equal(
        await page
          .locator("#preview")
          .evaluate((node) => getComputedStyle(node).transitionDuration),
        "0s",
      );
      await page.locator("#mobile").click();
      assert.equal(
        await page.locator("#preview").evaluate((node) => node.clientWidth),
        390,
      );
      await page.locator("#back").click();
      await page.locator(".design-card").nth(1).click();
      await page.locator("#title").waitFor();
      await page.waitForFunction(
        () =>
          document.querySelector("main").getAttribute("aria-busy") === "false",
      );
      assert.equal(
        await page.locator("#desktop").getAttribute("aria-pressed"),
        "true",
      );
      await page.goto(`${base}/index.html`);
      await page.locator("#dh-lang-en").click();
      assert.equal(await page.locator("html").getAttribute("lang"), "en");
      assert.match(
        await page.locator(".hero-title").innerText(),
        /Great design starts here/,
      );
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  });

test("preview commits only the latest successful selection and preserves the visible state on failure", async () => {
  const page = await browser.newPage();
  try {
    let releaseGlass;
    const glassGate = new Promise((resolve) => {
      releaseGlass = resolve;
    });
    await page.route("**/previews/glassmorphism.png", async (route) => {
      await glassGate;
      await route.continue();
    });
    await page.route("**/previews/claymorphism.png", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.abort();
    });
    await page.goto(`${bases[0]}/index.html`, {
      waitUntil: "domcontentloaded",
    });
    await page.locator("[data-style=glassmorphism]").click();
    await page.locator("[data-style=claymorphism]").click();
    releaseGlass();
    await page.waitForFunction(
      () => document.querySelector("#stage-image").style.opacity === "1",
    );
    assert.equal(
      await page
        .locator("[data-style=flat-design]")
        .getAttribute("aria-pressed"),
      "true",
    );
    assert.match(
      await page.locator("#stage-link").getAttribute("href"),
      /flat-design$/,
    );
    await page.locator("[data-style=glassmorphism]").click();
    await page.waitForFunction(() =>
      document.querySelector("#stage-image").src.endsWith("glassmorphism.png"),
    );
    assert.equal(
      await page
        .locator("[data-style=glassmorphism]")
        .getAttribute("aria-pressed"),
      "true",
    );
    await page.locator("#dh-lang-en").click();
    await page.locator("#dh-lang-ko").click();
    assert.match(
      await page.locator(".hero-title").innerText(),
      /좋은 디자인의 시작/,
    );
    assert.match(
      await page.locator("#stage-image").getAttribute("alt"),
      /글래스/,
    );
  } finally {
    await page.close();
  }
});

test("trend collection continues the home shell across mobile and desktop", async () => {
  const page = await browser.newPage();
  const failures = [];
  page.on("response", (response) => {
    if (response.url().startsWith(bases[1]) && response.status() >= 400)
      failures.push(response.url());
  });
  try {
    await page.goto(`${bases[1]}/index.html`);
    const shell = () =>
      page.evaluate(() => ({
        background: getComputedStyle(document.body).backgroundColor,
        font: getComputedStyle(document.body).fontFamily,
        nav: getComputedStyle(document.querySelector("#dh-global-nav"))
          .borderRadius,
      }));
    const home = await shell();
    await page.locator(".hub-card").first().click();
    assert.equal(await page.locator(".grid .card").count(), 15);
    assert.deepEqual(await shell(), home);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        `trends overflow ${width}`,
      );
    }
    for (const image of await page.locator(".card-art img").all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((node) => node.decode());
    }
    await page.locator("#dh-lang-en").click();
    assert.match(
      await page.locator(".hero-title").innerText(),
      /Fifteen possibilities/,
    );
    assert.match(
      await page.locator(".card-desc").first().innerText(),
      /real-world objects/,
    );
    await page.locator("#dh-lang-ko").click();
    assert.match(await page.locator(".hero-title").innerText(), /열다섯 가지/);
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await page
        .locator(".card")
        .first()
        .evaluate((node) => getComputedStyle(node).transitionDuration),
      "0s",
    );
    await page.locator(".card").first().focus();
    await page.keyboard.press("Enter");
    await page.waitForURL("**/1_skeuomorphism.html");
    assert.deepEqual(failures, []);
  } finally {
    await page.close();
  }
});

test("spotlight rotates, pauses, and mood filters work within the collection", async () => {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });
  try {
    await page.goto(`${bases[1]}/trend-style/`);
    const active = page.locator("[data-slide]:visible h2");
    assert.equal(await active.innerText(), "Aurora UI");
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-slide-to="1"]')
          .getAttribute("aria-pressed") === "true",
      { timeout: 8000 },
    );
    assert.equal(await active.innerText(), "Glassmorphism");
    await page.locator(".carousel-play").click();
    await page.locator('[data-slide-to="2"]').click();
    assert.equal(await active.innerText(), "Claymorphism");
    await page.mouse.move(0, 0);
    await page.waitForTimeout(5200);
    assert.equal(await active.innerText(), "Claymorphism");
    await page.locator('[data-slide-to="3"]').focus();
    assert.equal(
      await page.locator(".carousel-play").getAttribute("aria-pressed"),
      "true",
    );
    await page.waitForTimeout(5200);
    assert.equal(await active.innerText(), "Claymorphism");
    await page.locator('[data-mood="minimal"]').click();
    assert.equal(await page.locator(".grid .card:visible").count(), 3);
    assert.equal(await page.locator(".collection-count").innerText(), "3 / 15");
    await page.locator('[data-mood="all"]').click();
    assert.equal(await page.locator(".grid .card:visible").count(), 15);
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await page.locator(".carousel-play").getAttribute("aria-pressed"),
      "true",
    );
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        `carousel overflow ${width}`,
      );
    }
    await page.screenshot({ path: "/tmp/trends-carousel.png", fullPage: true });
  } finally {
    await page.close();
  }
});

test("collection search combines with mood and recovers from empty results", async () => {
  const page = await browser.newPage();
  try {
    await page.goto(`${bases[1]}/trend-style/`);
    const search = page.locator("#style-search");
    await search.fill("GLASS");
    assert.equal(await page.locator(".grid .card:visible").count(), 1);
    await page.locator('[data-mood="minimal"]').click();
    assert.equal(await page.locator(".grid .card:visible").count(), 0);
    assert.equal(await page.locator(".collection-empty").isVisible(), true);
    await page.locator('[data-mood="all"]').click();
    assert.equal(await page.locator(".grid .card:visible").count(), 1);
    await search.fill("미니멀");
    assert.equal(await page.locator(".grid .card:visible").count(), 3);
    await search.fill("");
    assert.equal(await page.locator(".grid .card:visible").count(), 15);
    assert.equal(await page.locator(".collection-empty").isVisible(), false);
    await page.setViewportSize({ width: 320, height: 800 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
  } finally {
    await page.close();
  }
});

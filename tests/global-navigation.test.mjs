import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import {
  chromium,
  firefox,
  webkit,
} from "../design-compare/node_modules/playwright/index.mjs";
import { createStaticServer } from "./support/static-server.mjs";
import { createHubServer } from "../design-compare/hub/server.js";

let servers, bases;
before(async () => {
  servers = [
    createStaticServer({ prefix: "/design-home/" }),
    createHubServer(),
  ];
  await Promise.all(
    servers.map(
      (server) =>
        new Promise((resolve) => server.listen(0, "127.0.0.1", resolve)),
    ),
  );
  bases = servers.map(
    (server, i) =>
      `http://127.0.0.1:${server.address().port}/${i ? "" : "design-home/"}`,
  );
  await mkdir(".legacy-review/navigation", { recursive: true });
});
after(async () => {
  await Promise.all(
    servers.map((server) => new Promise((resolve) => server.close(resolve))),
  );
});

for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
  test(`${name}: disclosure keyboard, dismissal, localization, links and workspace return`, async () => {
    const browser = await engine.launch();
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (
        bases.some((base) => response.url().startsWith(base)) &&
        response.status() >= 400
      )
        errors.push(`${response.status()} ${response.url()}`);
    });
    await page.route("https://**/*", (route) => route.abort());
    page.setDefaultTimeout(7000);
    try {
      for (const base of bases) {
        await page.goto(base);
        const toggle = page.getByRole("button", {
          name: "Design Study",
          exact: true,
        });
        const panel = page.locator("#dh-study-panel");
        assert.equal(await panel.isVisible(), false);
        await page.keyboard.press("Tab");
        assert.equal(
          await page
            .locator("body > .skip-link")
            .evaluate((node) => node === document.activeElement),
          true,
        );
        assert.equal(
          await page.locator("body > .skip-link").evaluate((node) => {
            const rect = node.getBoundingClientRect();
            return node.contains(
              document.elementFromPoint(
                rect.x + rect.width / 2,
                rect.y + rect.height / 2,
              ),
            );
          }),
          true,
        );
        assert.equal(await page.locator(".dh-nav-links > li").count(), 2);
        assert.equal(
          await page
            .getByRole("link", { name: "트렌드 스타일", exact: true })
            .count(),
          0,
        );
        await toggle.focus();
        await page.keyboard.press("Enter");
        assert.equal(await toggle.getAttribute("aria-expanded"), "true");
        await page.keyboard.press("Tab");
        assert.equal(
          await page.evaluate(() => document.activeElement.textContent.trim()),
          "트렌드 스타일",
        );
        await page.keyboard.press("Escape");
        assert.equal(await panel.isVisible(), false);
        assert.equal(
          await toggle.evaluate((node) => node === document.activeElement),
          true,
        );
        await page.keyboard.press("Space");
        for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
        assert.equal(
          await page.evaluate(() => document.activeElement.textContent.trim()),
          "용어집",
        );
        await page.keyboard.press("Tab");
        assert.equal(
          await page.evaluate(() => document.activeElement.textContent.trim()),
          "Design Library",
        );
        await page.locator(".hero-actions .btn-primary").focus();
        assert.equal(await panel.isVisible(), false);
        await toggle.click();
        await page.locator(".hero-subtitle").click();
        assert.equal(await panel.isVisible(), false);
        await toggle.click();
        await page.locator("#dh-lang-en").click();
        assert.equal(await panel.isVisible(), false);
        await toggle.click();
        assert.equal(
          await page
            .getByRole("link", { name: "Trend Styles", exact: true })
            .isVisible(),
          true,
        );
        await page.getByRole("link", { name: "Glossary", exact: true }).click();
        await page.waitForURL("**/glossary/index.html");
        await page.locator("#category-ui").waitFor();
        assert.equal(
          await page
            .locator(".dh-study-toggle")
            .evaluate((node) => node.classList.contains("active")),
          true,
        );
        assert.equal(
          await page.locator(".dh-study-link[aria-current=page]").innerText(),
          "Glossary",
        );
        await page.locator("#dh-study-toggle").click();
        await page.getByRole("link", { name: "Patterns", exact: true }).click();
        await page.waitForURL("**/ui-components/index.html");
        await page.locator("#dh-study-toggle").click();
        await page
          .getByRole("link", { name: "Libraries", exact: true })
          .click();
        await page.waitForURL("**/libraries/index.html");
        await page.locator("#dh-study-toggle").click();
        await page
          .getByRole("link", { name: "Trend Styles", exact: true })
          .click();
        await page.waitForURL("**/trend-style/index.html");
        await page.locator("#dh-study-toggle").click();
        await page
          .getByRole("link", { name: "Design Library", exact: true })
          .click();
        await page.waitForURL("**/design-library/**");
        await page.locator(".design-card").first().waitFor();
        assert.equal(
          await page.locator(".dh-nav-link[aria-current=page]").innerText(),
          "Design Library",
        );
        const headers = await page.evaluate(() => ({
          global: document
            .querySelector("#dh-global-nav")
            .getBoundingClientRect().bottom,
          app: document.querySelector(".app-header").getBoundingClientRect()
            .top,
        }));
        assert.ok(headers.app >= headers.global);
        await page.locator("#dh-study-toggle").click();
        await page
          .getByRole("link", { name: "Trend Styles", exact: true })
          .click();
        await page.waitForURL("**/trend-style/index.html");
        await page.goBack();
        await page.locator(".design-card").first().waitFor();
        assert.equal(await page.locator("#dh-study-panel").isVisible(), false);
        await page.locator(".dh-brand").click();
        await page.waitForURL("**/index.html");
        assert.equal(
          await page.locator(".dh-brand").getAttribute("aria-current"),
          "page",
        );
        await page.locator("#dh-lang-ko").click();
      }
      assert.deepEqual(errors, []);
    } catch (error) {
      console.log(name, "failure at", page.url(), errors);
      await page.screenshot({
        animations: "disabled",
        path: `.legacy-review/navigation/${name}-failure.png`,
      });
      throw error;
    } finally {
      await browser.close();
    }
  });

  test(`${name}: touch, reflow, short viewport, focus and visual bounds`, async () => {
    const browser = await engine.launch();
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(7000);
    await page.route("https://**/*", (route) => route.abort());
    try {
      for (const route of [
        "",
        "trend-style/index.html",
        "ui-components/index.html",
        "libraries/index.html",
        "glossary/index.html",
        "design-library/",
      ]) {
        await page.goto(`${bases[0]}${route}`);
        for (const [width, height] of [
          [320, 568],
          [390, 844],
          [640, 900],
          [768, 900],
          [1440, 1000],
          [568, 320],
        ]) {
          await page.setViewportSize({ width, height });
          const toggle = page.locator("#dh-study-toggle");
          await toggle.tap();
          const panel = page.locator("#dh-study-panel");
          assert.equal(await panel.isVisible(), true);
          const bounds = await page.evaluate(() => {
            const panel = document.querySelector("#dh-study-panel");
            const rect = panel.getBoundingClientRect();
            const links = [...panel.querySelectorAll("a")].map((node) =>
              node.getBoundingClientRect(),
            );
            const controls = [
              ...document.querySelectorAll(
                "#dh-global-nav > .dh-nav-links .dh-nav-link, .dh-brand, .dh-lang-btn",
              ),
            ].map((node) => node.getBoundingClientRect());
            return {
              left: rect.left,
              right: rect.right,
              bottom: rect.bottom,
              width: innerWidth,
              height: innerHeight,
              targets: [...links, ...controls].every(
                (rect) => rect.width >= 24 && rect.height >= 24,
              ),
              clipped: document.documentElement.scrollWidth > innerWidth,
            };
          });
          assert.ok(
            bounds.left >= 0 &&
              bounds.right <= bounds.width &&
              bounds.bottom <= bounds.height,
            `${route}: ${JSON.stringify(bounds)}`,
          );
          assert.equal(bounds.targets, true);
          if (height === 320) {
            await panel.locator("a").last().focus();
            await page.waitForFunction(() => {
              const node = document.querySelector("#dh-study-panel");
              const link = node
                .querySelector("li:last-child a")
                .getBoundingClientRect();
              const rect = node.getBoundingClientRect();
              return link.top >= rect.top - 1 && link.bottom <= rect.bottom + 1;
            });
          }
          assert.equal(bounds.clipped, false, `${route} overflow ${width}`);
          if (
            ["", "design-library/"].includes(route) &&
            [390, 1440].includes(width)
          ) {
            await page.screenshot({
              animations: "disabled",
              path: `.legacy-review/navigation/${name}-${route ? "workspace" : "home"}-${width}.png`,
            });
          }
          await toggle.tap();
          assert.equal(await panel.isVisible(), false);
        }
      }
      await page.emulateMedia({
        reducedMotion: "reduce",
        forcedColors: "active",
      });
      await page.locator("#dh-study-toggle").click();
      assert.equal(
        await page
          .locator(".dh-disclosure-caret")
          .evaluate((node) => getComputedStyle(node).transitionDuration),
        "0s",
      );
      await page.locator("#dh-study-toggle").press("Escape");
    } finally {
      await browser.close();
    }
  });
}

test("theme preference follows the system and persists explicit choices", async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();
  page.setDefaultTimeout(7000);
  await page.route("https://**/*", (route) => route.abort());
  try {
    await page.goto(bases[0]);
    await page.locator("#dh-theme-select").waitFor();
    assert.equal(await page.locator("html").getAttribute("data-theme"), null);
    assert.equal(await page.locator("#dh-theme-select").inputValue(), "system");
    assert.equal(
      await page.evaluate(() => getComputedStyle(document.body).backgroundColor),
      "rgb(22, 22, 24)",
    );

    await page.locator("#dh-theme-select").selectOption("light");
    assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
    assert.equal(
      await page.evaluate(() => localStorage.getItem("dh_theme")),
      "light",
    );
    await page.reload();
    assert.equal(await page.locator("#dh-theme-select").inputValue(), "light");

    await page.locator("#dh-theme-select").selectOption("system");
    assert.equal(await page.locator("html").getAttribute("data-theme"), null);
    await page.emulateMedia({ colorScheme: "light" });
    await page.waitForFunction(
      () => getComputedStyle(document.body).backgroundColor === "rgb(245, 245, 247)",
    );
    await page.locator("#dh-theme-select").selectOption("dark");
    await page.emulateMedia({ colorScheme: "light" });
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  } finally {
    await browser.close();
  }
});

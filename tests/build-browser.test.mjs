import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { build, preview } from "vite";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

let browser;
let prefixOutput;
let root;
const browserErrors = [];

before(async () => {
  root = fileURLToPath(new URL("../", import.meta.url));
  prefixOutput = await mkdtemp(join(tmpdir(), "dh-vite-prefix-"));
  await build({
    root,
    configFile: resolve(root, "vite.config.js"),
    base: "/deploy/",
    logLevel: "error",
    build: { outDir: prefixOutput, emptyOutDir: true },
  });
  browser = await chromium.launch({ headless: true });
});

after(async () => {
  await browser?.close();
  if (prefixOutput) await rm(prefixOutput, { recursive: true, force: true });
});

test("built learning pages load, preserve interactions, and resolve under a deployment prefix", async () => {
  const routes = [
    "",
    "ui-components/index.html",
    "glossary/index.html",
    "libraries/index.html",
    "design-library/index.html#/trends",
    "trend-style/index.html",
    "trend-style/8_aurora_ui.html",
  ];

  for (const target of [
    { name: "root build", outDir: resolve(root, "dist"), base: "/" },
    { name: "prefix build", outDir: prefixOutput, base: "/deploy/" },
  ]) {
    const server = await preview({
      root,
      configFile: resolve(root, "vite.config.js"),
      base: target.base,
      logLevel: "error",
      build: { outDir: target.outDir },
      preview: { host: "127.0.0.1", port: 0 },
    });
    const base = `http://127.0.0.1:${server.httpServer.address().port}${target.base}`;
    const page = await browser.newPage();
    await page.route(/https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
    page.on("pageerror", (error) =>
      browserErrors.push(`${target.name} pageerror ${page.url()}: ${error.message}`),
    );
    page.on("response", (response) => {
      if (response.url().startsWith(base) && response.status() >= 400) {
        browserErrors.push(`${target.name} HTTP ${response.status()} ${response.url()}`);
      }
    });

    try {
      for (const route of routes) {
        await page.goto(new URL(route, base).href, { waitUntil: "networkidle" });

        if (route === "ui-components/index.html") {
          await page.locator("#search-input").fill("GNB");
          assert.ok((await page.locator(".component-card").count()) > 0);
        }
        if (route === "glossary/index.html") {
          assert.ok(Number(await page.locator("#term-count").textContent()) > 0);
        }
        if (route === "libraries/index.html") {
          await page.locator("#summary-library-motion").click();
          assert.equal(
            await page.locator("#summary-library-motion").getAttribute("aria-expanded"),
            "true",
          );
        }
        if (route === "design-library/index.html#/trends") {
          assert.ok((await page.locator(".design-card").count()) > 0);
          await page.locator("#query").fill("glass");
          await page.locator(".design-card").first().waitFor();
          assert.ok((await page.locator(".design-card").count()) > 0);
        }
        if (route === "trend-style/8_aurora_ui.html") {
          assert.equal(await page.locator(".drag-handle-hint").count(), 1);
        }
      }
    } finally {
      await page.close();
      await new Promise((resolve) => server.httpServer.close(resolve));
    }
  }

  assert.deepEqual(browserErrors, []);
});

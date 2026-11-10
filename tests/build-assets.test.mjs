import { test } from "node:test";
import assert from "node:assert/strict";
import {
  collectStaticSiteAssets,
  collectStaticSitePages,
} from "../scripts/site-build/static-site-assets.mjs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

test("production inputs include all learning and legacy pages for Vite multi-page processing", async () => {
  const fileNames = new Set((await collectStaticSitePages(root)).map((page) => page.fileName));

  for (const requiredFile of [
    "index.html",
    "trend-style/index.html",
    "trend-style/15_micro_interaction.html",
    "ui-components/index.html",
    "glossary/index.html",
    "libraries/index.html",
    "design-library/index.html",
  ]) {
    assert.ok(fileNames.has(requiredFile), `missing ${requiredFile}`);
  }
  assert.equal(
    [...fileNames].filter(
      (fileName) => fileName.startsWith("trend-style/") && fileName.endsWith(".html"),
    ).length,
    16,
  );
});

test("production asset inventory preserves catalog data and classic script files", async () => {
  const fileNames = new Set((await collectStaticSiteAssets(root)).map((asset) => asset.fileName));

  for (const requiredFile of [
    "design-library/data/catalog.json",
    "ui-components/js/catalog.js",
    "shared/js/global-nav.js",
    "design-compare/hub/web/app.js",
    "design-compare/src/library/query.js",
    "design-compare/src/library/facets.js",
    "design-compare/src/library/tags.js",
  ]) {
    assert.ok(fileNames.has(requiredFile), `missing ${requiredFile}`);
  }
});

test("production asset inventory excludes workspace and tool data", async () => {
  const fileNames = (await collectStaticSiteAssets(root)).map((asset) => asset.fileName);

  for (const excludedPrefix of [
    ".git/",
    "node_modules/",
    "design-compare/node_modules/",
    "tests/",
    "scripts/",
  ]) {
    assert.equal(
      fileNames.some((fileName) => fileName.startsWith(excludedPrefix)),
      false,
      excludedPrefix,
    );
  }
});

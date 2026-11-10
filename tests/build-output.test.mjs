import { test } from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const outputRoot = join(root, "dist");

test("built site contains every learning page and the static catalog modules", async () => {
  for (const fileName of [
    "index.html",
    "trend-style/15_micro_interaction.html",
    "ui-components/index.html",
    "glossary/index.html",
    "libraries/index.html",
    "design-library/index.html",
    "design-library/data/catalog.json",
    "design-compare/src/library/query.js",
  ]) {
    await access(join(outputRoot, fileName));
  }
});

test("built site keeps classic global-registration scripts and excludes workspace data", async () => {
  for (const fileName of ["ui-components/js/catalog.js", "shared/js/global-nav.js"]) {
    assert.deepEqual(
      await readFile(join(outputRoot, fileName)),
      await readFile(join(root, fileName)),
      `${fileName} should retain its classic script registration and execution order`,
    );
  }

  await assert.rejects(access(join(outputRoot, "package.json")));
  await assert.rejects(access(join(outputRoot, ".git")));
});

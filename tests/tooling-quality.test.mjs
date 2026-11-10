import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { unitTestFiles } from "../scripts/quality/test-unit.mjs";

test("unit test group contains Node-only tests", async () => {
  assert.ok(unitTestFiles.length > 0);

  for (const file of unitTestFiles) {
    const source = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /from\s+["']playwright["']/u, `${file} imports Playwright`);
    assert.match(source, /\btest\s*\(/u, `${file} does not register a Node test`);
  }
});

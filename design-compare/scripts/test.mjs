import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const suites = [
  [resolve(root, "tests"), ".test.js"],
  [resolve(root, "../tests"), ".test.mjs"],
];
const files = suites.flatMap(([directory, suffix]) =>
  readdirSync(directory)
    .filter((name) => name.endsWith(suffix))
    .sort()
    .map((name) => resolve(directory, name)),
);
// Browser engines share the CI runner; serialize files to avoid starving actionability frames.
const concurrency = process.env.CI ? 1 : 4;
const result = spawnSync(
  process.execPath,
  ["--test", `--test-concurrency=${concurrency}`, ...files],
  {
    cwd: root,
    stdio: "inherit",
  },
);
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;

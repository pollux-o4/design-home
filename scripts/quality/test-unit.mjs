import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

export const unitTestFiles = [
  "tests/build-assets.test.mjs",
  "tests/design-system-audit.test.mjs",
  "tests/pattern-navigation-state.test.mjs",
  "tests/sample-lifecycle.test.mjs",
  "tests/tooling-security.test.mjs",
  "tests/tooling-quality.test.mjs",
  "design-compare/tests/application.test.js",
  "design-compare/tests/capture-catalog.test.js",
  "design-compare/tests/contracts.test.js",
  "design-compare/tests/hub.test.js",
  "design-compare/tests/library-source.test.js",
  "design-compare/tests/library.test.js",
  "design-compare/tests/module-boundaries.test.js",
  "design-compare/tests/reporting.test.js",
];

const root = fileURLToPath(new URL("../../", import.meta.url));
const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";

if (import.meta.url === invokedPath) {
  const comparePrefix = "design-compare/tests/";
  const rootFiles = unitTestFiles.filter((file) => !file.startsWith(comparePrefix));
  const compareFiles = unitTestFiles
    .filter((file) => file.startsWith(comparePrefix))
    .map((file) => `tests/${file.slice(comparePrefix.length)}`);
  const groups = [
    { cwd: root, files: rootFiles },
    { cwd: fileURLToPath(new URL("../../design-compare/", import.meta.url)), files: compareFiles },
  ];

  process.exitCode = 0;
  for (const { cwd, files } of groups) {
    for (const file of files) {
      const result = spawnSync(process.execPath, ["--test", "--test-concurrency=4", file], {
        cwd,
        stdio: "inherit",
      });

      if (result.error) {
        console.error(result.error.message);
        process.exitCode = 1;
      } else if (result.status !== 0) {
        process.exitCode = result.status ?? 1;
      }
    }
  }
}

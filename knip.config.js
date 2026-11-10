import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  ".legacy-review",
  ".design-compare",
  "dist",
  "node_modules",
  "design-compare",
  "impeccable",
  "mengto-skills",
]);

async function htmlFiles(directory, excludedDirectories = ignoredDirectories) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!excludedDirectories.has(entry.name)) {
        files.push(...(await htmlFiles(path.join(directory, entry.name), excludedDirectories)));
      }
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(path.join(directory, entry.name));
    }
  }

  return files;
}

async function browserScriptEntries(directory, excludedDirectories = ignoredDirectories) {
  const htmlPaths = await htmlFiles(directory, excludedDirectories);
  const entries = new Set();

  for (const htmlPath of htmlPaths) {
    const source = await readFile(htmlPath, "utf8");
    for (const [, , src] of source.matchAll(/<script\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/giu)) {
      if (/^(?:[a-z]+:)?\/\//iu.test(src) || src.startsWith("data:")) continue;
      const localPath = src.startsWith("/") ? src.slice(1) : src;
      const resolved = path.resolve(path.dirname(htmlPath), localPath);
      const relative = path.relative(directory, resolved);
      if (!relative.startsWith("..") && !path.isAbsolute(relative)) {
        entries.add(relative.split(path.sep).join("/"));
      }
    }
  }

  return [...entries];
}

const rootBrowserEntries = await browserScriptEntries(
  root,
  new Set([...ignoredDirectories, "design-compare"]),
);

export default {
  workspaces: {
    ".": {
      entry: [
        ...rootBrowserEntries,
        // The cross-workspace browser import is not connected through the root HTML graph.
        "shared/js/clipboard.js",
        // Browser tests load this public module through an absolute site URL.
        "shared/js/design-system-audit.js",
        "tests/**/*.test.mjs",
        "scripts/quality/*.mjs",
      ],
      project: [
        "**/*.{js,mjs,cjs}",
        "!impeccable/**",
        "!mengto-skills/**",
        "!design-compare/src/**",
        "!design-compare/tests/**",
        "!design-compare/scripts/**",
        "!design-compare/demo/**",
        "!design-compare/hub/api.js",
        "!design-compare/hub/server.js",
        "!design-library/data/**",
        "!design-compare/dist/**",
        "!design-compare/.design-compare/**",
      ],
      ignoreUnresolved: [
        "/shared/js/design-system-audit.js",
        "/ui-components/js/canvas-renderer.js",
      ],
    },
    "design-compare": {
      entry: ["tests/**/*.test.js"],
      project: ["**/*.{js,mjs,cjs}", "!hub/web/**", "!dist/**", "!.design-compare/**"],
      ignoreExportsUsedInFile: true,
      // These modules are preserved as documented imports for downstream consumers.
      ignoreIssues: {
        "src/application.js": ["exports"],
        "src/capture/index.js": ["exports"],
        "src/catalog/index.js": ["exports"],
      },
    },
  },
};

import { lstat, readdir, readFile } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

const publicExtensions = new Set([".css", ".js", ".json", ".md", ".png", ".svg"]);
const publicTrees = [
  "assets",
  "design-home-library",
  "design-library",
  "design-compare/hub/web",
  "design-compare/src/library",
  "glossary",
  "libraries",
  "shared",
  "trend-style",
  "ui-components",
];

async function visitDirectory(root, directory, files, { htmlOnly = false } = {}) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const absolutePath = join(directory, entry.name);
    const metadata = await lstat(absolutePath);
    if (metadata.isSymbolicLink()) continue;

    if (metadata.isDirectory()) {
      await visitDirectory(root, absolutePath, files, { htmlOnly });
    } else if (metadata.isFile()) {
      if (htmlOnly !== entry.name.endsWith(".html")) continue;
      if (!htmlOnly && !publicExtensions.has(entry.name.slice(entry.name.lastIndexOf("."))))
        continue;
      files.push({
        fileName: relative(root, absolutePath).split(sep).join("/"),
        absolutePath,
        ...(htmlOnly ? {} : { source: await readFile(absolutePath) }),
      });
    }
  }
}

export async function collectStaticSiteAssets(projectRoot) {
  const root = resolve(projectRoot);
  const files = [];

  for (const tree of publicTrees) {
    await visitDirectory(root, resolve(root, tree), files);
  }

  files.sort((left, right) => left.fileName.localeCompare(right.fileName));
  return files;
}

export async function collectStaticSitePages(projectRoot) {
  const root = resolve(projectRoot);
  const pages = [{ fileName: "index.html", absolutePath: resolve(root, "index.html") }];

  for (const tree of publicTrees) {
    await visitDirectory(root, resolve(root, tree), pages, { htmlOnly: true });
  }

  pages.sort((left, right) => left.fileName.localeCompare(right.fileName));
  return pages;
}

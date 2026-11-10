#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const defaultRepo = resolve(import.meta.dirname, "../..");
const biomeCli = fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome"));
const supportedExtensions = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsonc",
  ".jsx",
  ".mjs",
  ".md",
  ".yaml",
  ".yml",
  ".ts",
  ".tsx",
]);

function run(repo, command, args, options = {}) {
  return spawnSync(command, args, { cwd: repo, ...options });
}

export function checkStagedBiome(repo = defaultRepo) {
  repo = resolve(repo);
  const list = run(
    repo,
    "git",
    ["diff", "--cached", "--name-only", "-z", "--diff-filter=ACMRTUXB"],
    {
      encoding: "utf8",
    },
  );
  if (list.status !== 0) throw new Error("Could not identify staged files.");

  let failed = false;
  for (const path of list.stdout.split("\0").filter(Boolean)) {
    if (!supportedExtensions.has(resolveExtension(path))) continue;
    const content = run(repo, "git", ["show", `:${path}`], { encoding: "buffer" });
    if (content.status !== 0) {
      process.stderr.write(`Could not read staged file: ${path}\n`);
      failed = true;
      continue;
    }
    const result = run(
      repo,
      process.execPath,
      [biomeCli, "check", "--write", "--no-errors-on-unmatched", "--stdin-file-path", path],
      {
        input: content.stdout,
        encoding: "buffer",
      },
    );
    if (result.status === null || result.status !== 0) {
      process.stderr.write(`Biome rejected staged file: ${path}\n`);
      failed = true;
    } else if (!result.stdout.equals(content.stdout)) {
      process.stderr.write(`Staged file needs formatting: ${path}\n`);
      failed = true;
    }
  }
  return failed;
}

function resolveExtension(path) {
  return path.slice(path.lastIndexOf(".")).toLowerCase();
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  try {
    process.exitCode = checkStagedBiome(
      process.env.SECURITY_REPO ? resolve(process.env.SECURITY_REPO) : defaultRepo,
    )
      ? 1
      : 0;
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

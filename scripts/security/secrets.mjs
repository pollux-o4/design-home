#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const defaultRepo = resolve(import.meta.dirname, "../..");

function run(repo, command, args, options = {}) {
  return spawnSync(command, args, { cwd: repo, encoding: "utf8", ...options });
}

function fail(message, detail = "") {
  const error = new Error(`${message}${detail ? `\n${detail.trim()}` : ""}`);
  error.securityFailure = true;
  throw error;
}

function gitleaks(repo, args) {
  const result = run(repo, "gitleaks", [
    ...args,
    "--config",
    join(repo, ".gitleaks.toml"),
    "--redact",
    "--no-banner",
  ]);
  if (result.status === null)
    fail("Gitleaks could not start. Install the pinned tools with mise.", result.error?.message);
  if (result.status !== 0)
    fail("Gitleaks detected a secret or could not complete the scan.", result.stderr);
}

function scanStaged(repo) {
  const staged = run(repo, "git", ["ls-files", "--stage", "-z"]);
  if (staged.status !== 0) fail("Could not read the Git index.", staged.stderr);

  const entries = staged.stdout
    .split("\0")
    .filter(Boolean)
    .map((entry) => {
      const match = entry.match(/^(\d+) ([0-9a-f]+) (\d+)\t([\s\S]*)$/);
      if (!match) return { invalid: entry };
      return { mode: match[1], object: match[2], stage: match[3], path: match[4] };
    });
  if (entries.some(({ stage, invalid }) => invalid || stage !== "0")) {
    fail("Cannot scan staged changes while the Git index has conflicts or unsupported entries.");
  }
  const changed = run(repo, "git", [
    "diff",
    "--cached",
    "--name-only",
    "-z",
    "--diff-filter=ACMRTUXB",
  ]);
  if (changed.status !== 0) fail("Could not identify staged changes.", changed.stderr);
  const changedPaths = new Set(changed.stdout.split("\0").filter(Boolean));
  const blobs = entries.filter(({ path }) => changedPaths.has(path));
  if (blobs.length === 0) return;

  const root = mkdtempSync(join(tmpdir(), "design-home-secrets-"));
  try {
    for (const { mode: fileMode, object, path } of blobs) {
      const blob = run(repo, "git", ["cat-file", "blob", object], { encoding: "buffer" });
      if (blob.status !== 0)
        fail("Could not read a staged file from the Git index.", blob.stderr?.toString());
      const destination = join(root, path);
      mkdirSync(resolve(destination, ".."), { recursive: true });
      writeFileSync(destination, blob.stdout, { mode: fileMode === "100755" ? 0o755 : 0o644 });
    }
    gitleaks(repo, ["dir", root]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function scanPush(repo, rawInput) {
  const input = rawInput.trim();
  if (!input) return;
  const lines = input.split(/\r?\n/);
  const zero = /^0+$/;
  for (const line of lines) {
    const [localRef, localSha, remoteRef, remoteSha] = line.trim().split(/\s+/);
    const validSha = (value) => /^[0-9a-f]{40}$|^[0-9a-f]{64}$/u.test(value) || zero.test(value);
    if (!localRef || !remoteRef || !validSha(localSha) || !validSha(remoteSha)) {
      fail("Could not parse Git pre-push refs; refusing to skip the outgoing secret scan.");
    }
    if (zero.test(localSha)) continue;
    // Git sends an all-zero remote oid for a new branch or tag. Its destination
    // may not share history with any configured remote, so scan all local history.
    const opts = zero.test(remoteSha) ? localSha : `${remoteSha}..${localSha}`;
    gitleaks(repo, ["git", "--log-opts", opts]);
  }
}

export function runSecurityScan(mode, { repo = defaultRepo, pushInput = "" } = {}) {
  repo = resolve(repo);
  switch (mode) {
    case "full":
      gitleaks(repo, ["git"]);
      break;
    case "staged":
      scanStaged(repo);
      break;
    case "push":
      scanPush(repo, pushInput);
      break;
    default:
      fail("Usage: node scripts/security/secrets.mjs <full|staged|push>");
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  try {
    const mode = process.argv[2];
    runSecurityScan(mode, { pushInput: mode === "push" ? readFileSync(0, "utf8") : "" });
  } catch (error) {
    if (!error?.securityFailure) throw error;
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

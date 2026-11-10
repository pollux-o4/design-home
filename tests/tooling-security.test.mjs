import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { runSecurityScan } from "../scripts/security/secrets.mjs";
import { checkStagedBiome } from "../scripts/security/staged-biome.mjs";

const repoRoot = resolve(import.meta.dirname, "..");
const leak = ["glpat-", "01234567890123456789"].join("");
const password = ["Sunset", "Cobalt", "Lantern", "47!"].join("-");

function git(cwd, ...args) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "design-home-security-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  git(root, "init", "-q");
  git(root, "config", "user.email", "security-test@example.invalid");
  git(root, "config", "user.name", "Security Test");
  writeFileSync(join(root, "mise.toml"), '[tools]\ngitleaks = "8.30.1"\n');
  writeFileSync(join(root, ".gitleaks.toml"), readFileSync(join(repoRoot, ".gitleaks.toml")));
  writeFileSync(join(root, "biome.jsonc"), readFileSync(join(repoRoot, "biome.jsonc")));
  writeFileSync(join(root, "readme.txt"), "safe baseline\n");
  git(root, "add", ".");
  git(root, "commit", "-qm", "baseline");
  return root;
}

function scan(root, mode, stdin = "") {
  try {
    runSecurityScan(mode, { repo: root, pushInput: stdin });
    return { status: 0, stdout: "", stderr: "" };
  } catch (error) {
    if (!error?.securityFailure) throw error;
    return { status: 1, stdout: "", stderr: error.message };
  }
}

test("tool_001: staged secret scanning blocks leaks and accepts safe staged content", (t) => {
  const root = fixture(t);
  writeFileSync(join(root, "safe.txt"), "new safe content\n");
  git(root, "add", "safe.txt");
  assert.equal(scan(root, "staged").status, 0);

  writeFileSync(join(root, "credential.txt"), `token=${leak}\n`);
  git(root, "add", "credential.txt");
  const result = scan(root, "staged");
  assert.equal(result.status, 1, result.stderr);
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, new RegExp(leak, "u"));

  git(root, "restore", "--staged", "credential.txt");
  writeFileSync(join(root, "password.txt"), `PASSWORD=${password}\n`);
  git(root, "add", "password.txt");
  const passwordResult = scan(root, "staged");
  assert.equal(passwordResult.status, 1, passwordResult.stderr);
  assert.doesNotMatch(
    `${passwordResult.stdout}${passwordResult.stderr}`,
    new RegExp(password, "u"),
  );
});

test("staged secret scanning reads the index when the worktree differs", (t) => {
  const root = fixture(t);
  writeFileSync(join(root, "partial.txt"), `token=${leak}\n`);
  git(root, "add", "partial.txt");
  writeFileSync(join(root, "partial.txt"), "safe unstaged replacement\n");

  const result = scan(root, "staged");
  assert.equal(result.status, 1, result.stderr);
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, new RegExp(leak, "u"));
});

test("staged Biome accepts formatted content and checks the index only", (t) => {
  const root = fixture(t);
  writeFileSync(join(root, "staged.js"), "const value = 1;\n");
  git(root, "add", "staged.js");
  assert.equal(checkStagedBiome(root), false);

  writeFileSync(join(root, "staged.js"), "const value = 1;\n  ");
  assert.equal(checkStagedBiome(root), false);
  assert.equal(readFileSync(join(root, "staged.js"), "utf8"), "const value = 1;\n  ");

  writeFileSync(join(root, "staged.js"), "const value=1\n");
  git(root, "add", "staged.js");
  assert.equal(checkStagedBiome(root), true);
  assert.equal(readFileSync(join(root, "staged.js"), "utf8"), "const value=1\n");
});

test("outgoing range scanning blocks new leaks and accepts safe commits", (t) => {
  const root = fixture(t);
  const base = git(root, "rev-parse", "HEAD");
  writeFileSync(join(root, "safe-change.txt"), "safe change\n");
  git(root, "add", "safe-change.txt");
  git(root, "commit", "-qm", "safe change");
  let head = git(root, "rev-parse", "HEAD");
  let stdin = `refs/heads/topic ${head} refs/heads/topic ${base}\n`;
  assert.equal(scan(root, "push", stdin).status, 0);

  writeFileSync(join(root, "credential.txt"), `token=${leak}\n`);
  git(root, "add", "credential.txt");
  git(root, "commit", "-qm", "add credential");
  head = git(root, "rev-parse", "HEAD");
  stdin = `refs/heads/topic ${head} refs/heads/topic ${base}\n`;
  const result = scan(root, "push", stdin);
  assert.equal(result.status, 1, result.stderr);
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, new RegExp(leak, "u"));
});

test("new branch and tag pushes scan commits absent from remote refs", (t) => {
  const root = fixture(t);
  writeFileSync(join(root, "credential.txt"), `token=${leak}\n`);
  git(root, "add", "credential.txt");
  git(root, "commit", "-qm", "add credential");
  const head = git(root, "rev-parse", "HEAD");
  const zero = "0".repeat(40);

  const newBranch = scan(root, "push", `refs/heads/new ${head} refs/heads/new ${zero}\n`);
  assert.equal(newBranch.status, 1, newBranch.stderr);
  assert.doesNotMatch(`${newBranch.stdout}${newBranch.stderr}`, new RegExp(leak, "u"));

  git(root, "update-ref", "refs/remotes/backup/secret", head);
  const newRemote = scan(root, "push", `refs/heads/new ${head} refs/heads/new ${zero}\n`);
  assert.equal(newRemote.status, 1, newRemote.stderr);
  assert.doesNotMatch(`${newRemote.stdout}${newRemote.stderr}`, new RegExp(leak, "u"));

  const tagPush = scan(root, "push", `refs/tags/v1 ${head} refs/tags/v1 ${zero}\n`);
  assert.equal(tagPush.status, 1, tagPush.stderr);
  assert.doesNotMatch(`${tagPush.stdout}${tagPush.stderr}`, new RegExp(leak, "u"));
});

test("tool_001: staged workflow YAML is checked without rewriting files", (t) => {
  for (const name of ["pipeline.yaml", "pipeline.yml"]) {
    const root = fixture(t);
    writeFileSync(join(root, name), "name: CI\n");
    git(root, "add", name);
    assert.equal(checkStagedBiome(root), false);
    writeFileSync(join(root, name), "name:    CI\n");
    git(root, "add", name);
    assert.equal(checkStagedBiome(root), true);
    assert.equal(readFileSync(join(root, name), "utf8"), "name:    CI\n");
  }
});

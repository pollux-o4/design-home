import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { chromium } from "playwright";
import { createDemoServer } from "../demo/server.js";
import { renderReport } from "../src/reporting/index.js";
import { capture } from "../src/capture/index.js";

const run = promisify(execFile);
let server, url, store, baseline, drift;
const selector = '[data-design-id="box-art"]';
const parts = [
  "--part",
  'title=[data-part="title"]',
  "--part",
  'description=[data-part="description"]',
  "--part",
  'action=[data-part="action"]',
];
async function cli(args, expected = 0, details = true) {
  let result;
  try {
    result = {
      ...(await run(
        process.execPath,
        [
          "src/cli.js",
          ...args,
          "--store",
          store,
          "--json",
          ...(args[0] === "compare" && details ? ["--details"] : []),
        ],
        { timeout: 60000 },
      )),
      code: 0,
    };
  } catch (error) {
    result = error;
  }
  assert.equal(result.code, expected, result.stderr || result.stdout);
  assert.equal(result.stderr, "");
  return JSON.parse(result.stdout);
}

before(async () => {
  store = await mkdtemp(join(tmpdir(), "design-compare-"));
  server = createDemoServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  url = `http://127.0.0.1:${server.address().port}`;
  baseline = await cli([
    "register",
    "--id",
    "box-art",
    "--url",
    `${url}/reference`,
    "--selector",
    selector,
    ...parts,
  ]);
  drift = await cli(["compare", "--reference", "box-art", "--url", `${url}/drift`], 1);
});
after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await rm(store, { recursive: true, force: true });
});

test("same component passes; renamed classes also pass", async () => {
  for (const route of ["same", "renamed"]) {
    const report = await cli(["compare", "--reference", "box-art", "--url", `${url}/${route}`]);
    assert.equal(report.status, "pass");
    assert.equal(report.visual.changedPixels, 0);
    assert.equal(report.summary.violations, 0);
    assert.equal(report.review.required, true);
    assert.equal(
      Object.hasOwn(report, "reference"),
      false,
      "CLI JSON keeps full DOM snapshots in report.json",
    );
    const evidence = JSON.parse(await readFile(report.jsonPath, "utf8"));
    assert.ok(evidence.reference.snapshot.parts.action.source.includes("components.css"));
    assert.deepEqual(report.conditions.viewport, { width: 1280, height: 900 });
  }
});

test("intentional drift fails with precise CSS, geometry and image artifacts", async () => {
  assert.equal(drift.status, "fail");
  assert.ok(
    drift.findings.some(
      (f) =>
        f.part === "$root" &&
        f.property === "padding-top" &&
        f.expected === "24px" &&
        f.actual === "32px",
    ),
  );
  assert.ok(
    drift.findings.some(
      (f) =>
        f.part === "action" &&
        f.property === "background-color" &&
        f.expected === "rgb(0, 113, 227)" &&
        f.actual === "rgb(239, 68, 68)",
    ),
  );
  assert.ok(drift.findings.some((f) => f.kind === "geometry"));
  assert.ok(drift.visual.ratio > 0.01);
  const report = JSON.parse(await readFile(drift.jsonPath, "utf8"));
  assert.equal(report.status, "fail");
  for (const name of ["reference.png", "candidate.png", "diff.png"]) {
    const bytes = await readFile(join(drift.directory, name));
    assert.equal(bytes.subarray(1, 4).toString(), "PNG");
  }
});

test("explicit policy allows known drift but does not hide evidence", async () => {
  const ignored = [...new Set(drift.findings.map((f) => f.property))];
  const args = ignored.flatMap((property) => ["--ignore", property]);
  const report = await cli([
    "compare",
    "--reference",
    "box-art",
    "--url",
    `${url}/drift`,
    ...args,
    "--pixel-budget",
    "1",
  ]);
  assert.equal(report.status, "pass");
  assert.equal(report.summary.violations, 0);
  assert.ok(report.summary.allowedDifferences > 0);
  assert.ok(report.findings.every((f) => f.allowed));
  assert.equal(report.policy.pixelBudget, 1);
});

test("missing/ambiguous mappings and duplicate baseline fail instead of guessing", async () => {
  for (const route of ["missing", "duplicate"]) {
    const report = await cli(["compare", "--reference", "box-art", "--url", `${url}/${route}`], 2);
    assert.equal(report.status, "error");
    assert.match(report.message, /정확히 1개/);
  }
  const result = await cli(
    ["register", "--id", "box-art", "--url", `${url}/reference`, "--selector", selector],
    2,
  );
  assert.match(result.message, /이미 등록/);
  const original = JSON.parse(await readFile(join(baseline.directory, "reference.json"), "utf8"));
  assert.equal(Object.keys(original.snapshot.parts).length, 4);
});

test("invalid options, missing baseline and invalid network target are structured errors", async () => {
  const cases = [
    ["compare", "--reference", "../escape", "--url", `${url}/same`],
    ["compare", "--reference", "unknown", "--url", `${url}/same`],
    ["compare", "--reference", "box-art", "--url", `${url}/same`, "--ignore", "bogus"],
    ["compare", "--reference", "box-art", "--url", `${url}/same`, "--pixel-budget", "2"],
    ["compare", "--reference", "box-art", "--url", `${url}/same`, "--viewport", "390x844"],
    ["register", "--id", "bad", "--url", "file:///tmp/foo", "--selector", "main"],
    [
      "register",
      "--id",
      "bad",
      "--url",
      `${url}/same`,
      "--selector",
      "main",
      "--part",
      "a=h2",
      "--part",
      "a=p",
    ],
    [
      "register",
      "--id",
      "bad",
      "--url",
      `${url}/same`,
      "--selector",
      "main",
      "--viewport",
      "0x844",
    ],
    ["register", "--id", "bad", "--url", `${url}/404`, "--selector", "main"],
  ];
  for (const args of cases) assert.equal((await cli(args, 2)).status, "error");
});

test("mobile, dark, hover and focus conditions are inherited", async () => {
  for (const condition of [
    { id: "mobile", options: ["--viewport", "390x844"], expected: ["light", "default"] },
    { id: "dark", options: ["--theme", "dark"], expected: ["dark", "default"] },
    { id: "hover", options: ["--state", "hover"], expected: ["light", "hover"] },
    {
      id: "focus",
      options: ["--state", "focus"],
      expected: ["light", "focus"],
      selector: '[data-part="action"]',
    },
  ]) {
    await cli([
      "register",
      "--id",
      condition.id,
      "--url",
      `${url}/reference`,
      "--selector",
      condition.selector ?? selector,
      ...condition.options,
    ]);
    const report = await cli(["compare", "--reference", condition.id, "--url", `${url}/same`]);
    assert.equal(report.conditions.theme, condition.expected[0]);
    assert.equal(report.conditions.state, condition.expected[1]);
    assert.equal(report.visual.changedPixels, 0);
    if (condition.id === "mobile") assert.equal(report.conditions.viewport.width, 390);
    if (condition.id === "focus") {
      const evidence = JSON.parse(await readFile(report.jsonPath, "utf8"));
      assert.equal(evidence.reference.snapshot.parts.$root.styles["outline-style"], "solid");
    }
  }
});

test("human report works on desktop/mobile, overlay, keyboard and evidence links", async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`file://${drift.reportPath}`);
    assert.equal(await page.getByRole("heading", { name: "box-art", exact: true }).count(), 1);
    await page.getByRole("button", { name: "겹쳐 보기" }).click();
    assert.equal(await page.locator("#overlay").isVisible(), true);
    await page.locator("#opacity").fill("75");
    assert.equal(
      await page.locator("#candidate-overlay").evaluate((el) => getComputedStyle(el).opacity),
      "0.75",
    );
    await page.getByRole("button", { name: "나란히 보기" }).focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator("#screens").isVisible(), true);
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    assert.equal(
      await page.locator(".table-wrap").evaluate((el) => el.scrollWidth > el.clientWidth),
      true,
    );
    assert.ok(
      (await page.locator("thead").evaluate((el) => el.getBoundingClientRect().width)) >= 720,
    );
    assert.equal(
      await page
        .locator("img")
        .evaluateAll((images) => images.every((img) => img.complete && img.naturalWidth > 0)),
      true,
    );
    assert.equal(await page.getByRole("link", { name: "AI 비교 자료 JSON" }).count(), 1);
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});

test("HTML escapes untrusted page text and source metadata", async () => {
  const report = JSON.parse(await readFile(drift.jsonPath, "utf8"));
  report.reference.url = '<script>alert("x")</script>';
  report.reference.snapshot.parts.$root.source = "<img src=x onerror=alert(1)>";
  const html = renderReport(report);
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("<img src=x"));
});

test("origin component captures default without accidental hover", async () => {
  const options = {
    url: `${url}/origin`,
    selector: "main",
    parts: {},
    state: "default",
    theme: "light",
    viewport: { width: 390, height: 844 },
  };
  const normal = await capture(options);
  const hover = await capture({ ...options, state: "hover" });
  assert.equal(normal.snapshot.parts.$root.styles["background-color"], "rgb(255, 0, 0)");
  assert.equal(hover.snapshot.parts.$root.styles["background-color"], "rgb(0, 0, 255)");
});

test("stalled lazy image is a bounded error rather than an indefinitely hung job", async () => {
  const start = Date.now();
  const result = await cli(
    ["register", "--id", "stalled", "--url", `${url}/stalled`, "--selector", "main"],
    2,
  );
  assert.match(result.message, /컴포넌트 이미지 로드 실패/);
  assert.ok(Date.now() - start >= 10000, "image decode deadline exercised after scrolling");
  assert.ok(Date.now() - start < 35000);
});

test("different component widths use one visual scale in side-by-side report", async () => {
  const report = await cli(["compare", "--reference", "box-art", "--url", `${url}/wide`], 1);
  assert.equal(report.visual.referenceSize.width, 360);
  assert.equal(report.visual.candidateSize.width, 720);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`file://${report.reportPath}`);
    const sizes = await page.locator("#screens img").evaluateAll((images) =>
      images.map((img) => ({
        natural: img.naturalWidth,
        display: img.getBoundingClientRect().width,
      })),
    );
    assert.equal(sizes[0].natural, sizes[1].natural);
    assert.ok(Math.abs(sizes[0].display - sizes[1].display) < 0.1);
    assert.ok(
      (await page.getByRole("link", { name: "기준 이미지 원본 열기" }).getAttribute("href")) ===
        "reference.png",
    );
  } finally {
    await browser.close();
  }
});

test("AI discovers references and reads targeted evidence without recapturing", async () => {
  const references = await cli(["list"]);
  assert.ok(
    references.references.some(
      (reference) => reference.id === "box-art" && reference.parts.includes("title"),
    ),
  );
  const baseline = await cli(["inspect", "--reference", "box-art", "--part", "title"]);
  assert.deepEqual(Object.keys(baseline.parts), ["title"]);
  assert.equal(baseline.parts.title.styles["font-size"], "20px");
  const overview = await cli(["inspect", "--report", drift.jsonPath]);
  assert.equal(overview.comparisonStatus, "fail");
  assert.ok(overview.parts.every((part) => !Object.hasOwn(part, "fixes")));
  const title = await cli(["inspect", "--report", drift.jsonPath, "--part", "title"]);
  assert.equal(title.status, "inspected");
  assert.equal(title.parts.length, 1);
  assert.ok(
    title.parts[0].fixes.some(
      (fix) => fix.property === "font-size" && fix.current === "24px" && fix.target === "20px",
    ),
  );
  assert.ok(title.parts[0].reference.selector.includes("title"));
  assert.ok((await readFile(title.evidence.images.reference)).length > 0);
  const repairs = JSON.parse(await readFile(drift.repairPath, "utf8"));
  assert.ok(repairs.parts.some((part) => part.part === "$root"));
  assert.equal(repairs.review.required, true);
});

test("compact AI output preserves policy and replay command; details opt in", async () => {
  const compact = await cli(
    [
      "compare",
      "--reference",
      "box-art",
      "--url",
      `${url}/drift`,
      "--ignore",
      "font-size",
      "--pixel-budget",
      "0.02",
    ],
    1,
    false,
  );
  assert.equal(Object.hasOwn(compact, "findings"), false);
  assert.equal(Object.hasOwn(compact, "reference"), false);
  assert.ok(compact.parts.some((part) => part.part === "title"));
  assert.ok(JSON.stringify(compact).length < JSON.stringify(drift).length);
  const replay = compact.nextActions.find((action) => action.purpose.includes("재검사")).argv;
  assert.equal(replay[1], "compare");
  assert.ok(replay.includes("font-size") && replay.includes("0.02") && replay.includes(store));
  const inspected = await cli(compact.nextActions[0].argv.slice(1));
  assert.equal(inspected.parts.length, 1);
});

test("structured errors include recovery, custom store and reject ambiguous inspect", async () => {
  const missing = await cli(["inspect", "--reference", "not-registered"], 2);
  assert.equal(missing.code, "REFERENCE_NOT_FOUND");
  assert.ok(missing.recovery.argv.includes(store));
  const report = await cli(["inspect", "--report", "/nonexistent/report.json"], 2);
  assert.equal(report.code, "REPORT_NOT_FOUND");
  for (const args of [
    ["inspect", "--reference", "box-art", "--report", drift.jsonPath],
    ["inspect", "--reference", "box-art", "--part", "title", "--part", "action"],
    ["list", "--url", `${url}/same`],
  ])
    assert.equal((await cli(args, 2)).code, "INVALID_ARGUMENT");
  const invalidPart = await cli(["inspect", "--report", drift.jsonPath, "--part", "unknown"], 2);
  assert.equal(invalidPart.code, "PART_NOT_FOUND");
  assert.ok(invalidPart.availableParts.includes("title"));
  assert.match(invalidPart.message, /사용 가능/);
});

test("human selects a repair target, filters differences and sees mapped image regions", async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`file://${drift.reportPath}`);
    await page.locator('[data-select-part="title"]').focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator("#part-filter").inputValue(), "title");
    assert.equal(await page.evaluate(() => document.activeElement.id), "visual");
    assert.ok((await page.locator('rect[data-region="title"][visibility="visible"]').count()) >= 3);
    assert.equal(
      await page
        .locator("tbody tr:not([hidden])")
        .evaluateAll((rows) => rows.every((row) => row.dataset.part === "title")),
      true,
    );
    await page.locator("#search").fill("font-size");
    assert.equal(await page.locator("tbody tr:not([hidden])").count(), 1);
    await page.locator("#search").fill("not-a-property");
    assert.equal(await page.locator("#no-results").isVisible(), true);
    await page.locator("#search").fill("");
    await page.getByRole("button", { name: "전체 영역 보기" }).click();
    assert.equal(await page.locator("#part-filter").inputValue(), "");
    assert.equal(await page.evaluate(() => document.activeElement.id), "side");
    assert.equal(await page.locator('rect[visibility="visible"]').count(), 0);
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    assert.ok((await page.getByRole("link", { name: "AI 수정 자료", exact: true }).count()) === 1);
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});

test("allowed differences remain discoverable but are not repair tasks", async () => {
  const ignored = [...new Set(drift.findings.map((finding) => finding.property))];
  const report = await cli([
    "compare",
    "--reference",
    "box-art",
    "--url",
    `${url}/drift`,
    ...ignored.flatMap((property) => ["--ignore", property]),
    "--pixel-budget",
    "1",
  ]);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`file://${report.reportPath}`);
    assert.equal(await page.locator("[data-select-part]").count(), 0);
    assert.equal(await page.locator("tbody tr:not([hidden])").count(), 0);
    assert.equal(await page.locator("#no-results").isVisible(), true);
    await page.locator("#allowed").check();
    assert.ok((await page.locator("tbody tr:not([hidden])").count()) > 0);
    assert.equal(
      await page
        .locator("tbody tr:not([hidden])")
        .evaluateAll((rows) => rows.every((row) => row.dataset.allowed === "true")),
      true,
    );
  } finally {
    await browser.close();
  }
});

test("unexpected mappings are preserved in repair evidence rather than disappearing", async () => {
  const result = await cli(
    [
      "compare",
      "--reference",
      "box-art",
      "--url",
      `${url}/same`,
      "--part",
      'unexpected=[data-part="title"]',
    ],
    1,
    false,
  );
  assert.ok(result.parts.some((part) => part.part === "unexpected" && part.violations > 0));
  const selected = await cli(["inspect", "--report", result.jsonPath, "--part", "unexpected"]);
  assert.equal(selected.parts[0].reference, null);
  assert.equal(selected.parts[0].candidate.selector, '[data-part="title"]');
  assert.ok(selected.parts[0].fixes.some((fix) => fix.kind === "mapping"));
});

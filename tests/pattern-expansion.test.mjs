import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createStaticServer } from "./support/static-server.mjs";
import { topics } from "../ui-components/js/pattern-taxonomy.js";
let browser, server, base;
before(async () => {
  server = createStaticServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  browser = await chromium.launch();
  base = `http://127.0.0.1:${server.address().port}/ui-components/index.html`;
});
after(async () => {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
});
async function pageAt(id) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await page.route(/https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
  await show(page, id);
  return page;
}
async function show(page, id) {
  await page.goto(id ? `${base}?view=specimen&component=${id}` : base);
  await page.locator("#canvas-grid > *").first().waitFor();
}
const action = (page, name) => page.locator(`[data-action="${name}"]`);

test("all registered patterns are reachable without duplicate samples within a category and every category has both levels", async () => {
  const page = await pageAt();
  try {
    const definitions = await page.evaluate(() =>
      Object.values(ComponentModules)
        .flatMap((module) => CanvasCatalog.create().components(module))
        .map(({ id, level }) => ({ id, level })),
    );
    assert.equal(definitions.length, 90);
    assert.equal(new Set(definitions.map((def) => def.id)).size, 90);
    const ids = new Set(topics.flatMap((topic) => topic.groups.flatMap((group) => group.ids)));
    assert.deepEqual([...ids].sort(), definitions.map((def) => def.id).sort());
    for (const topic of topics) {
      const references = topic.groups.flatMap((group) => group.ids);
      assert.equal(
        new Set(references).size,
        references.length,
        `${topic.id}: duplicate mounted IDs`,
      );
      for (const level of ["basic", "advanced"])
        assert.ok(
          references.some((id) => definitions.find((def) => def.id === id).level === level),
          `${topic.id}: missing ${level}`,
        );
    }
    await page.goto(base + "#/layout-navigation/structure?level=advanced");
    await page.locator("[data-sample-id=layout-master-detail]").waitFor({ state: "visible" });
    assert.equal(await page.locator("[data-sample-id=layout-dashboard]").isVisible(), true);
    assert.equal(await page.locator("[data-sample-id=layout-grid]").isVisible(), true);
    assert.equal(await page.locator("[data-sample-id=layout-master-detail]").isVisible(), true);
  } finally {
    await page.close();
  }
});

test("screen structures change layout and real content, keep sticky actions and restore responsive focus", async () => {
  const page = await pageAt("layout-grid");
  try {
    await page.locator('[data-columns="1"]').click();
    assert.equal(
      await page
        .locator("[data-grid]")
        .evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(" ").length),
      1,
    );
    await page.locator('[data-columns="2"]').click();
    assert.equal(
      await page
        .locator("[data-grid]")
        .evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(" ").length),
      2,
    );
    await show(page, "layout-split");
    await page.locator("[data-ratio]").fill("60");
    assert.equal(await page.locator("[data-ratio-label]").textContent(), "60%");
    assert.equal(
      await page
        .locator("[data-split]")
        .evaluate(
          (e) =>
            e.children[0].getBoundingClientRect().width >
            e.children[1].getBoundingClientRect().width,
        ),
      true,
    );
    await show(page, "layout-master-detail");
    await page.locator("[data-view=walk]").click();
    assert.equal(await page.locator("[data-detail-title]").textContent(), "느린 산책");
    await show(page, "layout-dashboard");
    await page.locator("[data-period]").selectOption("month");
    await page.locator("[data-metric]").selectOption("saves");
    assert.equal(await page.locator("[data-total]").textContent(), "503");
    assert.equal(await page.locator("[data-bars] rect").count(), 4);
    assert.match(
      await page.locator(".lp-chart").getAttribute("aria-label"),
      /저장: 82, 108, 139, 174/,
    );
    await show(page, "layout-adaptive-sidebar");
    await page.locator("[data-view=saved]").focus();
    await page.setViewportSize({ width: 390, height: 1000 });
    await page.waitForFunction(() => document.activeElement?.hasAttribute("data-menu-toggle"));
    await page.locator("[data-menu-toggle]").click();
    await page.locator("[data-view=settings]").click();
    assert.equal(await page.locator("[data-adaptive-title]").textContent(), "환경 설정");
    assert.equal(await page.locator("[data-adaptive-menu]").isVisible(), false);
    await show(page, "layout-sticky-panel");
    await page.locator("[data-reader]").evaluate((e) => (e.scrollTop = e.scrollHeight));
    assert.ok(
      await page
        .locator("[data-reader]")
        .evaluate(
          (e) =>
            Math.abs(
              e.querySelector(".lp-sticky").getBoundingClientRect().top -
                e.getBoundingClientRect().top,
            ) < 3,
        ),
    );
    await page.locator("[data-save-plan]").click();
    assert.equal(await page.locator("[data-save-plan]").getAttribute("aria-pressed"), "true");
    await show(page, "navigation-bottom-bar");
    await page.locator("[data-view=collection]").click();
    assert.equal(await page.locator("[data-bottom-title]").textContent(), "좋아하는 모음");
  } finally {
    await page.close();
  }
});

test("tables, combobox and multi-step form support actual sorting, keyboard selection and validated recovery", async () => {
  const page = await pageAt("data-sort-table");
  try {
    await page.locator("[data-sort=members]").click();
    assert.deepEqual(
      await page
        .locator("tbody tr")
        .evaluateAll((rows) => rows.map((row) => Number(row.dataset.members))),
      [4, 8, 12],
    );
    await page.locator("[data-sort=members]").click();
    assert.equal(await page.locator("th[aria-sort=descending]").count(), 1);
    await page.setViewportSize({ width: 390, height: 1000 });
    await page.locator(".dp-table-hint").waitFor({ state: "visible" });
    await page.locator(".dp-table-scroll").focus();
    await page.keyboard.press("ArrowRight");
    await page.waitForFunction(() => document.querySelector(".dp-table-scroll").scrollLeft > 0);
    await page.setViewportSize({ width: 1440, height: 1000 });
    assert.equal(await page.locator(".dp-table-hint").isVisible(), false);
    await show(page, "data-tree");
    await page.locator('[data-document="타이포그래피"]').click();
    assert.equal(await page.locator("[data-detail-title]").textContent(), "타이포그래피");
    await show(page, "input-combobox");
    const input = page.getByRole("combobox");
    await input.fill("fra");
    await input.press("ArrowDown");
    await input.dispatchEvent("keydown", { key: "Enter", isComposing: true });
    assert.equal(await input.inputValue(), "fra");
    await input.press("Enter");
    assert.equal(await input.inputValue(), "Framer");
    assert.equal(await input.getAttribute("aria-expanded"), "false");
    await input.fill("no-matching-tool");
    assert.equal(await page.locator("[data-empty]").isVisible(), true);
    await input.press("Escape");
    assert.equal(await page.locator("[data-empty]").isVisible(), false);
    await show(page, "form-stepper");
    await page.locator("[name=name]").fill("   ");
    await page.locator("[name=email]").fill("test@example.com");
    await page.locator("[data-form-next]").click();
    assert.equal(await page.locator("[name=name]").getAttribute("aria-invalid"), "true");
    await page.locator("[name=name]").fill("민서");
    await page.locator("[data-form-next]").click();
    await page.locator("[name=plan]").selectOption("Team");
    await page.locator("[data-form-back]").click();
    assert.equal(await page.locator("[name=name]").inputValue(), "민서");
    await page.locator("[data-form-next]").click();
    await page.locator("[data-form-next]").click();
    assert.match(await page.locator("[data-review]").textContent(), /민서.*Team/);
    await page.locator("[data-form-next]").click();
    assert.equal(await page.locator("[data-form-reset]").isVisible(), true);
    await page.locator("[data-form-reset]").click();
    assert.equal(await page.locator("[name=name]").inputValue(), "");
  } finally {
    await page.close();
  }
});

test("workflow controls preserve edits, mixed selection and actual command execution with focus restoration", async () => {
  const page = await pageAt("interaction-inline-edit");
  try {
    await action(page, "edit").click();
    await page.locator(".sample input").fill("   ");
    await page.getByRole("button", { name: "저장", exact: true }).click();
    assert.equal(await page.locator(".sample input").getAttribute("aria-invalid"), "true");
    await action(page, "cancel").click();
    await action(page, "edit").click();
    assert.equal(await page.locator(".sample input").getAttribute("aria-invalid"), null);
    await page.locator(".sample input").fill("수정한 프로젝트");
    await page.getByRole("button", { name: "저장", exact: true }).click();
    assert.equal(await page.locator("[data-name]").textContent(), "수정한 프로젝트");
    await show(page, "interaction-bulk-select");
    await page.locator('[data-item="0"]').check();
    assert.equal(await page.locator("[data-all]").evaluate((e) => e.indeterminate), true);
    await action(page, "archive").click();
    assert.equal(await page.locator('[data-item="0"]').isVisible(), false);
    await action(page, "undo").click();
    assert.equal(await page.locator('[data-item="0"]').isVisible(), true);
    await show(page, "interaction-command-palette");
    await action(page, "open").click();
    await page.locator("dialog input").press("ArrowDown");
    assert.equal(
      await page
        .locator(".workflow-command")
        .first()
        .evaluate((e) => e === document.activeElement),
      true,
    );
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    assert.equal(await page.locator("[data-command-result]").textContent(), "활동");
    assert.equal(await action(page, "open").evaluate((e) => e === document.activeElement), true);
    await action(page, "open").click();
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("dialog").evaluate((e) => e.open), false);
    assert.equal(await action(page, "open").evaluate((e) => e === document.activeElement), true);
  } finally {
    await page.close();
  }
});

test("feedback rolls back failure, retries latest edits, updates notifications and cancels disposed work", async () => {
  const page = await pageAt("feedback-optimistic");
  try {
    await action(page, "favorite").click();
    assert.equal(await action(page, "favorite").getAttribute("aria-pressed"), "true");
    await page.waitForFunction(
      () => document.querySelector("[data-action=retry]").disabled === false,
    );
    assert.equal(await action(page, "favorite").getAttribute("aria-pressed"), "false");
    await action(page, "retry").click();
    await page.waitForFunction(
      () => document.querySelector("[data-action=favorite]").disabled === false,
    );
    assert.equal(await action(page, "favorite").getAttribute("aria-pressed"), "true");
    await show(page, "feedback-connection");
    await page.locator(".sample select").selectOption("offline");
    assert.equal(await action(page, "save").isDisabled(), true);
    await action(page, "queue").click();
    await page.locator(".sample select").selectOption("online");
    assert.match(await page.locator("[data-status]").textContent(), /대기 중인 변경/);
    await show(page, "feedback-notification-center");
    await page.locator('[data-read="1"]').click();
    assert.equal(await page.locator("[data-count]").textContent(), "읽지 않음 1");
    await page.locator('[data-dismiss="2"]').click();
    assert.equal(await page.locator("[data-count]").textContent(), "읽지 않음 0");
    await action(page, "restore").click();
    assert.equal(await page.locator("[data-count]").textContent(), "읽지 않음 1");
    await show(page, "feedback-autosave");
    await page.locator(".sample select").selectOption("failure");
    await page.locator("textarea").fill("새로운 메모");
    await page.waitForFunction(
      () => document.querySelector("[data-action=retry]").disabled === false,
    );
    assert.equal(await page.locator("textarea").inputValue(), "새로운 메모");
    await page.locator(".sample select").selectOption("success");
    await action(page, "retry").click();
    await page.waitForFunction(() =>
      document.querySelector("[data-status]").textContent.includes("모든 변경"),
    );
    await page.locator("textarea").fill("최신 메모");
    await page.waitForFunction(() =>
      document.querySelector("[data-status]").textContent.includes("모든 변경"),
    );
    await page.goto(base + "#/feedback/progress");
    await action(page, "start").click();
    await page.evaluate(() => {
      window.detachedStatus = document.querySelector(
        "[data-sample-id=feedback-task-steps] [data-status]",
      );
      window.savedStatus = detachedStatus.textContent;
    });
    await page.locator("[data-target=components] .category-button").click();
    await page.waitForTimeout(750);
    assert.equal(await page.evaluate(() => detachedStatus.textContent === savedStatus), true);
  } finally {
    await page.close();
  }
});

test("accessibility demonstrations separate focus from selection, skip menus, reflow text and calculate real contrast", async () => {
  const page = await pageAt("a11y-skip-link");
  try {
    const url = page.url();
    await page.locator(".a11y-skip").click();
    assert.equal(page.url(), url);
    assert.equal(
      await page.locator(".a11y-main").evaluate((e) => e === document.activeElement),
      true,
    );
    await show(page, "a11y-multi-listbox");
    const list = page.getByRole("listbox");
    await list.focus();
    await list.press("ArrowDown");
    assert.equal(await list.getAttribute("aria-activedescendant"), "a11y-panel-1");
    assert.equal(await page.getByRole("option", { selected: true }).count(), 1);
    await list.press("Space");
    assert.equal(await page.getByRole("option", { selected: true }).count(), 2);
    await list.press("End");
    await list.press("Space");
    assert.match(await page.locator("[data-listbox-output]").textContent(), /Publish/);
    await list.press("Control+a");
    assert.equal(await page.getByRole("option", { selected: true }).count(), 4);
    await page.setViewportSize({ width: 320, height: 1000 });
    await show(page, "a11y-text-scale");
    await page.locator("[data-text-scale]").fill("200");
    assert.equal(await page.locator("[data-scale-output]").textContent(), "200%");
    assert.equal(
      await page.locator("[data-reflow]").evaluate((element) => getComputedStyle(element).fontSize),
      "28px",
    );
    assert.equal(
      await page.locator("[data-reflow]").evaluate((e) => e.scrollWidth <= e.clientWidth),
      true,
    );
    await page.locator("[data-reflow-action]").click();
    assert.match(await page.locator("[data-status]").textContent(), /버튼/);
    await show(page, "a11y-contrast");
    await page.locator("[data-foreground]").fill("#000000");
    await page.locator("[data-background]").fill("#ffffff");
    assert.equal(await page.locator("[data-contrast-ratio]").textContent(), "21.00:1");
    await page.locator("[data-foreground]").fill("#ffffff");
    assert.equal(await page.locator("[data-contrast-ratio]").textContent(), "1.00:1");
    assert.equal(await page.locator("[data-contrast-result]").getAttribute("data-pass"), "false");
  } finally {
    await page.close();
  }
});

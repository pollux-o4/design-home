import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "../design-compare/node_modules/playwright/index.mjs";
import { createStaticServer } from "./support/static-server.mjs";
let browser, server, base;
before(async () => {
  server = createStaticServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}/ui-components/index.html`;
  browser = await chromium.launch();
});
after(async () => {
  await browser.close();
  await new Promise((r) => server.close(r));
});
async function sample(id) {
  const page = await browser.newPage();
  await page.route(/https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  await page.goto(`${base}?view=specimen&component=${id}`);
  return page;
}
test("reordering supports pointer drag and keyboard movement", async () => {
  const p = await sample("drag-drop-reorder");
  try {
    const items = p.locator(".ui-drag-item");
    const initial = await items.allTextContents();
    await items.first().focus();
    await p.keyboard.press("Alt+ArrowDown");
    assert.notEqual(
      (await items.allTextContents())[0],
      initial[0],
      "keyboard movement must change the order",
    );
    const beforeDrag = await items.allTextContents();
    await items.first().dragTo(items.last());
    assert.notDeepEqual(await items.allTextContents(), beforeDrag);
  } finally {
    await p.close();
  }
});
test("native dialogs validate, isolate background, cancel and restore focus", async () => {
  const p = await sample("modal");
  try {
    const dialog = p.locator("dialog");
    await dialog.waitFor();
    assert.equal(await dialog.evaluate((e) => e.matches(":modal")), true);
    await p.keyboard.press("Escape");
    await p.waitForFunction(
      () =>
        document.querySelector("[data-open-dialog]") === document.activeElement,
    );
    const open = p.locator("[data-open-dialog]");
    assert.equal(
      await open.evaluate((e) => e === document.activeElement),
      true,
    );
    await open.click();
    await dialog.getByRole("button", { name: "생성", exact: true }).click();
    assert.equal(await dialog.evaluate((e) => e.open), true);
    await dialog.locator("input").fill("새 디자인");
    await dialog.getByRole("button", { name: "생성", exact: true }).click();
    assert.equal(await dialog.evaluate((e) => e.open), false);
    await p.getByRole("status").filter({ hasText: "새 디자인" }).waitFor();
  } finally {
    await p.close();
  }
  for (const id of ["confirm", "alert", "drawer"]) {
    const p = await sample(id);
    try {
      await p.locator("[data-open-dialog]").click();
      assert.equal(
        await p.locator("dialog").evaluate((e) => e.matches(":modal")),
        true,
      );
      await p.keyboard.press("Escape");
      assert.equal(await p.locator("dialog").evaluate((e) => e.open), false);
    } finally {
      await p.close();
    }
  }
});
test("input validation, password visibility, upload reset and searchable empty recovery", async () => {
  let p = await sample("form-validation");
  try {
    await p.locator(".sample input").fill("bad-email");
    await p.getByRole("button", { name: "저장" }).click();
    assert.equal(
      await p.locator(".sample input").getAttribute("aria-invalid"),
      "true",
    );
    await p.locator(".sample input").fill("team@example.com");
    await p.getByRole("button", { name: "저장" }).click();
    assert.equal(
      await p.locator(".sample input").getAttribute("aria-invalid"),
      "false",
    );
    assert.match(await p.locator("[data-status]").textContent(), /저장/);
  } finally {
    await p.close();
  }
  p = await sample("password-field");
  try {
    await p.locator(".sample input").fill("sample-password");
    await p.getByRole("button", { name: "표시", exact: true }).click();
    assert.equal(await p.locator(".sample input").getAttribute("type"), "text");
    await p.getByRole("button", { name: "숨기기" }).click();
    assert.equal(
      await p.locator(".sample input").inputValue(),
      "sample-password",
    );
    assert.equal(
      await p.locator(".sample input").getAttribute("type"),
      "password",
    );
  } finally {
    await p.close();
  }
  p = await sample("file-uploader");
  try {
    await p.locator(".sample input").setInputFiles({
      name: "a-very-long-sample-file-name.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("hello"),
    });
    assert.match(
      await p.locator("[data-filename]").textContent(),
      /a-very-long/,
    );
    await p.getByRole("button", { name: "선택 취소" }).click();
    assert.equal(
      await p.locator(".sample input").evaluate((e) => e.files.length),
      0,
    );
    await p.locator("[data-drop-zone]").evaluate((zone) => {
      const transfer = new DataTransfer();
      transfer.items.add(
        new File(["drop"], "dropped-file.txt", { type: "text/plain" }),
      );
      zone.dispatchEvent(
        new DragEvent("drop", {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer,
        }),
      );
    });
    assert.equal(
      await p.locator(".sample input").evaluate((input) => input.files[0].name),
      "dropped-file.txt",
    );
    assert.match(
      await p.locator("[data-filename]").textContent(),
      /dropped-file/,
    );
  } finally {
    await p.close();
  }
  p = await sample("searchable-list");
  try {
    await p.locator(".sample input").fill("zzz");
    assert.equal(await p.locator("[data-result]:visible").count(), 0);
    assert.match(await p.locator("[data-status]").textContent(), /없습니다/);
    await p.locator(".sample input").fill("");
    assert.equal(await p.locator("[data-result]:visible").count(), 3);
  } finally {
    await p.close();
  }
});
test("navigation changes real content and rerenders with fresh instance state", async () => {
  let p = await sample("pagination");
  try {
    const before = await p.locator("[data-page-items]").textContent();
    await p.getByRole("button", { name: "2페이지", exact: true }).click();
    assert.notEqual(await p.locator("[data-page-items]").textContent(), before);
    await p.getByRole("button", { name: "3페이지", exact: true }).click();
    assert.equal(
      await p.getByRole("button", { name: "다음 페이지" }).isDisabled(),
      true,
    );
  } finally {
    await p.close();
  }
  p = await sample("tab-bar");
  try {
    await p.locator("[role=tab]").first().focus();
    await p.keyboard.press("ArrowRight");
    assert.equal(
      await p.locator("[role=tab]").nth(1).getAttribute("aria-selected"),
      "true",
    );
    assert.match(await p.locator("[role=tabpanel]").textContent(), /진행/);
    assert.equal(
      await p.locator("[role=tabpanel]").getAttribute("aria-labelledby"),
      await p.locator("[role=tab]").nth(1).getAttribute("id"),
    );
  } finally {
    await p.close();
  }
  p = await sample("integrated-nav-demo");
  try {
    await p
      .locator("[data-main-menu]")
      .getByRole("button", { name: "사용자", exact: true })
      .click();
    await p
      .locator("[data-sub-menu]")
      .getByRole("button", { name: "권한 그룹" })
      .click();
    assert.equal(
      await p.locator("[data-view-title]").textContent(),
      "권한 그룹",
    );
  } finally {
    await p.close();
  }
  p = await browser.newPage();
  try {
    await p.route(/https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    await p.goto(base);
    await p.locator('[data-target="layout-navigation"] .category-button').click();
    await p.locator('[data-target="layout-navigation"] [data-group="content"]').click();
    const next = p.getByRole("button", { name: "다음 슬라이드" });
    await next.click();
    const second = await p.locator("[data-slide-title]").textContent();
    await p.locator('[data-target="interaction"] .category-button').click();
    await p.locator('[data-target="layout-navigation"] .category-button').click();
    await p.locator('[data-target="layout-navigation"] [data-group="content"]').click();
    assert.notEqual(
      await p.locator("[data-slide-title]").textContent(),
      second,
    );
    await next.click();
    assert.equal(await p.locator("[data-slide-title]").textContent(), second);
  } finally {
    await p.close();
  }
});
test("undo restores a real item, retry recovers and progress finishes", async () => {
  let p = await sample("snackbar");
  try {
    await p.locator("[data-delete]").click();
    assert.equal(await p.locator("[data-undo-item]").isVisible(), false);
    await p.getByRole("button", { name: "실행 취소", exact: true }).click();
    assert.equal(await p.locator("[data-undo-item]").isVisible(), true);
    assert.equal(await p.locator("[data-delete]").isDisabled(), false);
  } finally {
    await p.close();
  }
  p = await sample("error-retry");
  try {
    const button = p.getByRole("button", { name: "다시 시도" });
    await button.click();
    await p.waitForFunction(
      () => !document.querySelector(".sample button").disabled,
    );
    assert.match(await p.locator("[data-status]").textContent(), /한 번 더/);
    await button.click();
    await p.waitForFunction(
      () =>
        document.querySelector(".sample button").textContent === "연결 완료",
    );
    assert.match(
      await p.locator("[data-status]").textContent(),
      /연결되었습니다/,
    );
  } finally {
    await p.close();
  }
  p = await sample("progress-bar");
  try {
    await p.getByRole("button", { name: "실행", exact: true }).click();
    await p.waitForFunction(
      () => document.querySelector("progress").value === 100,
    );
    assert.equal(await p.locator("output").textContent(), "100%");
  } finally {
    await p.close();
  }
});
test("popover light dismiss, tooltip keyboard, chip recovery and stepper bounds", async () => {
  let p = await sample("popover");
  try {
    await p.getByRole("button", { name: "프로필 정보" }).click();
    assert.equal(
      await p.locator("[popover]").evaluate((e) => e.matches(":popover-open")),
      true,
    );
    await p.keyboard.press("Escape");
    assert.equal(
      await p.locator("[popover]").evaluate((e) => e.matches(":popover-open")),
      false,
    );
  } finally {
    await p.close();
  }
  p = await sample("tooltip");
  try {
    await p.locator(".sample button").focus();
    assert.equal(await p.getByRole("tooltip").isVisible(), true);
  } finally {
    await p.close();
  }
  p = await sample("chip-tag");
  try {
    while (await p.locator("[data-remove]").count())
      await p.locator("[data-remove]").first().click();
    assert.equal(await p.locator(".ui-chip").count(), 0);
    await p.locator("[data-add-chip]").click();
    assert.equal(await p.locator(".ui-chip").count(), 3);
  } finally {
    await p.close();
  }
  p = await sample("stepper");
  try {
    assert.equal(
      await p.getByRole("button", { name: "수량 감소" }).isDisabled(),
      true,
    );
    await p.getByRole("button", { name: "수량 증가" }).click();
    assert.equal(await p.locator("output").textContent(), "2");
    await p.getByRole("button", { name: "수량 감소" }).click();
    assert.equal(
      await p.getByRole("button", { name: "수량 감소" }).isDisabled(),
      true,
    );
  } finally {
    await p.close();
  }
});
test("all sample definitions keep accessible labels and responsive bounds", async () => {
  const p = await browser.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.route(/https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  try {
    await p.goto(base);
    const definitions = await p.evaluate(() =>
      Object.values(ComponentModules)
        .flatMap((m) => CanvasCatalog.create().components(m))
        .map((c) => ({ id: c.id, render: c.render() })),
    );
    assert.equal(
      new Set(definitions.map((d) => d.id)).size,
      definitions.length,
    );
    assert.equal(definitions.length, 90);
    for (const definition of definitions) {
      assert.equal(
        /on(click|change|input|drop)=|style=|\p{Extended_Pictographic}/u.test(
          definition.render,
        ),
        false,
        definition.id,
      );
      for (const width of [320, 768, 1440]) {
        await p.setViewportSize({ width, height: 900 });
        await p.goto(`${base}?view=specimen&component=${definition.id}`);
        await p.locator(".sample").waitFor();
        const checks = await p.evaluate(() => {
          const root = document.querySelector(".sample");
          return {
            overflow: root.scrollWidth > root.clientWidth + 1,
            inputs: [...root.querySelectorAll("input,select,textarea")]
              .filter(
                (e) => !e.closest("label") && !e.getAttribute("aria-label"),
              )
              .map((e) => e.outerHTML),
            body: document.body.scrollWidth > innerWidth,
          };
        });
        assert.equal(
          checks.overflow || checks.body,
          false,
          `${definition.id} overflows at ${width}`,
        );
        assert.deepEqual(checks.inputs, [], definition.id);
      }
    }
    assert.deepEqual(errors, []);
  } finally {
    await p.close();
  }
});

test("mobile drawer fits its content and semantic badges retain readable contrast", async () => {
  const p = await sample("drawer");
  try {
    await p.setViewportSize({ width: 390, height: 900 });
    await p.locator("[data-open-dialog]").click();
    const box = await p.locator("dialog").boundingBox();
    assert.ok(box.height < 500, "bottom sheet should fit its content");
    assert.ok(
      Math.abs(box.y + box.height - 900) < 2,
      "bottom sheet should be attached to the bottom",
    );
    await p.goto(`${base}?view=specimen&component=badge`);
    const ratios = await p.locator(".ui-badge").evaluateAll((badges) => {
      const luminance = (rgb) => {
        const values = rgb
          .match(/[\d.]+/g)
          .slice(0, 3)
          .map((n) => {
            const c = Number(n) / 255;
            return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          });
        return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
      };
      return badges.map((badge) => {
        const css = getComputedStyle(badge);
        const a = luminance(css.color),
          b = luminance(css.backgroundColor);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      });
    });
    assert.ok(
      ratios.every((r) => r >= 4.5),
      JSON.stringify(ratios),
    );
  } finally {
    await p.close();
  }
});

test("sidebar stays alongside content while a drawer opens as a dismissible layer", async () => {
  const p = await sample("lnb-sidebar");
  try {
    for (const width of [320, 768, 1440]) {
      await p.setViewportSize({ width, height: 900 });
      const sidebar = p.locator(".sidebar-demo-nav"),
        content = p.locator(".sidebar-demo-content");
      const before = await sidebar.boundingBox();
      const body = await content.boundingBox();
      assert.ok(before.x + before.width <= body.x + 1);
      assert.ok(Math.abs(before.y - body.y) < 2);
      await p.getByRole("button", { name: "매출 리포트", exact: true }).click();
      assert.match(await p.locator("[data-panel]").textContent(), /매출/);
      assert.equal(await sidebar.isVisible(), true);
      assert.deepEqual(await sidebar.boundingBox(), before);
      assert.equal(await p.locator("dialog").count(), 0);
    }
  } finally {
    await p.close();
  }
  const drawer = await sample("drawer");
  try {
    await drawer.locator("[data-open-dialog]").click();
    assert.equal(
      await drawer.locator("dialog").evaluate((e) => e.matches(":modal")),
      true,
    );
    await drawer.keyboard.press("Escape");
    await drawer.waitForFunction(() => !document.querySelector("dialog").open);
  } finally {
    await drawer.close();
  }
});

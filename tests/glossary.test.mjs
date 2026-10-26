import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "../design-compare/node_modules/playwright/index.mjs";
import { createStaticServer } from "./support/static-server.mjs";
import { readRoute, routeHref } from "../glossary/js/route.js";
import { mkdir } from "node:fs/promises";

const fixture = [{ id: "modal", category: "ui" }];
test("glossary routes preserve search and reject mismatched or missing terms", () => {
  const state = { category: "ui", id: "modal", query: "모달 & UI" };
  assert.deepEqual(readRoute(routeHref(state), fixture), {
    ...state,
    example: "",
    invalid: false,
  });
  for (const hash of ["#/ux/modal", "#/wrong", "#/ui/missing", "#/%E0%A4%A"]) {
    assert.equal(readRoute(hash, fixture).invalid, true);
  }
});

test("glossary navigation, live examples, search, keyboard, history and responsive layouts", async () => {
  const server = createStaticServer({ prefix: "/design-home/" });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}/design-home/`;
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.setDefaultTimeout(6000);
  const errors = [],
    failures = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.url().startsWith(base) && response.status() >= 400)
      failures.push(response.url());
  });
  try {
    await mkdir(".legacy-review", { recursive: true });
    await page.goto(base);
    await page
      .getByRole("button", { name: "Design Study", exact: true })
      .click();
    await page.getByRole("link", { name: "용어집", exact: true }).click();
    await page.locator("#category-ui").waitFor();
    assert.equal(
      await page.locator("#dh-global-nav [aria-current=page]").innerText(),
      "용어집",
    );
    assert.equal(
      await page.locator(".category-toggle[aria-expanded=true]").count(),
      0,
    );
    assert.equal(await page.locator("#term-count").innerText(), "78");
    await page.screenshot({ path: ".legacy-review/glossary-overview.png" });
    await page.locator("#category-ui").focus();
    await page.keyboard.press("Enter");
    await page.waitForURL("**#/ui");
    await page.locator(".term-row").first().waitFor();
    assert.equal(await page.locator(".term-row").count(), 18);
    await page.locator("[data-expand=toggle-switch]").click();
    assert.equal(await page.getByRole("switch").isChecked(), true);
    await page.getByRole("switch").click();
    assert.equal(await page.getByRole("switch").isChecked(), false);
    await page.getByRole("button", { name: "↺ 다시 시작" }).click();
    assert.equal(await page.getByRole("switch").isChecked(), true);
    await page.locator("[data-expand=modal]").click();
    assert.equal(await page.locator(".expanded-row:visible").count(), 1);
    await page.getByRole("button", { name: "프로젝트 만들기" }).click();
    assert.equal(await page.getByRole("dialog").isVisible(), true);
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("dialog").count(), 0); // closed dialog is outside accessible tree
    assert.equal(
      await page
        .getByRole("button", { name: "프로젝트 만들기" })
        .evaluate((node) => node === document.activeElement),
      true,
    );
    await page.locator("#category-ux").click();
    await page.locator("#panel-ui").waitFor({ state: "hidden" });
    assert.equal(await page.locator("#panel-ui").isVisible(), false);
    await page.locator("#term-search").fill("tooltip");
    assert.equal(await page.locator(".term-row").count(), 1);
    await page.locator("[data-expand=tooltip]").click();
    await page.locator(".detail-link").click();
    await page.waitForURL("**#/ui/tooltip?q=tooltip*");
    await page.locator("#detail-view h1").waitFor();
    assert.equal(
      await page.locator("#detail-view h1").innerText(),
      "도움말 툴팁",
    );
    await page.locator(".skip-link").focus();
    await page.keyboard.press("Enter");
    assert.match(page.url(), /#\/ui\/tooltip/);
    assert.equal(
      await page
        .locator("#main-content")
        .evaluate((node) => node === document.activeElement),
      true,
    );
    await page.reload();
    assert.equal(
      await page.locator("#detail-view h1").innerText(),
      "도움말 툴팁",
    );
    await page.locator(".back-link").click();
    await page.locator("#list-view").waitFor();
    assert.equal(await page.locator("#term-search").inputValue(), "tooltip");
    await page.locator("#term-search").fill("no-such-term");
    assert.equal(await page.locator("#empty-state").isVisible(), true);
    await page.locator("#reset-search").click();
    assert.equal(await page.locator("#term-search").inputValue(), "");
    await page.keyboard.press("Escape");
    await page.locator("#category-ux").click();
    await page.locator("#panel-ux .term-row").first().waitFor();
    const terms = await page
      .locator("[data-expand]")
      .evaluateAll((nodes) => nodes.map((node) => node.dataset.expand));
    assert.equal(terms.length, 15);
    for (const id of terms) {
      await page.locator(`[data-expand="${id}"]`).click();
      const choices = await page
        .locator(".expanded-row:visible .example-choice")
        .count();
      for (let i = 0; i < choices; i++)
        await page
          .locator(".expanded-row:visible .example-choice")
          .nth(i)
          .click();
      assert.equal(
        await page.locator(".expanded-row:visible .sample").count(),
        1,
        id,
      );
    }
    await page.goto(base + "glossary/index.html#/ux?q=피츠");
    await page.locator("[data-expand=fitts]").click();
    await page.locator(".example-choice").nth(1).click();
    const selectedExample = await page
      .locator(".example-choice[aria-pressed=true]")
      .getAttribute("data-sample");
    await page.locator(".detail-link").click();
    await page.locator("#detail-view h1").waitFor();
    assert.equal(
      await page
        .locator(".example-choice[aria-pressed=true]")
        .getAttribute("data-sample"),
      selectedExample,
    );
    await page.goBack();
    await page.locator(".expanded-row:visible").waitFor();
    assert.equal(
      await page
        .locator(".example-choice[aria-pressed=true]")
        .getAttribute("data-sample"),
      selectedExample,
    );
    await page.locator(".detail-link").click();
    await page.locator("#detail-view h1").waitFor();
    await page.reload();
    assert.equal(
      await page
        .locator(".example-choice[aria-pressed=true]")
        .getAttribute("data-sample"),
      selectedExample,
    );
    await page.goto(base + "glossary/index.html#/ux/fitts");
    await page.getByLabel("대상 크기").fill("80");
    await page.getByLabel("이동 거리").fill("75");
    await page.getByRole("button", { name: "대상 선택" }).click();
    assert.match(
      await page.locator("[data-status]").innerText(),
      /선택했습니다/,
    );
    await page.goto(base + "glossary/index.html#/ux/hick");
    await page.getByRole("switch", { name: "선택지 그룹화" }).click();
    await page.getByText("따뜻한 음료", { exact: true }).click();
    await page.getByRole("button", { name: "라테", exact: true }).click();
    assert.equal(await page.locator("[data-status]").innerText(), "라테 선택");
    await page.goto(base + "glossary/index.html#/ux/proximity");
    await page.getByRole("switch").click();
    assert.equal(await page.locator(".proximity-field.is-grouped").count(), 1);
    await page.goto(base + "glossary/index.html#/ui/toggle-switch");
    await page.locator(".detail-resources a").first().click();
    await page.waitForURL(
      "**/ui-components/index.html?component=toggle-switch",
    );
    await page.goBack();
    await page.getByRole("switch").click();
    assert.equal(await page.getByRole("switch").isChecked(), false);
    await page.goto(base + "glossary/index.html#/ui");
    const uiTerms = await page
      .locator("[data-expand]")
      .evaluateAll((nodes) => nodes.map((node) => node.dataset.expand));
    for (const id of uiTerms) {
      await page.locator(`[data-expand="${id}"]`).click();
      assert.equal(
        await page.locator(".expanded-row:visible .sample").count(),
        1,
        id,
      );
    }
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(base + "glossary/index.html#/ui");
      await page.evaluate(() => scrollTo(0, 0));
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        `list overflow ${width}`,
      );
      await page.screenshot({
        path: `.legacy-review/glossary-list-${width}.png`,
      });
      if (
        (await page
          .locator("[data-expand=accordion]")
          .getAttribute("aria-expanded")) !== "true"
      )
        await page.locator("[data-expand=accordion]").click();
      await page
        .locator(".expanded-row:visible .sample summary")
        .first()
        .click();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        `inline overflow ${width}`,
      );
      await page.goto(base + "glossary/index.html#/ux/progressive-disclosure");
      await page.screenshot({
        path: `.legacy-review/glossary-detail-${width}.png`,
        fullPage: true,
      });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        `detail overflow ${width}`,
      );
      const duplicates = await page.evaluate(() => {
        const ids = [...document.querySelectorAll("[id]")].map(
          (node) => node.id,
        );
        return ids.filter((id, index) => ids.indexOf(id) !== index);
      });
      assert.deepEqual(duplicates, []);
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(base + "glossary/index.html#/ux");
    await page.locator("[data-expand=control]").click();
    await page.locator(".detail-link").click();
    await page.locator("#detail-view h1").waitFor();
    await page.goBack();
    await page.locator(".expanded-row:visible").waitFor();
    assert.equal(
      await page.locator("[data-expand=control]").getAttribute("aria-expanded"),
      "true",
    );
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(base + "glossary/index.html#/motion");
    assert.equal(await page.locator("#panel-motion .term-row").count(), 45);
    assert.equal(await page.locator(".expanded-row:visible").count(), 0);
    await page.screenshot({
      path: ".legacy-review/glossary-motion-list.png",
      fullPage: true,
    });
    const motionTerms = await page
      .locator("[data-expand]")
      .evaluateAll((nodes) => nodes.map((node) => node.dataset.expand));
    assert.equal(motionTerms.length, 45);
    for (const id of motionTerms) {
      await page.locator(`[data-expand="${id}"]`).click();
      assert.equal(
        await page.locator(".expanded-row:visible .sample").count(),
        1,
        id,
      );
      if (!id.startsWith("glossary-")) {
        assert.equal(
          await page.locator(".motion-more").getAttribute("open"),
          null,
        );
        await page.locator("[data-play]").click();
        assert.ok(
          await page
            .locator(".motion-object")
            .evaluateAll((nodes) =>
              nodes.some((node) => node.getAnimations().length),
            ),
        );
        await page.locator(".motion-more summary").click();
        assert.equal(
          await page.locator(".motion-more").getAttribute("open"),
          "",
        );
      }
    }
    await page.locator("[data-expand=motion-gooey]").click();
    await page.screenshot({
      path: ".legacy-review/glossary-motion-gooey.png",
      fullPage: true,
    });
    await page.locator(".detail-link").click();
    await page.reload();
    assert.equal(
      await page.locator("#detail-view h1").innerText(),
      "구이 효과",
    );
    assert.equal(await page.locator(".detail-resources a").count(), 1);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator("[data-play]").click();
    assert.match(
      await page.locator("[data-motion-status]").innerText(),
      /움직임 줄이기/,
    );
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(base + "glossary/index.html#/motion");
      await page.locator("[data-expand=motion-gooey]").click();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        `motion overflow ${width}`,
      );
    }
    await page.goto(base + "glossary/index.html#/ui/missing");
    assert.equal(await page.locator(".route-notice").isVisible(), true);
    assert.deepEqual(errors, []);
    assert.deepEqual(failures, []);
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});

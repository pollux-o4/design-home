import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "../design-compare/node_modules/playwright/index.mjs";
import { createStaticServer } from "./support/static-server.mjs";

test("glossary language controls translate lists, detail and examples and persist after reload", async () => {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}/glossary/index.html#/motion`);
    await page.locator("#dh-lang-en").click();
    assert.equal(await page.locator("html").getAttribute("lang"), "en");
    assert.match(await page.title(), /Glossary/);
    assert.doesNotMatch(await page.title(), /[가-힣]/);
    assert.doesNotMatch(await page.locator("#list-view").innerText(), /[가-힣]/);
    await page.locator("[data-expand=glossary-motion-success-burst]").click();
    assert.doesNotMatch(
      await page.locator(".example").filter({ visible: true }).innerText(),
      /[가-힣]/,
    );
    await page.locator("[data-motion-play]").click();
    assert.match(await page.locator("[data-success-label]").innerText(), /complete/i);
    await page.reload();
    assert.doesNotMatch(await page.locator("#list-view").innerText(), /[가-힣]/);
    await page.locator('a[href="#/motion/motion-fade"]').click();
    assert.doesNotMatch(await page.locator("#detail-view").innerText(), /[가-힣]/);
    await page.locator("#dh-lang-ko").click();
    assert.match(await page.locator("#detail-view").innerText(), /페이드/);
    await page.goto(
      `http://127.0.0.1:${server.address().port}/glossary/index.html#/ui/form-stepper`,
    );
    await page.locator("input[name=name]").fill("Alex");
    await page.locator("#dh-lang-en").click();
    assert.equal(await page.locator("input[name=name]").inputValue(), "Alex");
    await page.getByRole("button", { name: "Next", exact: true }).click();
    assert.match(await page.locator("[data-status]").innerText(), /email/i);
    assert.doesNotMatch(await page.locator("[data-status]").innerText(), /[가-힣]/);
    await page.locator("#dh-lang-ko").click();
    assert.equal(await page.locator("input[name=name]").inputValue(), "Alex");
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});

test("all glossary categories and opened examples have English text and accessible labels", async () => {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch();
  const page = await browser.newPage({ reducedMotion: "reduce" });
  let count = 0;
  try {
    for (const category of ["ui", "ux", "motion"]) {
      await page.goto(`http://127.0.0.1:${server.address().port}/glossary/index.html#/${category}`);
      await page.locator("#dh-lang-en").click();
      const ids = await page
        .locator("[data-expand]")
        .evaluateAll((nodes) => nodes.map((node) => node.dataset.expand));
      for (const id of ids) {
        await page.locator(`[data-expand="${id}"]`).click();
        const example = page.locator(".example").filter({ visible: true });
        assert.doesNotMatch(await example.innerText(), /[가-힣]/, id);
        const labels = await example.evaluate((element) =>
          [...element.querySelectorAll("[aria-label],[placeholder]")]
            .filter((node) => node.checkVisibility())
            .flatMap((node) => [
              node.getAttribute("aria-label") ?? "",
              node.getAttribute("placeholder") ?? "",
            ])
            .join("\n"),
        );
        assert.doesNotMatch(labels, /[가-힣]/, id);
        const play = example.locator("[data-play], [data-motion-play]");
        if ((await play.count()) === 1 && (await play.isVisible()) && (await play.isEnabled())) {
          await play.click();
          assert.doesNotMatch(await example.innerText(), /[가-힣]/, `${id} after play`);
        }
        count++;
      }
    }
    assert.equal(count, 77);
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});

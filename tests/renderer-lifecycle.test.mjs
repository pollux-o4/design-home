import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "../design-compare/node_modules/playwright/index.mjs";
import { createStaticServer } from "./support/static-server.mjs";

let browser, server, base;
before(async () => {
  server = createStaticServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch();
});
after(async () => {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
});

test("renderer reports teardown failures and mounts the replacement content", async () => {
  const page = await browser.newPage();
  try {
    await page.goto(`${base}/ui-components/index.html`);
    const result = await page.evaluate(async () => {
      const { createRenderer } = await import("/ui-components/js/canvas-renderer.js");
      const canvasGrid = document.createElement("div");
      const disposed = [];
      const reported = [];
      const definitions = new Map(
        ["first", "second"].map((id) => [
          id,
          {
            id,
            title: id,
            term: id,
            desc: "",
            level: "basic",
            reference: "#",
            render: () => `<div data-sample-id="${id}"></div>`,
          },
        ]),
      );
      const renderer = createRenderer({
        canvasGrid,
        catalog: { find: (id) => definitions.get(id) },
        model: {},
        mount: (sample) => () => {
          disposed.push(sample.dataset.sampleId);
          if (sample.dataset.sampleId === "first") throw new Error("first cleanup failed");
        },
        navigate() {},
        focusSearch() {},
        onError: (error) => reported.push(error),
      });
      renderer.render({ componentId: "first" });
      renderer.render({ componentId: "second" });
      const replacementMounted = Boolean(canvasGrid.querySelector('[data-sample-id="second"]'));
      renderer.reset();
      return {
        replacementMounted,
        disposed,
        reportedCount: reported.length,
        errorCount: reported[0]?.errors.length,
      };
    });
    assert.equal(result.replacementMounted, true);
    assert.deepEqual(result.disposed, ["first", "second"]);
    assert.equal(result.reportedCount, 1);
    assert.equal(result.errorCount, 1);
  } finally {
    await page.close();
  }
});

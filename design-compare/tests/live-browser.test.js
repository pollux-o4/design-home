import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { catalog } from "../src/catalog/index.js";
import { createApplication } from "../src/application.js";

test("gallery opener captures live component and sees later source changes", async () => {
  let color = "red";
  const server = createServer((req, res) => {
    res.setHeader("Content-Type", "text/html");
    const current = req.url === "/gallery" ? color : "red";
    res.end(
      `<button id="open" onclick="document.querySelector('#sample').hidden=false">Open</button><div id="sample" ${req.url === "/gallery" ? "hidden" : ""} style="width:100px;height:50px;background:${current}"></div>`,
    );
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}`,
    store = await mkdtemp(join(tmpdir(), "live-browser-"));
  try {
    await catalog(store).link({
      schemaVersion: 1,
      mode: "live",
      id: "sample",
      title: "Sample",
      category: "controls",
      description: "",
      sources: [],
      capture: {
        url: `${url}/gallery`,
        openSelector: "#open",
        selector: "#sample",
        parts: {},
        viewport: { width: 800, height: 600 },
        theme: "light",
        state: "default",
      },
    });
    const app = createApplication();
    assert.equal(
      (await app.comparePage({ id: "sample", store, url: `${url}/candidate` })).status,
      "pass",
    );
    color = "blue";
    const changed = await app.comparePage({ id: "sample", store, url: `${url}/candidate` });
    assert.equal(changed.status, "fail");
    assert.ok(changed.findings.some((f) => f.property === "background-color"));
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await rm(store, { recursive: true, force: true });
  }
});

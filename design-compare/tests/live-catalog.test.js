import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, readdir, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApplication } from "../src/application.js";

test("AI manifest connects source metadata without capture; new files appear automatically", async () => {
  const root = await mkdtemp(join(tmpdir(), "live-catalog-"));
  try {
    const project = join(root, "project");
    await mkdir(project);
    await writeFile(join(project, "Button.tsx"), "export function Button() { return <button/>; }");
    await writeFile(
      join(project, "button.ui-preview.tsx"),
      "export default { render: () => <Button/> };",
    );
    const app = createApplication({
      capturePage: async () => {
        throw new Error("registration must not render");
      },
    });
    const first = await app.inventory({ project });
    assert.equal(first.candidates.length, 1);
    assert.equal(first.previews.length, 1);
    await writeFile(join(project, "Card.tsx"), "export const Card = () => <div/>;");
    assert.equal((await app.inventory({ project })).candidates.length, 2);
    const manifest = join(root, "manifest.json"),
      store = join(root, "store");
    const record = {
      id: "button",
      title: "추가 버튼",
      category: "controls",
      description: "항목 추가",
      sources: ["Button.tsx"],
      capture: {
        url: "http://localhost:3000/dev-only/compos",
        selector: ".sample",
        openSelector: ".open",
        parts: {},
        viewport: { width: 800, height: 600 },
        theme: "light",
        state: "default",
      },
    };
    await writeFile(manifest, JSON.stringify(record));
    await app.link({ manifest, store });
    assert.deepEqual(await readdir(join(store, "references/button")), ["reference.json"]);
    assert.equal((await app.listReferences({ store })).references[0].mode, "live");
    assert.equal((await app.inspect({ id: "button", store })).title, record.title);
    assert.equal((await app.searchDesigns({ query: "추가", store })).registered.length, 1);
    await assert.rejects(app.link({ manifest, store }), /EEXIST/);
    await writeFile(
      manifest,
      JSON.stringify({ ...record, capture: { ...record.capture, url: "file:///bad" } }),
    );
    await assert.rejects(app.link({ manifest, store }), /HTTP/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

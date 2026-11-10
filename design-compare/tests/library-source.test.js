import test from "node:test";
import assert from "node:assert/strict";
import { createLibrarySource } from "../hub/web/library-source.js";

test("catalog query preserves repeated tags, encodes input, and excludes presentation state", async () => {
  let request;
  const source = createLibrarySource(async (url) => {
    request = url;
    return { results: [] };
  });
  const params = new URLSearchParams("q=미니멀&tag=minimal&tag=dark&view=guide");
  const original = params.toString();
  await source.list("components", params);
  const query = new URL(request, "http://local").searchParams;
  assert.equal(query.get("kind"), "component");
  assert.equal(query.get("q"), "미니멀");
  assert.deepEqual(query.getAll("tag"), ["minimal", "dark"]);
  assert.equal(query.has("view"), false);
  assert.equal(params.toString(), original);
  await source.detail("trends", "a/b");
  assert.equal(request, "/api/context?id=a%2Fb");
});

test("work adapter retains list IDs, filters unavailable references, and normalizes inspect responses", async () => {
  const ready = {
    id: "work-one",
    title: "Sample",
    description: "관리 화면",
    mode: "live",
    status: "ready",
    conditions: { url: "/sample" },
    sources: ["sample.html"],
  };
  const source = createLibrarySource(async (url) =>
    url.includes("?id=")
      ? { ...ready, id: undefined, referenceId: ready.id }
      : {
          references: [
            ready,
            { ...ready, id: "draft", status: "draft" },
            { ...ready, id: "temp", transient: true },
            { ...ready, id: "photo", mode: "snapshot" },
          ],
        },
  );
  const listed = await source.list("work", new URLSearchParams("q=관리"));
  assert.equal(listed.results.length, 1);
  assert.equal(listed.results[0].id, "work-one");
  assert.deepEqual(await source.list("work", new URLSearchParams("q=missing")), { results: [] });
  const detail = await source.detail("work", "work-one");
  assert.equal(detail.id, listed.results[0].id);
  assert.equal(detail.summary, "관리 화면");
  assert.equal(detail.kind, "work");
  assert.equal(detail.previewPath, "/sample");
  assert.deepEqual(detail.sourceFiles, [{ path: "sample.html" }]);
});

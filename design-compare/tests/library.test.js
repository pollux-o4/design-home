import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm, symlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createLibrary, parseDesignDocument } from "../src/library/index.js";

const metadata = {
  schemaVersion: 1,
  id: "fixture",
  title: "테스트 화면",
  summary: "독립 프로젝트 샘플",
  sourcePath: "sample.html",
  previewPath: "/sample.html",
  tags: ["minimal"],
  structure: [],
  interactions: [],
  constraints: [],
  viewport: { width: 800, height: 600 },
};
const doc = (data) =>
  `\`\`\`json\n${JSON.stringify(data)}\n\`\`\`\n\n## 사용 안내\n\n독립 프로젝트의 원본을 사용합니다.\n`;

test("one Markdown source drives search and context outside Design Home and refreshes without restart", async () => {
  const root = await mkdtemp(join(tmpdir(), "design-library-"));
  try {
    const docs = join(root, "docs"),
      source = join(root, "source");
    await mkdir(docs);
    await mkdir(source);
    const path = join(docs, "fixture.md");
    await writeFile(path, doc(metadata));
    await writeFile(join(source, "sample.html"), "<div>External sample</div>");
    const library = createLibrary({ documentsRoot: docs, sourceRoot: source });
    assert.equal(library.search("테스트").results[0].id, "fixture");
    const context = await library.context("fixture");
    assert.equal(context.title, metadata.title);
    assert.match(context.documentation, /사용 안내/);
    assert.equal(context.sourceFiles[0].absolutePath, join(source, "sample.html"));
    await writeFile(path, doc({ ...metadata, title: "수정된 화면" }));
    assert.equal(library.search("수정된").results[0].title, "수정된 화면");
    assert.equal((await library.context("fixture")).title, "수정된 화면");
    await writeFile(join(docs, "duplicate.md"), doc(metadata));
    assert.throws(() => library.search(), /중복 디자인 ID/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("invalid metadata is rejected with its document path", () => {
  assert.throws(() => parseDesignDocument("# No metadata", "bad.md"), /bad.md/);
  assert.throws(
    () => parseDesignDocument(doc({ ...metadata, sourcePath: "../secret" })),
    /상대 경로/,
  );
  assert.throws(
    () => parseDesignDocument(doc({ ...metadata, previewPath: "//external.test" })),
    /같은 서버/,
  );
  for (const previewPath of [
    "/\\external.test/secret",
    "/\n/external.test/secret",
    "/\t/external.test/secret",
  ]) {
    assert.throws(() => parseDesignDocument(doc({ ...metadata, previewPath })), /같은 서버/);
  }
  assert.throws(() => parseDesignDocument(doc({ ...metadata, viewport: {} })), /viewport/);
  assert.throws(
    () => parseDesignDocument(doc({ ...metadata, tags: ["unknown"] })),
    /정의되지 않은/,
  );
});

test("context rejects symlinked source files outside the configured project root", async () => {
  const root = await mkdtemp(join(tmpdir(), "design-source-boundary-"));
  try {
    const sourceRoot = join(root, "source"),
      documentsRoot = join(root, "docs");
    await mkdir(sourceRoot);
    await mkdir(documentsRoot);
    await writeFile(join(root, "private.txt"), "private material");
    await symlink(join(root, "private.txt"), join(sourceRoot, "sample.html"));
    await writeFile(join(documentsRoot, "sample.md"), doc(metadata));
    await assert.rejects(
      createLibrary({ sourceRoot, documentsRoot }).context("fixture"),
      /sourceRoot 내부/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

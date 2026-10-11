import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { chromium } from 'playwright';
import { createHubServer } from '../hub/server.js';
import { createDemoServer } from '../demo/server.js';
const run = promisify(execFile);
let root, store, docs, server, base, prepared, comparison;
async function cli(args, expected = 0) {
  let result;
  try { result = { ...await run(process.execPath, ['src/cli.js', ...args, '--store', store, '--json'], { env: { ...process.env, DESIGN_DOCUMENTS_ROOT: docs }, timeout: 60000 }), code: 0 }; }
  catch (error) { result = error; }
  assert.equal(result.code, expected, result.stdout || result.stderr); assert.equal(result.stderr, ''); return JSON.parse(result.stdout);
}
before(async () => {
  root = await mkdtemp(join(tmpdir(), 'design-workflow-')); store = join(root, 'store'); docs = join(root, 'docs'); await mkdir(docs);
  for (const [id, title, keywords, previewPath] of [
    ['project-card', '프로젝트 카드', ['프로젝트', '카드', '관리'], '/reference'],
    ['project-action', '프로젝트 작업 버튼', ['프로젝트', '추가', '버튼'], '/same'],
    ['other-screen', '사진 갤러리', ['사진', '갤러리'], '/renamed'],
  ]) {
    const metadata = { schemaVersion: 1, id, title, summary: title, sourcePath: 'sample.html', previewPath, tags: ['minimal'], kind: 'component', keywords,
      structure: [], interactions: [], constraints: [], viewport: { width: 800, height: 600 }, capture: { selector: '[data-design-id="box-art"]', parts: { title: '[data-part="title"]' } } };
    await writeFile(join(docs, `${id}.md`), `\`\`\`json\n${JSON.stringify(metadata)}\n\`\`\`\n\n## 사용\n프로젝트 정보를 표시합니다.`);
  }
  server = createDemoServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { await new Promise(resolve => server.close(resolve)); await rm(root, { recursive: true, force: true }); });

test('first-time AI describes its task and receives relevant images and guidance without knowing design IDs', async () => {
  const result = prepared = await cli(['brief', '--intent', '프로젝트를 관리하는 카드와 추가 버튼을 만들려고 해', '--base-url', base]);
  assert.equal(result.status, 'prepared');
  assert.deepEqual(new Set(result.items.map(item => item.id)), new Set(['project-card', 'project-action']));
  assert.ok(result.taskId); assert.ok(result.activity.id);
  for (const item of result.items) {
    assert.ok(item.imagePath.startsWith('/')); assert.equal((await readFile(item.imagePath)).subarray(1,4).toString(), 'PNG');
    assert.ok(item.reasons.length); assert.ok(item.guidance.summary); assert.ok(item.referenceId);
  }
  assert.ok(result.nextActions.some(action => action.argv.includes('compare')));
});


test('AI registers completed work with metadata, compares it and the user sees the exact delivered images in history', async () => {
  const manifest = join(root, 'completed.json');
  await writeFile(manifest, JSON.stringify({ id: 'completed-card', title: '완성한 프로젝트 카드', category: 'project', description: '프로젝트 관리 카드', tags: ['minimal'], keywords: ['프로젝트', '카드', '완성한', '검수'], sources: ['components/card.tsx'],
    capture: { url: `${base}/drift`, selector: '[data-design-id="box-art"]', parts: { title: '[data-part="title"]' }, viewport: { width: 800, height: 600 }, theme: 'light', state: 'default' } }));
  const registered = await cli(['link', '--manifest', manifest, '--task', prepared.taskId]);
  assert.equal(registered.taskId, prepared.taskId);
  comparison = await cli(['compare', '--reference', prepared.items[0].referenceId, '--candidate', registered.referenceId, '--task', prepared.taskId], 1);
  assert.equal(comparison.status, 'fail'); assert.equal(comparison.taskId, prepared.taskId);
  assert.ok(comparison.evidence.images.reference); assert.ok(comparison.evidence.images.candidate); assert.ok(comparison.evidence.images.diff);
  const hub = createHubServer({ store }); await new Promise(resolve => hub.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch(), page = await browser.newPage(), hubUrl = `http://127.0.0.1:${hub.address().port}`;
  try {
    await page.route('https://**/*', route => route.abort());
    await page.goto(`${hubUrl}/#/activity`);
    await page.getByRole('heading', { name: '최근 AI 호출', exact: true }).waitFor();
    const entry = page.locator(`[data-activity-id="${comparison.activity.id}"]`);
    await entry.getByRole('link', { name: '기록 보기', exact: true }).click();
    await entry.getByRole('img', { name: '개발 화면', exact: true }).waitFor();
    const response = await page.request.get(`${hubUrl}/api/activity/${comparison.activity.id}`);
    const stored = await response.json(); assert.deepEqual(stored.output, comparison);
    for (const image of stored.images) {
      const downloaded = await page.request.get(`${hubUrl}/api/activity/${stored.id}/files/${image.name}`);
      assert.deepEqual(await downloaded.body(), await readFile(image.path));
    }
    await page.getByRole('button', { name: '목록으로', exact: true }).click();
    await page.locator('#activity-list .activity-card').first().waitFor();
    assert.equal(await page.locator('#activity-list [data-activity-id]').count(), 3);
    const briefEntry = page.locator(`[data-activity-id="${prepared.activity.id}"]`);
    await briefEntry.getByRole('link', { name: '기록 보기', exact: true }).click();
    await briefEntry.locator('img').first().waitFor();
    assert.equal(await briefEntry.locator('img').count(), 2);
    const history = await cli(['history']); assert.equal(history.entries.length, 3, 'reading history is not an AI work event');
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  } finally { await browser.close(); await new Promise(resolve => hub.close(resolve)); }
});


test('new work is discoverable by intent; no-match, failures and the last ten calls remain honest', async () => {
  const reused = await cli(['brief', '--intent', '완성한 카드 검수', '--base-url', base, '--limit', '1']);
  assert.equal(reused.items[0].id, 'completed-card');
  assert.equal(reused.items[0].origin, 'registered');
  const missing = await cli(['brief', '--intent', '우주선 엔진 설계', '--base-url', base]);
  assert.equal(missing.status, 'no-match'); assert.deepEqual(missing.items, []); assert.ok(missing.capabilities.length);
  const error = await cli(['compare', '--reference', prepared.items[0].referenceId, '--url', `${base}/same`, '--selector', '#does-not-exist'], 2);
  assert.equal(error.status, 'error'); assert.ok(error.activity.id);
  const calls = [];
  for (let index = 0; index < 11; index++) calls.push(await cli(['search', '--query', `호출-${index}`]));
  const history = await cli(['history']);
  assert.equal(history.entries.length, 10);
  assert.equal(history.entries[0].id, calls[10].activity.id);
  assert.equal(history.entries.at(-1).id, calls[1].activity.id);
  assert.ok(!history.entries.some(entry => entry.id === calls[0].activity.id));
});

test('the shipped library answers a first-time request for an input modal with a real component image', async () => {
  const env = { ...process.env }; delete env.DESIGN_DOCUMENTS_ROOT;
  const output = await run(process.execPath, ['src/cli.js', 'brief', '--intent', '새 프로젝트를 추가할 입력 폼 모달', '--base-url', base, '--limit', '2', '--store', join(root, 'shipped-store'), '--json'], { env, timeout: 60000 });
  const result = JSON.parse(output.stdout);
  assert.equal(result.status, 'prepared');
  assert.ok(result.items.some(item => item.id === 'component-modal'));
  assert.ok(result.items.every(item => item.guidance.summary && item.imagePath));
});

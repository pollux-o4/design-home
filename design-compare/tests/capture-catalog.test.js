import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { catalog } from '../src/catalog/index.js';
import { validateCapture } from '../src/capture/contract.js';

async function withCatalog(run) {
  const root = await mkdtemp(join(tmpdir(), 'compare-catalog-'));
  try { await run(catalog(root), root); }
  finally { await rm(root, { recursive: true, force: true }); }
}

test('artifact publishing preserves caller projections and rejects path escapes', async () => {
  await withCatalog(async (repository, root) => {
    const directory = await repository.publish('box-art', { 'repair.json': '{"custom":true}', 'reference.png': Buffer.from('image') });
    assert.equal(await readFile(join(directory, 'repair.json'), 'utf8'), '{"custom":true}');
    await assert.rejects(repository.publish('box-art', { '../escape.txt': 'no' }), /파일명/);
    assert.equal((await readdir(join(root, 'reports'))).length, 1);
  });
});

test('failed parallel publication cleans all staging writers before returning', async () => {
  await withCatalog(async (repository, root) => {
    await assert.rejects(repository.publish('box-art', { 'large.bin': Buffer.alloc(1024 * 1024), 'invalid.bin': null }));
    assert.deepEqual(await readdir(join(root, 'reports')), []);
  });
});

test('capture options reject reserved mappings and unsupported interaction states', () => {
  const options = { url: 'http://localhost:3000', selector: 'main', state: 'default', theme: 'light', viewport: { width: 1280, height: 900 }, parts: {} };
  assert.doesNotThrow(() => validateCapture(options));
  assert.throws(() => validateCapture({ ...options, parts: { $root: 'main' } }), /예약/);
  assert.throws(() => validateCapture({ ...options, state: 'pressed' }), /상태/);
});

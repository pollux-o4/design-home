import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { PNG } from 'pngjs';
import { createApplication } from '../src/application.js';
import { runCli } from '../src/cli/index.js';
import { FILES } from '../src/domain/artifacts.js';
import { STYLE_PROPERTIES } from '../src/capture/contract.js';

const conditions = { url: 'http://localhost/reference', selector: '.box', parts: {},
  viewport: { width: 390, height: 844 }, theme: 'light', state: 'default', browserVersion: 'test-browser' };
const part = { selector: '.box', classes: ['box'], source: null, bounds: { x: 0, y: 0, width: 1, height: 1 },
  styles: Object.fromEntries(STYLE_PROPERTIES.map(property => [property, property === 'color' ? 'rgb(0, 0, 0)' : ''])),
  pseudo: { '::before': { content: 'none' }, '::after': { content: 'none' } } };
const snapshot = { parts: { $root: part } };
const png = PNG.sync.write(new PNG({ width: 1, height: 1 }));

test('application uses injected browser/repository adapters and publishes one authoritative report', async () => {
  let publication, captured;
  const repository = {
    load: async () => ({ schemaVersion: 1, id: 'box', capture: conditions, snapshot, imagePath: '/memory/reference.png' }),
    publish: async (id, artifacts) => { publication = { id, artifacts }; return '/memory/report'; },
  };
  const app = createApplication({ repositoryFor: () => repository, read: async () => png, now: () => 'fixed-time',
    capturePage: async options => { captured = options; return { capture: options, snapshot, png }; } });
  const result = await app.comparePage({ id: 'box', url: 'http://localhost/new' });
  assert.equal(result.status, 'pass');
  assert.equal(captured.url, 'http://localhost/new');
  assert.deepEqual(captured.viewport, conditions.viewport);
  const report = JSON.parse(publication.artifacts[FILES.report]);
  assert.equal(report.createdAt, 'fixed-time');
  assert.equal(Object.hasOwn(report, 'repair'), false, 'findings are authoritative; repair is a derived projection');
  assert.deepEqual(JSON.parse(publication.artifacts[FILES.repair]).parts, result.repair);
  assert.match(publication.artifacts[FILES.html], /검사 통과/);
});

test('read queries never require a browser and damaged baseline evidence fails before capture', async () => {
  let captures = 0;
  const repository = { list: async () => [], load: async () => ({ capture: conditions, snapshot, imagePath: 'missing.png' }) };
  const app = createApplication({ repositoryFor: () => repository, capturePage: async () => { captures++; },
    read: async () => { throw Object.assign(new Error('missing image'), { code: 'ENOENT' }); } });
  assert.deepEqual((await app.listReferences({})).references, []);
  assert.deepEqual(Object.keys((await app.inspect({ id: 'box', part: '$root' })).parts), ['$root']);
  await assert.rejects(app.comparePage({ id: 'box', url: 'http://localhost/new' }), /missing image/);
  assert.equal(captures, 0);
});

test('Command dispatcher preserves machine error channel and store recovery through adapters', async () => {
  const store = await mkdtemp(join(tmpdir(), 'cli-recovery-'));
  const stdout = [], stderr = [];
  const app = { inspect: async () => { throw Object.assign(new Error('missing'), { code: 'ENOENT' }); } };
  const exit = await runCli(['inspect', '--reference', 'box', '--store', store, '--json'], {
    app, stdout: value => stdout.push(value), stderr: value => stderr.push(value),
  });
  assert.equal(exit, 2);
  assert.deepEqual(stderr, []);
  const error = JSON.parse(stdout[0]);
  assert.equal(error.code, 'REFERENCE_NOT_FOUND');
  assert.ok(error.recovery.argv.includes(store));
  await rm(store, { recursive: true, force: true });
});

test('invalid stored report is rejected rather than partially inspected', async () => {
  const app = createApplication({ read: async () => JSON.stringify({ schemaVersion: 1, referenceId: 'box', status: 'pass' }) });
  await assert.rejects(app.inspect({ reportPath: '/bad/report.json' }), error => error.code === 'INVALID_RECORD');
});

test('live reference renders anew for every comparison without reading baseline images', async () => {
  const captures = [];
  const repository = {
    load: async () => ({ id: 'live-box', mode: 'live', capture: { ...conditions, openSelector: '.open-sample' } }),
    publish: async () => '/memory/report',
  };
  const app = createApplication({ repositoryFor: () => repository,
    read: async () => { throw new Error('live comparison must not read stored images'); },
    capturePage: async options => { captures.push(options); return { capture: options, snapshot, png }; } });
  for (let index = 0; index < 2; index++) {
    const result = await app.comparePage({ id: 'live-box', url: 'http://localhost/new' });
    assert.equal(result.status, 'pass');
    assert.equal(result.referenceMode, 'live');
  }
  assert.equal(captures.length, 4);
  assert.equal(captures[0].openSelector, '.open-sample');
  assert.equal(captures[1].openSelector, undefined);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { auditMotion } from '../src/audit/motion.js';
import { runCli } from '../src/cli/index.js';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('motion audit reports instant change, observed transition and no visible change separately', async () => {
  const server = createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(`<!doctype html><style>#panel{width:300px;height:200px;background:red} #panel.move{transition:background-color .2s} #panel.changed{background:blue}</style>
      <button id="action" onclick="${request.url === '/none' ? '' : `document.querySelector('#panel').classList.add('${request.url === '/animated' ? 'move\',\'changed' : 'changed'}')`}">변경</button><div id="panel"></div>`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    assert.equal((await auditMotion({ url: `${base}/instant`, action: '#action' })).status, 'review');
    const animated = await auditMotion({ url: `${base}/animated`, action: '#action' });
    assert.equal(animated.status, 'motion-observed');
    assert.ok(animated.events.some(event => event.type === 'transitionrun'));
    assert.equal((await auditMotion({ url: `${base}/none`, action: '#action' })).status, 'inconclusive');
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('CLI returns review and persists both screenshots without embedding image bytes', async () => {
  const store = await mkdtemp(join(tmpdir(), 'motion-audit-'));
  const stdout = [];
  try {
    const exit = await runCli(['motion', '--url', 'http://localhost/', '--action', '#link', '--store', store, '--json'], {
      app: { auditMotion: async () => ({ status: 'review', changeRatio: 0.5, events: [], screenshots: { before: Buffer.from('before'), after: Buffer.from('after') } }) },
      stdout: value => stdout.push(JSON.parse(value)),
    });
    assert.equal(exit, 0);
    assert.equal(stdout[0].status, 'review');
    assert.equal(stdout[0].screenshots, undefined);
    assert.equal(await readFile(stdout[0].evidence.images.before, 'utf8'), 'before');
    assert.equal(await readFile(stdout[0].evidence.images.after, 'utf8'), 'after');
  } finally { await rm(store, { recursive: true, force: true }); }
});

test('a link hover animation is not mistaken for the destination screen transition', async () => {
  const server = createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(request.url === '/next' ? '<h1>다른 화면</h1>' : '<style>a{display:block;padding:30px;background:red;transition:background-color .2s}a:hover{background:blue}</style><a href="/next">이동</a>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const result = await auditMotion({ url: `http://127.0.0.1:${server.address().port}/`, action: 'a' });
    assert.equal(result.status, 'review');
    assert.match(result.finalUrl, /\/next$/);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

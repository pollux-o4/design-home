import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { auditMotion } from '../src/audit/motion.js';
import { compareFrames } from '../src/audit/motion-evidence.js';
import { motionScenario } from '../src/audit/motion-scenario.js';
import { PNG } from 'pngjs';
import { runCli } from '../src/cli/index.js';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('motion scenarios can choose a project locale and time zone', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'motion-locale-'));
  try {
    const scenario = join(dir, 'scenario.json');
    await writeFile(scenario, JSON.stringify({ schemaVersion: 1, url: 'https://example.com', action: { type: 'click', selector: '#go' }, locale: 'en-US', timezoneId: 'America/New_York' }));
    const result = await motionScenario({ scenario });
    assert.equal(result.locale, 'en-US');
    assert.equal(result.timezoneId, 'America/New_York');
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('transient movement returning to the original frame is still observed', () => {
  const frame = value => {
    const png = new PNG({ width: 20, height: 20 });
    for (let i = 0; i < png.data.length; i += 4) { png.data[i] = value; png.data[i + 3] = 255; }
    return PNG.sync.write(png);
  };
  const before = frame(0), middle = frame(255);
  assert.equal(compareFrames([before, middle, before], 'motion', [], before).status, 'motion-observed');
  assert.equal(compareFrames([before, middle, before], 'instant', [], before).status, 'review');
});

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
    const animated = await auditMotion({ url: `${base}/animated`, action: '#action', region: '#panel' });
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

test('strict project policy distinguishes a failed requirement from insufficient evidence', async () => {
  const store = await mkdtemp(join(tmpdir(), 'motion-policy-'));
  try {
    for (const [status, expectedExit] of [['review', 1], ['inconclusive', 2], ['motion-observed', 0]]) {
      const exit = await runCli(['motion', '--scenario', 'project.json', '--strict', '--store', store, '--json'], {
        app: { auditMotion: async () => ({ status, expectation: 'motion', changeRatio: 0.5, events: [], screenshots: { before: Buffer.from('before'), after: Buffer.from('after') } }) },
        stdout: () => {},
      });
      assert.equal(exit, expectedExit, status);
    }
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

test('project scenario observes JavaScript frames after a keyboard action and saves intermediate evidence', async () => {
  const server = createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(`<!doctype html><button id="action" onclick="let n=0;const timer=setInterval(()=>{n++;document.querySelector('#panel').style.backgroundColor='rgb('+Math.min(n*35,245)+',0,0)';if(n===7)clearInterval(timer)},120)">실행</button><div id="panel" style="width:260px;height:180px;background:rgb(0,0,0)"></div>`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const store = await mkdtemp(join(tmpdir(), 'motion-scenario-'));
  try {
    const scenario = join(store, 'scenario.json');
    await writeFile(scenario, JSON.stringify({ schemaVersion: 1, url: `http://127.0.0.1:${server.address().port}/`, action: { type: 'press', selector: '#action', key: 'Enter' }, region: '#panel', expectation: 'motion', expected: { selector: '#panel', state: 'visible' }, observationMs: 1200 }));
    const output = [];
    const exit = await runCli(['motion', '--scenario', scenario, '--store', store, '--json'], { stdout: value => output.push(JSON.parse(value)) });
    assert.equal(exit, 0);
    assert.equal(output[0].status, 'motion-observed');
    assert.equal(output[0].evidence.visualProgress, true);
    assert.equal(output[0].coverage.frameSamples, 6);
    assert.ok((await readFile(output[0].evidence.images['frame-3'])).length > 0);
  } finally { await rm(store, { recursive: true, force: true }); await new Promise(resolve => server.close(resolve)); }
});

test('scenario supports hover and treats history navigation conservatively', async () => {
  const server = createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(request.url === '/next' ? '<h1>다음</h1>' : '<style>#panel{width:250px;height:100px;background:red;transition:background .4s}#action:hover + #panel{background:blue}</style><button id="action" onclick="document.querySelector(\'#panel\').style.background=\'green\'">실행</button><div id="panel"></div>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const dir = await mkdtemp(join(tmpdir(), 'motion-input-'));
  try {
    const url = `http://127.0.0.1:${server.address().port}/`, scenario = join(dir, 'scenario.json');
    await writeFile(scenario, JSON.stringify({ schemaVersion: 1, url, action: { type: 'hover', selector: '#action' }, region: '#panel', expectation: 'motion' }));
    const hover = await auditMotion({ scenario });
    assert.equal(hover.status, 'motion-observed');
    assert.ok(hover.evidence.attributedEvents > 0);
    await writeFile(scenario, JSON.stringify({ schemaVersion: 1, url, history: [`${url}next`], action: { type: 'back' }, expectation: 'instant' }));
    const back = await auditMotion({ scenario });
    assert.equal(back.status, 'inconclusive');
    assert.equal(back.finalUrl, url);
  } finally { await rm(dir, { recursive: true, force: true }); await new Promise(resolve => server.close(resolve)); }
});

test('ambient animation is not counted as a response to an action that changes nothing', async () => {
  const server = createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end('<style>#ambient{width:100%;height:400px;animation:glow .4s infinite alternate}@keyframes glow{from{background:red}to{background:blue}}</style><button id="action">실행</button><div id="ambient"></div>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const result = await auditMotion({ url: `http://127.0.0.1:${server.address().port}/`, action: '#action' });
    assert.equal(result.status, 'inconclusive');
    assert.ok(result.evidence.baselineChangeRatio > 0.1);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { auditContrast } from '../src/audit/contrast.js';

test('contrast audit checks each opened state in both themes and reports failures', async () => {
  const server = createServer((request, response) => response.end(`<!doctype html><style>.bad{color:#aaa;background:#fff}.good{color:#111;background:#fff}</style><button class="open" onclick="document.querySelector('#panel').innerHTML='<p class=bad>Low contrast</p>'">First</button><button class="open" onclick="document.querySelector('#panel').innerHTML='<p class=good>Readable</p>'">Second</button><main id="panel"></main>`));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const dir = await mkdtemp(join(tmpdir(), 'contrast-test-'));
  try {
    const scenario = join(dir, 'scenario.json');
    await writeFile(scenario, JSON.stringify({ schemaVersion: 1, url: `http://127.0.0.1:${server.address().port}`, themes: ['light', 'dark'], openEach: '.open', scope: '#panel' }));
    const result = await auditContrast({ scenario, strict: true });
    assert.equal(result.status, 'fail');
    assert.equal(result.summary.checked, 4);
    assert.equal(result.findings.length, 2);
    assert.ok(result.findings.every(item => item.state === 'First' && item.rule === 'color-contrast'));
  } finally { await rm(dir, { recursive: true, force: true }); await new Promise(resolve => server.close(resolve)); }
});

test('contrast audit examines an optional action after opening a state', async () => {
  const server = createServer((request, response) => response.end(`<!doctype html><main><p id="message" style="color:#111;background:#fff">Ready</p><button onclick="document.querySelector('#message').style.color='#aaa'">Change</button></main>`));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const dir = await mkdtemp(join(tmpdir(), 'contrast-actions-'));
  try {
    const scenario = join(dir, 'scenario.json');
    await writeFile(scenario, JSON.stringify({ schemaVersion: 1, url: `http://127.0.0.1:${server.address().port}`, themes: ['light'], scope: 'main', afterEach: 'button' }));
    const result = await auditContrast({ scenario, strict: true });
    assert.equal(result.summary.checked, 2);
    assert.equal(result.status, 'fail');
    assert.equal(result.findings[0].state, 'default · Change');
  } finally { await rm(dir, { recursive: true, force: true }); await new Promise(resolve => server.close(resolve)); }
});

test('project can connect and verify its own theme controls', async () => {
  const server = createServer((request, response) => response.end(`<!doctype html><html data-appearance="day"><button id="night" onclick="document.documentElement.dataset.appearance='night'">Night</button><main><p style="color:#111;background:white">Readable</p></main></html>`));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const dir = await mkdtemp(join(tmpdir(), 'contrast-theme-'));
  try {
    const scenario = join(dir, 'scenario.json');
    await writeFile(scenario, JSON.stringify({ schemaVersion: 1, url: `http://127.0.0.1:${server.address().port}`, themes: ['dark'], scope: 'main', themeControls: { dark: '#night' }, themeVerification: { selector: 'html', attribute: 'data-appearance', values: { dark: 'night' } } }));
    const result = await auditContrast({ scenario });
    assert.equal(result.status, 'pass');
    assert.equal(result.target.themeEvidence, 'verified');
  } finally { await rm(dir, { recursive: true, force: true }); await new Promise(resolve => server.close(resolve)); }
});

test('a project attribute is not interpreted as a theme contract unless configured', async () => {
  const server = createServer((request, response) => response.end('<!doctype html><html data-theme="dark"><main style="background:#fff;color:#111">Readable content</main></html>'));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const dir = await mkdtemp(join(tmpdir(), 'contrast-contract-'));
  try {
    const scenario = join(dir, 'scenario.json');
    await writeFile(scenario, JSON.stringify({ schemaVersion: 1, url: `http://127.0.0.1:${server.address().port}`, themes: ['light'], scope: 'main' }));
    const result = await auditContrast({ scenario });
    assert.equal(result.status, 'pass');
    assert.equal(result.target.themeEvidence, 'browser-preference');
  } finally { await rm(dir, { recursive: true, force: true }); await new Promise(resolve => server.close(resolve)); }
});

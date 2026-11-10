import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { auditLocalization } from '../src/audit/localization.js';

test('language audit catches untranslated content even when the selected language changes', async () => {
  const server = createServer((request, response) => { response.setHeader('Content-Type', 'text/html; charset=utf-8'); response.end('<!doctype html><html lang="ko"><button id="en" onclick="document.documentElement.lang=\'en\'">EN</button><main>한국어 본문</main></html>'); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const dir = await mkdtemp(join(tmpdir(), 'localization-test-'));
  try {
    const scenario = join(dir, 'scenario.json');
    await writeFile(scenario, JSON.stringify({ schemaVersion: 1, url: `http://127.0.0.1:${server.address().port}`, scope: 'main', languages: [{ code: 'en', control: '#en', rejectPattern: '[가-힣]' }] }));
    const result = await auditLocalization({ scenario, strict: true });
    assert.equal(result.status, 'fail');
    assert.ok(result.findings.some(item => item.kind === 'untranslated-text' && item.state === 'selected'));
    assert.ok(result.findings.some(item => item.kind === 'document-language' && item.state === 'reloaded'));
  } finally { await rm(dir, { recursive: true, force: true }); await new Promise(resolve => server.close(resolve)); }
});

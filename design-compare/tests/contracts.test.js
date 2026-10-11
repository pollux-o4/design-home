import test from 'node:test';
import assert from 'node:assert/strict';
import { assertReference } from '../src/domain/records.js';
import { STYLE_PROPERTIES } from '../src/capture/contract.js';
import { compareParts } from '../src/comparison/rules.js';
import { repairPlan } from '../src/comparison/review.js';
import { runCli } from '../src/cli/index.js';

function reference() {
  return { schemaVersion: 1, id: 'box', capture: { url: 'http://localhost/box', selector: 'main', parts: {},
    viewport: { width: 390, height: 844 }, theme: 'light', state: 'default' },
    snapshot: { parts: { $root: { selector: 'main', classes: [], bounds: { x: 0, y: 0, width: 10, height: 10 },
      styles: Object.fromEntries(STYLE_PROPERTIES.map(property => [property, ''])),
      pseudo: { '::before': { content: 'none' }, '::after': { content: 'none' } } } } } };
}

test('persisted evidence must contain exactly the registered mappings and measured style contract', () => {
  assert.equal(assertReference(reference(), 'box').id, 'box');
  for (const mutate of [
    record => { record.capture.parts.title = 'h2'; },
    record => { delete record.snapshot.parts.$root.styles.color; },
    record => { record.snapshot.parts.$root.pseudo = {}; },
    record => { record.snapshot.parts.$root.selector = '.wrong'; },
  ]) {
    const record = reference(); mutate(record);
    assert.throws(() => assertReference(record, 'box'), error => error.code === 'INVALID_RECORD');
  }
});

test('illegal mapping names fail before invoking the application', async () => {
  let executed = false;
  const output = [];
  const exit = await runCli(['register', '--id', 'box', '--url', 'http://localhost/box', '--selector', 'main', '--part', '__proto__=h2', '--json'], {
    app: { register: async () => { executed = true; } }, stdout: text => output.push(text),
  });
  assert.equal(exit, 2);
  assert.equal(executed, false);
  assert.equal(JSON.parse(output[0]).code, 'INVALID_ARGUMENT');
});

test('legal names matching Object prototype members are treated as explicit mappings only', () => {
  const part = reference().snapshot.parts.$root;
  const findings = compareParts({}, { constructor: part }, []);
  assert.deepEqual(findings, [{ part: 'constructor', kind: 'mapping', property: 'presence', expected: false, actual: true, allowed: false }]);
  const groups = repairPlan({ reference: { snapshot: { parts: {} } }, candidate: { snapshot: { parts: { constructor: part } } }, findings });
  assert.equal(groups[0].reference, null);
  assert.equal(groups[0].candidate.selector, 'main');
});

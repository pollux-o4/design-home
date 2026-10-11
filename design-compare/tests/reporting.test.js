import test from 'node:test';
import assert from 'node:assert/strict';
import { createReportArtifacts } from '../src/reporting/artifacts.js';
import { projectReport } from '../src/reporting/projection.js';

function reportFixture() {
  const part = { selector: '.box', classes: ['box'], bounds: { x: 0, y: 0, width: 100, height: 40 } };
  return {
    schemaVersion: 1, referenceId: 'box', status: 'fail',
    conditions: { viewport: { width: 1000, height: 700 }, theme: 'light', state: 'default' },
    reference: { url: 'http://localhost/reference', snapshot: { parts: { $root: part } } },
    candidate: { url: 'http://localhost/candidate', snapshot: { parts: { $root: part, extra: part } } },
    findings: [
      { part: '$root', kind: 'style', property: 'color', actual: 'red', expected: 'blue', allowed: true },
      { part: 'extra', kind: 'mapping', property: 'element', actual: 'present', expected: 'absent', allowed: false },
    ],
    summary: { violations: 1, allowedDifferences: 1 },
    visual: { referenceSize: { width: 100, height: 40 }, candidateSize: { width: 120, height: 40 }, ratio: 0.1, budget: 0.01, withinBudget: false },
    policy: { ignore: ['color'], pixelBudget: 0.01 }, review: { required: true },
  };
}

test('artifact generation retains evidence and shares repair targets across human and AI views', () => {
  const report = reportFixture();
  const image = Buffer.from('png evidence');
  const artifacts = createReportArtifacts(report, { 'reference.png': image });
  assert.equal(artifacts['reference.png'], image);
  assert.deepEqual(JSON.parse(artifacts['report.json']), report);
  const repair = JSON.parse(artifacts['repair.json']);
  assert.deepEqual(repair.parts.filter(part => part.violations).map(part => part.part), ['extra']);
  assert.deepEqual(projectReport(report).actionable, ['extra']);
  assert.match(artifacts['index.html'], /data-select-part="extra"/);
  assert.doesNotMatch(artifacts['index.html'], /data-select-part="\$root"/);
  assert.match(artifacts['index.html'], /data-part="\$root" data-allowed="true" hidden/);
  assert.match(artifacts['index.html'], /--comparison-width:120px/);
  assert.equal(report.repair, undefined, 'artifact generation must not mutate the report');
});

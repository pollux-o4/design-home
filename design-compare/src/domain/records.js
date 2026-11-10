import { isIdentifier } from './identifiers.js';
import { STYLE_PROPERTIES, validateCapture, validateConditions } from './capture-contract.js';

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string';
const strings = value => object(value) && Object.values(value).every(text);
const url = value => {
  try { const parsed = new URL(value); return ['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password; }
  catch { return false; }
};

function assert(condition, message) {
  if (!condition) throw Object.assign(new Error(message), { code: 'INVALID_RECORD' });
}

function assertSnapshot(snapshot) {
  assert(object(snapshot?.parts) && Object.hasOwn(snapshot.parts, '$root'), '유효한 컴포넌트 측정 자료 필요');
  for (const [key, part] of Object.entries(snapshot.parts)) {
    assert(key === '$root' || isIdentifier(key), '잘못된 부분 이름');
    assert(object(part) && text(part.selector) && Array.isArray(part.classes) && part.classes.every(text), '유효한 부분 매핑 필요');
    assert(part.source === null || part.source === undefined || text(part.source), '유효한 소스 위치 필요');
    assert(object(part.bounds) && ['x', 'y', 'width', 'height'].every(key => Number.isFinite(part.bounds[key])) && part.bounds.width >= 0 && part.bounds.height >= 0, '유효한 측정 좌표 필요');
    assert(strings(part.styles) && STYLE_PROPERTIES.every(property => Object.hasOwn(part.styles, property)), '필수 CSS 측정값 누락');
    assert(object(part.pseudo) && ['::before', '::after'].every(name => {
      const values = part.pseudo[name];
      return strings(values) && text(values.content) && (['none', 'normal'].includes(values.content) || STYLE_PROPERTIES.every(property => Object.hasOwn(values, property)));
    }), '필수 의사 요소 측정값 누락');
  }
}

function assertConditions(conditions) {
  try { validateConditions(conditions); }
  catch (error) { throw Object.assign(error, { code: 'INVALID_RECORD' }); }
}

export function assertReference(record, id) {
  assert(record?.schemaVersion === 1 && record.id === id && isIdentifier(record.id), '지원하지 않거나 손상된 기준 자료');
  try { validateCapture(record.capture); }
  catch (error) { throw Object.assign(error, { code: 'INVALID_RECORD' }); }
  assertSnapshot(record.snapshot);
  const expected = ['$root', ...Object.keys(record.capture.parts)];
  assert(Object.keys(record.snapshot.parts).length === expected.length && expected.every(key => Object.hasOwn(record.snapshot.parts, key)), '기준 매핑과 측정된 부분 집합 불일치');
  assert(record.snapshot.parts.$root.selector === record.capture.selector && Object.entries(record.capture.parts).every(([key, selector]) => record.snapshot.parts[key].selector === selector), '기준 선택자와 측정 자료 불일치');
  return record;
}

export function assertReport(report) {
  assert(report?.schemaVersion === 1 && isIdentifier(report.referenceId) && ['pass', 'fail'].includes(report.status), '유효한 report.json 필요');
  assertConditions(report.conditions);
  for (const side of ['reference', 'candidate']) {
    assert(url(report[side]?.url) && text(report[side]?.selector), '유효한 비교 대상 필요');
    assertSnapshot(report[side].snapshot);
  }
  assert(Array.isArray(report.findings) && report.findings.every(f => object(f) && text(f.part) && ['mapping', 'style', 'geometry', 'pseudo'].includes(f.kind) && text(f.property) && typeof f.allowed === 'boolean'), '유효한 비교 차이 필요');
  assert(object(report.summary) && ['violations', 'allowedDifferences'].every(key => Number.isInteger(report.summary[key]) && report.summary[key] >= 0), '유효한 비교 요약 필요');
  assert(object(report.visual) && Number.isFinite(report.visual.ratio) && report.visual.ratio >= 0 && report.visual.ratio <= 1 && object(report.policy) && Array.isArray(report.policy.ignore), '유효한 비교 정책·픽셀 결과 필요');
  return report;
}

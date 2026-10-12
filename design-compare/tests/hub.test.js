import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { searchDesigns, getDesignContext } from '../src/hub/index.js';
import { runCli } from '../src/cli/index.js';

test('intent search ranks explicit design facets and explains evidence without invented matches', () => {
  const result = searchDesigns('정보가 많은 관리 화면');
  assert.equal(result.results[0].id, 'material-design');
  assert.ok(result.results[0].reasons.some(reason => reason.matched === '관리'));
  assert.equal(searchDesigns('블로그 글 상세').results.length, 0);
  const minimal = searchDesigns('차분하고 미니멀한 화면').results;
  assert.equal(minimal.length, 7);
  for (const id of ['component-form-validation', 'component-password-field', 'component-searchable-list', 'component-error-retry']) assert.ok(minimal.some(item => item.id === id));
  assert.ok(searchDesigns('강렬한 타이포그래피').results.some(item => item.id === 'kinetic-typography'));
  assert.equal(searchDesigns('').results.filter(item => item.kind === 'trend').length, 15);
  assert.ok(searchDesigns('').results.some(item => item.id === 'component-modal'));
});

test('design context resolves every real stylesheet and script and bounds emitted source', async () => {
  const result = await getDesignContext('material-design');
  assert.ok(result.sourceFiles.some(file => file.path.endsWith('01-design-tokens.css')));
  assert.ok(result.sourceFiles.some(file => file.path.endsWith('example-interactions.js')));
  assert.ok(result.interactions.includes('프로젝트 생성 모달'));
  assert.ok(result.budget.emittedCharacters <= result.budget.maxCharacters);
  assert.ok(result.sourceFiles.some(file => file.truncated));
  assert.ok(result.sourceFiles.every(file => file.text.length > 0));
  await Promise.all(result.sourceFiles.map(file => access(file.absolutePath)));
  assert.equal(result.dependencies.local.length, result.sourceFiles.length);
  await assert.rejects(getDesignContext('../missing'), error => error.code === 'DESIGN_NOT_FOUND');
});

test('CLI exposes search/context with honest no match and structured invalid ID', async () => {
  const outputs = [], stdout = value => outputs.push(JSON.parse(value));
  assert.equal(await runCli(['search', '--query', '블로그 글 상세', '--json'], { stdout }), 0);
  assert.deepEqual(outputs.at(-1).results, []);
  assert.equal(await runCli(['context', '--id', 'material-design', '--json'], { stdout }), 0);
  assert.ok(outputs.at(-1).sourceFiles.length > 5);
  assert.equal(await runCli(['context', '--id', 'missing', '--json'], { stdout }), 2);
  assert.equal(outputs.at(-1).code, 'DESIGN_NOT_FOUND');
});

test('fixed tag registry rejects unknown/duplicate IDs and shares labels and aliases', async () => {
  const { Tag, TAGS, validateTags, resolveTagIds } = await import('../src/hub/tags.js');
  assert.throws(() => validateTags(['typo']), /정의되지 않은/);
  assert.throws(() => validateTags([Tag.MINIMAL, Tag.MINIMAL]), /중복/);
  assert.throws(() => validateTags(['constructor']), /정의되지 않은/);
  assert.equal(Object.isFrozen(TAGS[Tag.MINIMAL].aliases), true);
  assert.deepEqual(resolveTagIds('심플'), [Tag.MINIMAL]);
  assert.deepEqual(resolveTagIds('미니멀한'), [Tag.MINIMAL]);
  assert.deepEqual(searchDesigns('minimal').results.map(x=>x.id), searchDesigns('심플').results.map(x=>x.id));
  assert.equal(searchDesigns('미니멀 심플 간결').results[0].score, 1);
  for (const result of searchDesigns('').results) {
    assert.deepEqual(result.tagDetails.map(tag=>tag.id), [...result.tags]);
    assert.deepEqual(result.intent, result.tagDetails.map(tag=>tag.label));
    for (const tag of result.tagDetails) assert.equal(tag, TAGS[tag.id]);
  }
});

test('related tags come from current results and explicit filters intersect', () => {
  const result = searchDesigns('정보가 많은 관리 화면');
  assert.ok(result.recognizedTags.some(tag=>tag.id === 'admin'));
  assert.ok(result.relatedTags.some(tag=>tag.id === 'minimal' && tag.count === 1));
  const filtered = searchDesigns('정보가 많은 관리 화면',['minimal']);
  assert.deepEqual(filtered.results.map(x=>x.id), ['flat-design']);
  assert.equal(filtered.selectedTags[0].id,'minimal');
  assert.equal(filtered.relatedTags.some(tag=>tag.id === 'minimal'),false);
  assert.deepEqual(searchDesigns('우주엔진').relatedTags,[]);
  assert.throws(()=>searchDesigns('', ['invalid']), /정의되지 않은/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createStaticServer } from '../../tests/support/static-server.mjs';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

test('Pages landing → library → filtered detail → interactive preview and restored deep link', async () => {
  const root = resolve('..');
  const server = createStaticServer({ prefix: '/design-home/' });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/design-home/`;
  const browser = await chromium.launch(), page = await browser.newPage(); page.setDefaultTimeout(5000);
  const errors = [], failures = [], apiRequests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) failures.push(response.url()); });
  page.on('request', request => { if (new URL(request.url()).pathname.includes('/api/')) apiRequests.push(request.url()); });
  await page.route('https://**/*', route => route.abort());
  try {
    await page.goto(base); await page.locator('.hub-card').filter({ hasText: 'Design Library' }).click();
    await page.locator('.design-card').first().waitFor(); assert.equal(await page.locator('.design-card').count(), 15);
    assert.match(await page.locator('.brand').textContent(), /Design Library/);
    await mkdir(resolve(root, '.legacy-review'), { recursive: true });
    await page.screenshot({ path: resolve(root, '.legacy-review/design-library-desktop.png'), fullPage: true });
    await page.locator('#query').fill('정보가 많은 관리 화면'); await page.locator('#search').evaluate(form => form.requestSubmit());
    await page.locator('.design-card[data-id="material-design"]').waitFor(); await page.locator('#filters summary').click();
    await page.locator('#facets button[data-tag="minimal"]').click(); await page.locator('.design-card[data-id="flat-design"]').waitFor();
    assert.equal(await page.locator('.design-card').count(), 1);
    await page.locator('#facets button[data-tag="minimal"]').click(); await page.locator('.design-card[data-id="material-design"]').click();
    await page.frameLocator('#preview').locator('.theme-btn').nth(1).click();
    assert.match(await page.frameLocator('#preview').locator('body').getAttribute('data-theme'), /v2/);
    await page.reload(); await page.locator('#title').filter({ hasText: '머티리얼 디자인' }).waitFor();
    await page.getByRole('button', { name: '설명', exact: true }).click();
    const download = await page.request.get(await page.locator('#download').getAttribute('href'));
    const downloaded = await download.json();
    assert.equal(downloaded.id, 'material-design');
    assert.ok(downloaded.sourceFiles.every(file => !Object.hasOwn(file, 'absolutePath')));
    await page.getByRole('button', { name: '목록으로', exact: true }).click();
    assert.equal(await page.locator('#query').inputValue(), '정보가 많은 관리 화면');
    await page.getByRole('link', { name: '컴포넌트', exact: true }).click();
    await page.locator('.design-card[data-id="component-modal"]').click(); await page.frameLocator('#preview').locator('#demo-modal').waitFor();
    assert.equal(await page.frameLocator('#preview').locator('.component-card').count(), 1);
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: resolve(root, '.legacy-review/design-library-mobile.png'), fullPage: true });
    assert.equal(await page.getByRole('link', { name: '호출 기록', exact: true }).count(), 0);
    const catalog = await (await page.request.get(`${base}design-library/data/catalog.json`)).json();
    for (const design of catalog.designs) {
      await page.goto(`${base}design-library/#/${design.kind === 'component' ? 'components' : 'trends'}/${design.id}`);
      await page.locator('#title').filter({ hasText: design.title }).waitFor();
      await page.frameLocator('#preview').locator('body').waitFor();
    }
    await page.goto(`${base}design-library/#/trends?q=우주선엔진`);
    await page.getByText('일치하는 디자인이 없습니다.', { exact: false }).waitFor();
    await page.goto(`${base}design-library/#/activity`);
    await page.locator('#error').filter({ hasText: '로컬 Design Library' }).waitFor();
    await page.goto(`${base}design-library/#/trends/unknown`); await page.locator('#error').filter({ hasText: '없는 디자인 ID' }).waitFor();
    await page.getByRole('link', { name: 'Design Home', exact: true }).click(); await page.locator('.hero-title').waitFor();
    assert.deepEqual(errors, []); assert.deepEqual(failures, []); assert.deepEqual(apiRequests, []);
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
});

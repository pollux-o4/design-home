import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createStaticServer } from './support/static-server.mjs';
import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '../design-compare/node_modules/playwright/index.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
let browser, server, base;
before(async () => {
  server = createStaticServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });

});
after(async () => { await browser.close(); await new Promise(resolve => server.close(resolve)); });

test('all legacy trend pages load extracted assets without runtime or local asset failures', async () => {
  for (const file of (await readdir(root + 'trend-style')).filter(file => file.endsWith('.html'))) {
    const page = await browser.newPage();
    await page.route(/https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if(response.url().startsWith(base) && response.status() >= 400) errors.push(response.url()); });
    await page.goto(`${base}/trend-style/${file}`);
    if (file !== 'index.html') {
      assert.equal(await page.locator('.drag-handle-hint').count(), 1, file);
      assert.equal(await page.locator('style').count(), 0, file);
      const themeControls = page.locator('.drag-handle-hint').locator('..').locator('button, input[type=radio]');
      if (await themeControls.count()) await themeControls.last().click({ force: true });
    }
    assert.deepEqual(errors, [], file);
    await page.close();
  }
});

test('canvas registry supplies render counts, uniform description search and safe empty results', async () => {
  const page = await browser.newPage();
    await page.route(/https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  await page.goto(`${base}/ui-components/index.html`);
  const expected = await page.evaluate(() => Object.values(ComponentModules).flatMap(module => CanvasCatalog.create().components(module)).length);
  assert.equal(await page.locator('.component-card').count(), 0);
  assert.ok(expected > await page.locator('.component-card').count());
  assert.equal(await page.locator('.layer-item').count(), 6);
  await page.locator('#search-input').fill('GNB');
  assert.ok(await page.locator('.component-card').count() > 0);
  assert.ok(await page.locator('.component-card').count() < expected);
  await page.locator('#search-input').fill('<img src=x onerror=alert(1)>');
  assert.equal(await page.locator('#canvas-grid img').count(), 0);
  assert.match(await page.locator('#canvas-grid p').textContent(), /<img/);
  await page.close();
});


test('language choice updates newly injected navigation and persists across legacy pages', async () => {
  const page = await browser.newPage();
    await page.route(/https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  await page.goto(`${base}/index.html`);
  await page.locator('#dh-lang-en').click();
  assert.equal(await page.locator('[data-i18n="nav_home"]').textContent(), 'Home');
  await page.goto(`${base}/ui-components/index.html`);
  assert.equal(await page.locator('#dh-lang-en').getAttribute('aria-current'), 'true');
  assert.equal(await page.locator('[data-i18n="nav_home"]').textContent(), 'Home');
  await page.close();
});

test('feed reset reuses its catalog markup after load and global preference adapters still work', async () => {
  const page = await browser.newPage();
    await page.route(/https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  await page.goto(`${base}/ui-components/index.html`);
  await page.locator('[data-target="layout-navigation"] .category-button').click();
  await page.locator('[data-target="layout-navigation"] [data-group="content"]').click();
  const initial = await page.locator('#infinite-scroll-list').innerHTML();
  await page.evaluate(() => triggerInfiniteScroll());
  await page.waitForFunction(() => document.querySelectorAll('#infinite-scroll-list .infinite-item-card').length > 4);
  await page.evaluate(() => { resetInfiniteScroll(); changeMinFontSize('14px'); });
  assert.equal((await page.locator('#infinite-scroll-list').innerHTML()).replace(/>\s+</g, '><').trim(), initial.replace(/>\s+</g, '><').trim());
  await page.evaluate(() => { triggerInfiniteScroll(); resetInfiniteScroll(); });
  await page.waitForTimeout(500);
  assert.equal(await page.locator('#infinite-scroll-list .infinite-item-card').count(), 4);
  assert.equal(await page.locator('#min-font-size-value').textContent(), '14px');
  assert.equal(await page.evaluate(() => localStorage.getItem('ui_canvas_min_size')), '14px');
  await page.close();
});


test('feed render lifecycle resets exhausted state and cancels detached pending loads', async () => {
  const page = await browser.newPage();
  await page.route(/https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  await page.goto(`${base}/ui-components/index.html`);
  await page.locator('[data-target="layout-navigation"] .category-button').click();
  await page.locator('[data-target="layout-navigation"] [data-group="content"]').click();
  for (const count of [6, 8, 10]) {
    await page.evaluate(() => triggerInfiniteScroll());
    await page.waitForFunction(expected => document.querySelectorAll('#infinite-scroll-list .infinite-item-card').length === expected, count);
  }
  await page.locator('#search-input').fill('zzz');
  await page.locator('#search-input').fill('');
  assert.equal(await page.locator('#infinite-scroll-list .infinite-item-card').count(), 4);
  await page.evaluate(() => triggerInfiniteScroll());
  await page.waitForFunction(() => document.querySelectorAll('#infinite-scroll-list .infinite-item-card').length === 6);
  await page.evaluate(() => triggerInfiniteScroll());
  await page.locator('#search-input').fill('zzz');
  await page.locator('#search-input').fill('');
  await page.waitForTimeout(500);
  assert.equal(await page.locator('#infinite-scroll-list .infinite-item-card').count(), 4);
  await page.evaluate(() => triggerInfiniteScroll());
  await page.waitForFunction(() => document.querySelectorAll('#infinite-scroll-list .infinite-item-card').length === 6);
  await page.close();
});

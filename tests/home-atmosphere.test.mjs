import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from '../design-compare/node_modules/playwright/index.mjs';
import { createStaticServer } from './support/static-server.mjs';

test('hero decoration stays bounded, settles, pauses offscreen and respects reduced motion', async () => {
  const server = createStaticServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const scene = page.locator('.hero-atmosphere');
    await page.waitForFunction(() => document.querySelector('.hero-atmosphere.is-visible'));
    assert.equal(await scene.getAttribute('aria-hidden'), 'true');
    assert.equal(await scene.locator('i').count(), 24);
    await page.waitForFunction(() => document.querySelector('.hero-atmosphere').getAnimations({subtree:true}).every(animation => animation.playState === 'finished'), null, {timeout: 7000});
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({width, height: 932});
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `no overflow at ${width}`);
      const bounds = await scene.boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width);
    }
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => !document.querySelector('.hero-atmosphere.is-visible'));
    await page.emulateMedia({reducedMotion:'reduce', colorScheme:'dark'});
    await page.reload();
    assert.equal(await scene.evaluate(element => element.getAnimations({subtree:true}).length), 0);
    assert.equal(await scene.evaluate(element => getComputedStyle(element).color), 'rgb(230, 234, 255)');
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});

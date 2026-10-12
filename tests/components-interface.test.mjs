import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from '../design-compare/node_modules/playwright/index.mjs';
import { createStaticServer } from './support/static-server.mjs';

test('component browsing, full sample bounds, search recovery and code dialog keyboard flow', async () => {
 const server=createStaticServer(); await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true});
 try {
  const page=await browser.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://fonts.googleapis.com/**', route=>route.abort());
  const url=`http://127.0.0.1:${server.address().port}/ui-components/index.html`;
  for(const width of [320,390,768,1440]) {
   await page.setViewportSize({width,height:900});await page.goto(url);
   await page.locator('.component-card').first().waitFor();
   const categories=page.locator('.category-button');
   for(let i=0;i<await categories.count();i++) {
    await categories.nth(i).click();
    assert.equal(await page.locator('.artboard-frame').count(),1);
    const bounds=await page.evaluate(()=>{
     const view=document.querySelector('main');
     return {page:document.body.scrollWidth,width:innerWidth,view:view.scrollWidth,client:view.clientWidth,
      cards:[...document.querySelectorAll('.component-body')].every(e=>e.scrollWidth<=e.clientWidth+1)};
    });
    assert.ok(bounds.page<=bounds.width,JSON.stringify(bounds));assert.ok(bounds.view<=bounds.client+1,JSON.stringify(bounds));assert.ok(bounds.cards,`sample overflow at ${width}, category ${i}`);
   }
  }
  await page.locator('#search-input').fill('Toggle');assert.ok(await page.locator('.component-card').count()>0);
  await page.locator('#search-input').fill('no-matching-component-xyz');await page.locator('#reset-search').click();assert.equal(await page.locator('#search-input').inputValue(),'');
  await page.locator('.sidebar-accordion-header').click();assert.equal(await page.locator('.sidebar-accordion-header').getAttribute('aria-expanded'),'true');
  const code=page.locator('.btn-code-view').first();await code.click();assert.equal(await page.locator('#btn-close-modal').evaluate(e=>e===document.activeElement),true);
  await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#btn-copy-code').evaluate(e=>e===document.activeElement),true);
  await page.keyboard.press('Escape');assert.equal(await code.evaluate(e=>e===document.activeElement),true);
  await code.click();await page.locator('#btn-close-modal-footer').click();assert.equal(await code.evaluate(e=>e===document.activeElement),true);
  await page.goto(url+'?view=specimen&component=toggle-switch');await page.locator('.component-card').waitFor();assert.equal(await page.locator('.component-card').count(),1);
  const toggle=page.locator('.ui-toggle'); const input=toggle.locator('input');const before=await input.isChecked();await toggle.click();assert.notEqual(await input.isChecked(),before);
  assert.deepEqual(errors,[]);
 } finally {await browser.close();await new Promise(r=>server.close(r));}
});

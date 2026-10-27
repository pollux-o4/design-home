import { mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { loadDesigns } from '../src/library/index.js';
import { createHubServer } from '../hub/server.js';

const output = fileURLToPath(new URL('../../design-library/previews/', import.meta.url));
const server = createHubServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch();
  await rm(output, { recursive: true, force: true }); await mkdir(output, { recursive: true });
  for (const design of loadDesigns()) {
    const page = await browser.newPage({ viewport: design.viewport, deviceScaleFactor: 1, colorScheme: 'light' });
    await page.route('https://**/*', route => route.abort());
    await page.goto(`${base}${design.previewPath}`);
    await page.evaluate(() => document.fonts.ready);
    if (design.capture?.openSelector) await page.locator(design.capture.openSelector).click();
    if (design.id === 'component-scrollbar') {
      await page.locator('.dh-scroll-rail[data-axis="y"]').hover();
      await page.waitForTimeout(200);
    }
    const path = join(output, `${design.id}.png`);
    if (design.kind === 'component') await page.locator(design.capture.selector).screenshot({ path, animations: 'disabled' });
    else await page.screenshot({ path, animations: 'disabled' });
    await page.close();
  }
  console.log('Design System Library: preview images exported');
} finally {
  await browser?.close(); await new Promise(resolve => server.close(resolve));
}

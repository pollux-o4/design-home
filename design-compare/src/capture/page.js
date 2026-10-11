export async function preparePage(browser, options) {
  const context = await browser.newContext({ viewport: options.viewport, deviceScaleFactor: 1, colorScheme: options.theme, reducedMotion: 'reduce', locale: 'ko-KR', timezoneId: 'Asia/Seoul' });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const response = await page.goto(options.url, { waitUntil: 'networkidle', timeout: 20000 });
  if (!response?.ok()) throw new Error(`페이지 로드 실패: HTTP ${response?.status() ?? 'unknown'}`);
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important}' });
  await page.evaluate(() => document.fonts.ready);
  if (options.openSelector) {
    const opener = page.locator(options.openSelector);
    await opener.waitFor({ state: 'visible' });
    if (await opener.count() !== 1) throw new Error('샘플 열기 선택자는 정확히 1개 필요');
    await opener.click();
  }
  const root = page.locator(options.selector);
  if (await root.count() !== 1) throw new Error(`기준 선택자는 정확히 1개 필요: ${options.selector}`);
  await root.waitFor({ state: 'visible' });
  await root.scrollIntoViewIfNeeded();
  await page.mouse.move(-10, -10);
  if (options.state === 'hover') await root.hover();
  if (options.state === 'focus') {
    await root.focus();
    if (!await root.evaluate(element => element === document.activeElement)) throw new Error('focus 상태를 적용할 수 없는 요소');
  }
  const imagesReady = await root.evaluate(async element => {
    const images = [...element.querySelectorAll('img'), ...(element.tagName === 'IMG' ? [element] : [])];
    await Promise.race([
      Promise.all(images.map(img => img.decode().catch(() => {}))),
      new Promise(resolve => setTimeout(resolve, 10000)),
    ]);
    return images.every(img => img.complete && img.naturalWidth > 0);
  });
  if (!imagesReady) throw new Error('컴포넌트 이미지 로드 실패');
  return root;
}

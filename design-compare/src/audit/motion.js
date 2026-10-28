import { chromium } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

// A bounded observation is a review signal, not a judgement of visual quality.
export async function auditMotion({ url, action, viewport = { width: 1280, height: 900 }, theme = 'light' }) {
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error('인증정보 없는 HTTP(S) URL 필요');
  if (!action) throw new Error('전환을 확인할 --action 선택자 필요');
  if (!['light', 'dark'].includes(theme)) throw new Error('--theme: light 또는 dark 필요');
  const browser = await chromium.launch({ headless: true });
  let collecting = false;
  const events = [];
  try {
    const context = await browser.newContext({ viewport, colorScheme: theme, locale: 'ko-KR', timezoneId: 'Asia/Seoul' });
    await context.exposeBinding('__designMotionObserved', (source, event) => { if (collecting && events.length < 200) events.push({ ...event, url: source.frame.url() }); });
    await context.addInitScript(() => {
      for (const type of ['transitionrun', 'animationstart']) document.addEventListener(type, event => {
        if (!event.isTrusted) return;
        window.__designMotionObserved({ type, name: event.propertyName || event.animationName || '', target: event.target?.tagName?.toLowerCase() || '' });
      }, true);
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const response = await page.goto(parsed.href, { waitUntil: 'domcontentloaded', timeout: 20000 });
    if (!response?.ok()) throw new Error(`페이지 로드 실패: HTTP ${response?.status() ?? 'unknown'}`);
    await page.evaluate(() => document.fonts.ready);
    const trigger = page.locator(action);
    if (await trigger.count() !== 1) throw new Error('동작 선택자는 정확히 1개 필요');
    await trigger.waitFor({ state: 'visible' });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.hover();
    await page.waitForTimeout(300);
    const initialUrl = page.url();
    const before = await page.screenshot({ caret: 'hide', scale: 'css' });
    collecting = true;
    await trigger.click();
    await page.waitForTimeout(600);
    collecting = false;
    const after = await page.screenshot({ caret: 'hide', scale: 'css' });
    const first = PNG.sync.read(before), second = PNG.sync.read(after);
    if (first.width !== second.width || first.height !== second.height) throw new Error('화면 크기가 변경되어 비교할 수 없음');
    const changed = pixelmatch(first.data, second.data, null, first.width, first.height, { threshold: 0.1, includeAA: false });
    const ratio = changed / (first.width * first.height);
    // shortcut: JS·canvas 영상과 브라우저 외부 팝업의 움직임은 이벤트로 식별 불가, 프레임 기반 검사가 도입될 때 재검토.
    const finalUrl = page.url();
    const relevantEvents = initialUrl === finalUrl ? events : events.filter(event => event.url === finalUrl);
    const outcome = ratio < 0.001 ? 'inconclusive' : relevantEvents.length ? 'motion-observed' : 'review';
    return { schemaVersion: 1, status: outcome, target: { url: parsed.href, action, viewport, theme }, finalUrl, changedPixels: changed, changeRatio: ratio, observationMs: 600, events: relevantEvents, screenshots: { before, after } };
  } finally { await browser.close(); }
}

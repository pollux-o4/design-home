import { chromium } from "playwright";
import { performance } from "node:perf_hooks";
import { motionScenario } from "./motion-scenario.js";
import { compareFrames } from "./motion-evidence.js";

export async function auditMotion(request) {
  const scenario = await motionScenario(request);
  const {
    url,
    action,
    viewport,
    theme,
    reducedMotion,
    locale,
    timezoneId,
    observationMs,
    expectation,
    region,
    expected,
    history,
  } = scenario;
  const browser = await chromium.launch({ headless: true });
  let collecting = false;
  const events = [];
  let eventsTruncated = false;
  try {
    const context = await browser.newContext({
      viewport,
      colorScheme: theme,
      reducedMotion,
      locale,
      timezoneId,
    });
    await context.exposeBinding("__designMotionObserved", (source, event) => {
      if (collecting) {
        if (events.length < 200) events.push({ ...event, url: source.frame.url() });
        else eventsTruncated = true;
      }
    });
    await context.addInitScript(
      ({ region }) => {
        for (const type of ["transitionrun", "animationstart"])
          document.addEventListener(
            type,
            (event) => {
              if (!event.isTrusted) return;
              const root = region ? document.querySelector(region) : null;
              const related = root ? root === event.target || root.contains(event.target) : null;
              window.__designMotionObserved({
                type,
                name: event.propertyName || event.animationName || "",
                target: event.target?.id
                  ? `#${CSS.escape(event.target.id)}`
                  : event.target?.tagName?.toLowerCase() || "",
                related,
                timestamp: performance.now(),
              });
            },
            true,
          );
      },
      { region },
    );
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    for (const address of [url, ...history]) {
      const response = await page.goto(address, { waitUntil: "domcontentloaded", timeout: 20000 });
      if (!response?.ok())
        throw new Error(`페이지 로드 실패: HTTP ${response?.status() ?? "unknown"}`);
    }
    await page.evaluate(() => document.fonts.ready);
    if (region) await page.evaluate((selector) => document.querySelector(selector), region);
    let trigger;
    if (action.type !== "back") {
      trigger = page.locator(action.selector);
      if ((await trigger.count()) !== 1) throw new Error("동작 선택자는 정확히 1개 필요");
      await trigger.waitFor({ state: "visible" });
      await trigger.scrollIntoViewIfNeeded();
      if (action.type === "click") {
        await trigger.hover();
        await page.waitForTimeout(300);
      }
      if (action.type === "press") await trigger.focus();
    }
    const regionLocator = region ? page.locator(region) : null;
    if (regionLocator && (await regionLocator.count()) > 1)
      throw new Error("관찰 영역은 최대 1개 필요");
    const box =
      regionLocator && (await regionLocator.isVisible()) ? await regionLocator.boundingBox() : null;
    const clip =
      box &&
      box.x >= 0 &&
      box.y >= 0 &&
      box.x + box.width <= viewport.width &&
      box.y + box.height <= viewport.height
        ? box
        : undefined;
    // shortcut: 닫힌 Shadow DOM과 운영체제 팝업은 브라우저 캡처로 완전 관찰할 수 없음, 브라우저 지원이 바뀌면 재검토.
    const screenshot = () =>
      page.screenshot({ caret: "hide", scale: "css", ...(clip ? { clip } : {}) });
    const initialUrl = page.url();
    const baseline = await screenshot();
    await page.waitForTimeout(160);
    const frames = [await screenshot()];
    const started = performance.now();
    const sampleTimesMs = [0];
    collecting = true;
    if (action.type === "click") await trigger.click({ noWaitAfter: true });
    else if (action.type === "hover") await trigger.hover();
    else if (action.type === "press") await trigger.press(action.key, { noWaitAfter: true });
    else await page.goBack({ waitUntil: "domcontentloaded" });
    for (let index = 1; index <= 5; index++) {
      const remaining = started + (index * observationMs) / 5 - performance.now();
      if (remaining > 0) await page.waitForTimeout(remaining);
      frames.push(await screenshot());
      sampleTimesMs.push(Math.round(performance.now() - started));
    }
    collecting = false;
    const actualDurationMs = Math.round(performance.now() - started);
    let expectedAfterWindow = false;
    if (expected) {
      const outcome = page.locator(expected.selector);
      expectedAfterWindow =
        expected.state === "visible" ? !(await outcome.isVisible()) : !(await outcome.isHidden());
      await outcome.waitFor({ state: expected.state, timeout: 3000 });
    }
    const finalUrl = page.url();
    const relevantEvents = events.filter(
      (event) => event.related !== false && (initialUrl === finalUrl || event.url === finalUrl),
    );
    const navigation = initialUrl !== finalUrl;
    const evaluation = compareFrames(frames, expectation, relevantEvents, baseline, navigation);
    if (expectedAfterWindow) evaluation.status = "inconclusive";
    return {
      schemaVersion: 1,
      ...evaluation,
      target: {
        url,
        action: action.type === "click" ? action.selector : action,
        viewport,
        theme,
        reducedMotion,
        locale,
        timezoneId,
        ...(region ? { region } : {}),
      },
      scenario: {
        action,
        expectation,
        observationMs,
        ...(expected ? { expected } : {}),
        ...(history.length ? { history } : {}),
      },
      finalUrl,
      observationMs,
      events,
      screenshots: {
        before: frames[0],
        ...Object.fromEntries(frames.slice(1, -1).map((frame, i) => [`frame-${i + 1}`, frame])),
        after: frames.at(-1),
      },
      coverage: {
        frameSamples: frames.length,
        sampleTimesMs,
        actualDurationMs,
        eventsTruncated,
        eventScope: region ? "region" : "page",
        imageScope: clip ? "region" : "viewport",
        expectedAfterWindow,
        navigation,
        note: navigation
          ? "페이지 이동 중 로딩 변화는 움직임의 증거로 단정하지 않음"
          : region && !clip
            ? "초기 영역이 보이지 않아 전체 화면을 캡처함"
            : region
              ? "영역 내 이벤트도 동작과의 인과관계는 확인이 필요함"
              : "페이지 전체 이벤트는 동작과 무관할 수 있음",
      },
    };
  } finally {
    await browser.close();
  }
}

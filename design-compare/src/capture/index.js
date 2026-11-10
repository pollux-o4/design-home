import { chromium } from "playwright";
import { validateCapture } from "./contract.js";
import { preparePage } from "./page.js";
import { snapshotParts } from "./snapshot.js";

export { STYLE_PROPERTIES, validateCapture } from "./contract.js";

async function captureComponent(browser, options) {
  const root = await preparePage(browser, options);
  const snapshot = await snapshotParts(root, options);
  const screenshotOptions = { animations: "disabled", caret: "hide", scale: "css" };
  const png = await root.screenshot(screenshotOptions);
  const confirmation = await root.screenshot(screenshotOptions);
  if (!png.equals(confirmation))
    throw new Error("캡처가 안정적이지 않음: 동영상·시간·동적 데이터를 고정한 뒤 재실행");
  return { png, snapshot, capture: { ...options, browserVersion: browser.version() } };
}

export async function capture(options) {
  validateCapture(options);
  const browser = await chromium.launch({ headless: true });
  let deadline;
  try {
    return await Promise.race([
      captureComponent(browser, options),
      new Promise((_, reject) => {
        deadline = setTimeout(
          () => reject(new Error("캡처 제한 시간 30초 초과: 폰트·이미지·페이지 로딩 확인")),
          30000,
        );
      }),
    ]);
  } finally {
    clearTimeout(deadline);
    await browser.close();
  }
}

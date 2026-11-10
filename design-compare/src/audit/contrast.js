import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import axe from 'axe-core';
import { parseScenarioUrl } from './scenario-contract.js';

export async function auditContrast({ scenario, strict = false }) {
  const config = JSON.parse(await readFile(scenario, 'utf8'));
  const url = parseScenarioUrl(config.url);
  if (config.schemaVersion !== 1) throw new Error('schemaVersion 1과 인증정보 없는 HTTP(S) URL 필요');
  if (typeof config.scope !== 'string' || !config.scope.trim()) throw new Error('scope 선택자 필요');
  if (config.openEach !== undefined && (typeof config.openEach !== 'string' || !config.openEach.trim())) throw new Error('openEach 선택자 필요');
  if (config.afterEach !== undefined && (typeof config.afterEach !== 'string' || !config.afterEach.trim())) throw new Error('afterEach 선택자 필요');
  const themes = config.themes ?? ['light', 'dark'];
  if (!Array.isArray(themes) || !themes.length || themes.some(theme => !['light', 'dark'].includes(theme))) throw new Error('themes: light 또는 dark 배열 필요');
  if (config.themeControls && themes.some(theme => typeof config.themeControls[theme] !== 'string' || !config.themeControls[theme].trim())) throw new Error('themeControls: 각 테마의 버튼 선택자 필요');
  if (config.themeOpen !== undefined && (typeof config.themeOpen !== 'string' || !config.themeOpen.trim() || !config.themeControls)) throw new Error('themeOpen에는 선택자와 themeControls 필요');
  const verification = config.themeVerification;
  if (verification && (typeof verification.selector !== 'string' || !verification.selector.trim() || typeof verification.attribute !== 'string' || !verification.attribute.trim() || themes.some(theme => typeof verification.values?.[theme] !== 'string'))) throw new Error('themeVerification: selector, attribute와 각 테마 values 필요');
  const browser = await chromium.launch({ headless: true });
  const findings = [], incomplete = [], coverage = [];
  try {
    for (const theme of themes) {
      const context = await browser.newContext({ colorScheme: theme, reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
      try {
        const page = await context.newPage();
        page.setDefaultTimeout(10000);
        const response = await page.goto(url.href, { waitUntil: 'domcontentloaded' });
        if (!response?.ok()) throw new Error(`HTTP ${response?.status() ?? 'unknown'}`);
        await page.evaluate(() => document.fonts.ready);
        if (config.themeControls) {
          if (config.themeOpen) {
            const opener = page.locator(config.themeOpen);
            if (await opener.count() !== 1) throw new Error('테마 메뉴 열기 버튼은 정확히 1개 필요');
            await opener.click();
          }
          const control = page.locator(config.themeControls[theme]);
          if (await control.count() !== 1) throw new Error(`테마 버튼은 정확히 1개 필요: ${theme}`);
          await control.click();
        }
        if (verification) {
          const target = page.locator(verification.selector);
          if (await target.count() !== 1 || await target.getAttribute(verification.attribute) !== verification.values[theme]) throw new Error(`프로젝트 테마 확인 실패: ${theme}`);
        }
        await page.addScriptTag({ content: axe.source });
        const openers = config.openEach ? page.locator(config.openEach) : null;
        const count = openers ? await openers.count() : 1;
        if (!count || count > 200) throw new Error('openEach 대상은 1~200개 필요');
        for (let index = 0; index < count; index++) {
          const opener = openers?.nth(index);
          const state = opener ? (await opener.getAttribute('aria-label') || await opener.innerText() || `#${index + 1}`) : 'default';
          try {
            if (opener) await opener.click();
            const scope = page.locator(config.scope).filter({ visible: true });
            if (await scope.count() !== 1) throw new Error('표시된 scope는 정확히 1개 필요');
            const scan = async label => {
              const results = await scope.evaluate(async element => globalThis.axe.run(element, { runOnly: ['color-contrast'] }));
              for (const item of results.violations) for (const node of item.nodes) findings.push({ theme, state: label, rule: item.id, target: node.target, html: node.html, reason: node.failureSummary });
              for (const item of results.incomplete) for (const node of item.nodes) incomplete.push({ theme, state: label, rule: item.id, target: node.target, reason: node.failureSummary });
              coverage.push({ theme, state: label, status: 'checked' });
            };
            await scan(state);
            if (config.afterEach) {
              const action = scope.locator(config.afterEach);
              const matches = await action.count();
              if (matches > 1) throw new Error('afterEach는 상태당 최대 1개 필요');
              if (matches === 1 && await action.isVisible() && await action.isEnabled()) {
                const label = `${state} · ${await action.innerText()}`;
                await action.click();
                await scan(label);
              }
            }
          } catch (error) { coverage.push({ theme, state, status: 'error', reason: error.message.split('\n')[0] }); }
        }
      } finally { await context.close(); }
    }
    return { schemaVersion: 1, status: coverage.some(item => item.status === 'error') ? 'error' : findings.length ? strict ? 'fail' : 'review' : incomplete.length ? 'review' : 'pass', target: { url: url.href, scope: config.scope, openEach: config.openEach, afterEach: config.afterEach, themes, themeEvidence: verification ? 'verified' : 'browser-preference' }, findings, incomplete, coverage, summary: { checked: coverage.filter(item => item.status === 'checked').length, findings: findings.length, incomplete: incomplete.length } };
  } finally { await browser.close(); }
}

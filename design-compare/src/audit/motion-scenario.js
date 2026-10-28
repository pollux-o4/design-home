import { readFile } from 'node:fs/promises';

export async function motionScenario(request) {
  const data = request.scenario ? JSON.parse(await readFile(request.scenario, 'utf8')) : {
    schemaVersion: 1, url: request.url, action: { type: 'click', selector: request.action },
    viewport: request.viewport, theme: request.theme, region: request.region, expectation: request.expectation, observationMs: request.observationMs, expected: request.expected,
  };
  if (data.schemaVersion !== 1) throw new Error('시나리오 schemaVersion 1 필요');
  const url = new URL(data.url);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('인증정보 없는 HTTP(S) URL 필요');
  const action = data.action;
  if (!action || !['click', 'hover', 'press', 'back'].includes(action.type)) throw new Error('action.type: click, hover, press, back 필요');
  if (action.type !== 'back' && (typeof action.selector !== 'string' || !action.selector.trim())) throw new Error('action.selector 필요');
  if (action.type === 'press' && (typeof action.key !== 'string' || !action.key.trim())) throw new Error('press에는 action.key 필요');
  if (action.type === 'back' && (!Array.isArray(data.history) || !data.history.length)) throw new Error('back에는 방문할 history URL 배열 필요');
  if (data.history !== undefined && !Array.isArray(data.history)) throw new Error('history: URL 배열 필요');
  const history = (data.history ?? []).map(value => {
    const next = new URL(value, url);
    if (!['http:', 'https:'].includes(next.protocol) || next.username || next.password) throw new Error('history: 인증정보 없는 HTTP(S) URL 필요');
    return next.href;
  });
  const viewport = data.viewport ?? { width: 1280, height: 900 };
  if (![viewport.width, viewport.height].every(n => Number.isInteger(n) && n >= 1 && n <= 4096)) throw new Error('viewport 크기는 정수 1~4096 필요');
  const theme = data.theme ?? 'light';
  if (!['light', 'dark'].includes(theme)) throw new Error('theme: light 또는 dark 필요');
  const reducedMotion = data.reducedMotion ?? 'no-preference';
  if (!['reduce', 'no-preference'].includes(reducedMotion)) throw new Error('reducedMotion: reduce 또는 no-preference 필요');
  const observationMs = data.observationMs ?? 900;
  if (!Number.isInteger(observationMs) || observationMs < 400 || observationMs > 3000) throw new Error('observationMs: 정수 400~3000 필요');
  const expectation = data.expectation ?? 'review';
  if (!['review', 'motion', 'instant'].includes(expectation)) throw new Error('expectation: review, motion 또는 instant 필요');
  if (data.region !== undefined && (typeof data.region !== 'string' || !data.region.trim())) throw new Error('region: CSS 선택자 필요');
  if (data.expected !== undefined && (!data.expected || typeof data.expected.selector !== 'string' || !data.expected.selector.trim() || !['visible', 'hidden'].includes(data.expected.state))) throw new Error('expected: selector와 visible 또는 hidden state 필요');
  return { url: url.href, action, history, viewport, theme, reducedMotion, observationMs, expectation, region: data.region, expected: data.expected };
}

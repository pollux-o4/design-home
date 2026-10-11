import { STYLE_PROPERTIES } from './contract.js';

export async function snapshotParts(root, options) {
  const parts = {};
  const origin = await root.boundingBox();
  if (!origin || origin.width <= 0 || origin.height <= 0 || origin.width > 4000 || origin.height > 4000) throw new Error('캡처 영역 크기 범위 초과');
  for (const [key, selector] of Object.entries({ $root: null, ...options.parts })) {
    const target = selector ? root.locator(selector) : root;
    if (await target.count() !== 1 || !await target.isVisible()) throw new Error(`부분 ${key}: 보이는 요소 정확히 1개 필요 (${selector})`);
    parts[key] = await target.evaluate((element, { properties, origin, selector }) => {
      const css = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const round = n => Math.round(n * 100) / 100;
      return {
        selector, tag: element.tagName.toLowerCase(), classes: [...element.classList],
        source: element.getAttribute('data-design-source'),
        text: element.textContent.trim().slice(0, 500),
        bounds: { x: round(rect.x - origin.x), y: round(rect.y - origin.y), width: round(rect.width), height: round(rect.height) },
        styles: Object.fromEntries(properties.map(name => [name, css.getPropertyValue(name)])),
        pseudo: Object.fromEntries(['::before', '::after'].map(pseudo => {
          const style = getComputedStyle(element, pseudo);
          if (['none', 'normal'].includes(style.content)) return [pseudo, { content: style.content }];
          return [pseudo, { content: style.content, ...Object.fromEntries(properties.map(name => [name, style.getPropertyValue(name)])) }];
        })),
      };
    }, { properties: STYLE_PROPERTIES, origin, selector: selector ?? options.selector });
  }
  return { parts };
}

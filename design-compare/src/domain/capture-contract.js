import { isIdentifier } from './identifiers.js';

export const STYLE_PROPERTIES = Object.freeze([
  'display', 'box-sizing', 'background-color', 'background-image', 'color',
  'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-align',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border-top-width', 'border-top-color', 'border-top-style',
  'border-right-width', 'border-right-color', 'border-right-style',
  'border-bottom-width', 'border-bottom-color', 'border-bottom-style',
  'border-left-width', 'border-left-color', 'border-left-style',
  'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius',
  'box-shadow', 'opacity', 'gap', 'align-items', 'justify-content', 'outline-style', 'outline-width', 'outline-color', 'outline-offset', 'transform',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'flex-direction', 'flex-wrap', 'grid-template-columns', 'grid-template-rows',
  'overflow-x', 'overflow-y', 'visibility', 'filter', 'text-decoration-line', 'cursor', 'pointer-events',
]);

export function validateConditions(options) {
  if (!['default', 'hover', 'focus'].includes(options.state)) throw new Error('상태: default, hover, focus');
  if (!['light', 'dark'].includes(options.theme)) throw new Error('테마: light, dark');
  for (const dimension of ['width', 'height']) {
    if (!Number.isInteger(options.viewport?.[dimension]) || options.viewport?.[dimension] < 200 || options.viewport?.[dimension] > 3000) throw new Error('뷰포트 범위: 정수 200~3000');
  }
}

export function validateCapture(options) {
  if (!options || typeof options !== 'object') throw new Error('캡처 옵션 필요');
  const url = new URL(options.url);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('인증정보 없는 HTTP(S) URL 필요');
  if (typeof options.selector !== 'string' || !options.selector.trim()) throw new Error('--selector 필요');
  if (options.openSelector !== undefined && (typeof options.openSelector !== 'string' || !options.openSelector.trim())) throw new Error('openSelector: 샘플 열기 선택자 필요');
  validateConditions(options);
  if (!options.parts || typeof options.parts !== 'object' || Array.isArray(options.parts)) throw new Error('부분 매핑 객체 필요');
  if (Object.keys(options.parts).length > 30 || Object.hasOwn(options.parts, '$root')) throw new Error('부분 매핑: 최대 30개, $root 예약');
  for (const [key, selector] of Object.entries(options.parts)) {
    if (!isIdentifier(key) || typeof selector !== 'string' || !selector.trim()) throw new Error('부분 매핑: 이름=CSS선택자');
  }
}

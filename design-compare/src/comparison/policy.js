import { STYLE_PROPERTIES } from '../capture/contract.js';

export const DEFAULT_PIXEL_BUDGET = 0.01;
export const PIXEL_THRESHOLD = 0.1;
export const GEOMETRY_TOLERANCE = 0.5;

const allowedProperties = new Set([
  ...STYLE_PROPERTIES, 'x', 'y', 'width', 'height',
  ...['::before', '::after'].flatMap(pseudo => ['content', ...STYLE_PROPERTIES].map(key => `${pseudo}.${key}`)),
]);

export function comparisonPolicy({ ignore = [], pixelBudget = DEFAULT_PIXEL_BUDGET } = {}) {
  if (!Array.isArray(ignore) || ignore.some(property => !allowedProperties.has(property))) throw new Error('알 수 없는 --ignore 속성');
  if (!Number.isFinite(pixelBudget) || pixelBudget < 0 || pixelBudget > 1) throw new Error('--pixel-budget 범위: 0~1');
  return { ignore: [...new Set(ignore)], pixelBudget };
}

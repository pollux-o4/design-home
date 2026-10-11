export function partKeys(reference, candidate = {}) {
  return [...new Set([...Object.keys(reference), ...Object.keys(candidate)])];
}

export const getPart = (parts, key) => Object.hasOwn(parts, key) ? parts[key] : undefined;

export function partMetadata(part) {
  if (!part) return null;
  const { selector, classes, source, bounds } = part;
  return { selector, classes, source, bounds };
}

export function requirePart(part, keys) {
  if (part && !keys.includes(part)) {
    throw Object.assign(new Error(`부분 없음: ${part}. 사용 가능: ${keys.join(', ')}`), {
      code: 'PART_NOT_FOUND', availableParts: keys,
    });
  }
}

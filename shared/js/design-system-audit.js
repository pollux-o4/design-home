const hexPattern = /^#?([\da-f]{3}|[\da-f]{6})$/i;

function channel(value) {
  const normalized = value.length === 3
    ? [...value].map((part) => part + part).join("")
    : value;
  return [0, 2, 4].map((index) => Number.parseInt(normalized.slice(index, index + 2), 16));
}

function luminance(hex) {
  return channel(hex.replace("#", "")).map((value) => {
    const normalized = value / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  }).reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
}

export function contrastRatio(foreground, background) {
  if (!hexPattern.test(foreground) || !hexPattern.test(background)) return null;
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

export function contrastResult(foreground, background, target = "text") {
  const ratio = contrastRatio(foreground, background);
  if (ratio === null) return { ratio, aa: false, aaa: false, threshold: null };
  const threshold = target === "large" || target === "component" ? 3 : 4.5;
  return {
    ratio,
    aa: ratio >= threshold,
    aaa: target === "component" ? null : ratio >= (target === "large" ? 4.5 : 7),
    threshold,
  };
}

export function inspectControlBaseline(root = document) {
  return [...root.querySelectorAll("button, select, input:not([type=hidden]), textarea")]
    .flatMap((element) => {
      const style = getComputedStyle(element);
      const name = element.getAttribute("aria-label") || element.labels?.[0]?.textContent?.trim() || element.textContent.trim() || element.tagName.toLowerCase();
      const findings = [];
      if (parseFloat(style.borderTopLeftRadius) <= 2 && (!element.matches("select") || style.appearance === "none")) findings.push({ kind: "square-control", name, element });
      if (element.matches("select") && style.appearance !== "none") findings.push({ kind: "native-select", name, element });
      const bounds = element.getBoundingClientRect();
      if (bounds.width > 0 && bounds.height > 0 && (bounds.width < 24 || bounds.height < 24)) findings.push({ kind: "small-target", name, element });
      return findings;
    });
}

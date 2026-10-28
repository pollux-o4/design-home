// This classic script is also injected by the CLI into the project being checked.
(() => {
  const hexPattern = /^#?([\da-f]{3}|[\da-f]{6})$/i;
  const nativeInputKinds = new Map([
    ["date", "native-date-picker"],
    ["datetime-local", "native-date-picker"],
    ["month", "native-date-picker"],
    ["time", "native-date-picker"],
    ["week", "native-date-picker"],
    ["file", "native-file-input"],
    ["color", "native-color-input"],
    ["range", "native-range-input"],
    ["number", "native-number-spinner"],
    ["search", "native-search-input"],
  ]);

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

  function nameOf(element) {
    if (element === document.scrollingElement) return "페이지 스크롤바";
    return element.getAttribute("aria-label")
      || element.labels?.[0]?.textContent?.trim()
      || element.getAttribute("placeholder")
      || element.getAttribute("name")
      || (element.matches("button, select") ? element.textContent.trim().slice(0, 100) : "")
      || element.type
      || element.tagName.toLowerCase();
  }

  function targetOf(element) {
    if (element.id) return `#${CSS.escape(element.id)}`;
    const label = element.getAttribute("aria-label");
    if (label) return `${element.tagName.toLowerCase()}[aria-label="${label.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"]`;
    const name = element.getAttribute("name");
    if (name) return `${element.tagName.toLowerCase()}[name="${name.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"]`;
    const type = element.getAttribute("type");
    return `${element.tagName.toLowerCase()}${type ? `[type="${type}"]` : ""}`;
  }

  function isVisible(element, style) {
    const bounds = element.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0 || style.visibility !== "visible" || element.closest("[hidden], [inert]")) return false;
    for (let current = element; current; current = current.parentElement) {
      const currentStyle = current === element ? style : getComputedStyle(current);
      if (currentStyle.display === "none" || Number(currentStyle.opacity) === 0) return false;
      if (currentStyle.clipPath === "inset(50%)" || currentStyle.clip === "rect(0px, 0px, 0px, 0px)") return false;
    }
    return bounds.right > 0 && bounds.bottom > 0;
  }

  function isAllowed(element, allow) {
    if (element.closest('[data-ds-native="allow"]')) return true;
    return allow.some((selector) => element.matches(selector) || element.closest(selector));
  }

  function nativeAppearance(style) {
    return !["", "none"].includes(String(style.appearance).toLowerCase());
  }

  function finding(kind, category, element, policy) {
    return {
      kind,
      category,
      name: nameOf(element),
      target: targetOf(element),
      severity: category === "platform" && policy.strict ? "error" : "warning",
    };
  }

  function isScrollable(element, style) {
    if (element === document.scrollingElement) {
      return element.scrollHeight > innerHeight + 1 || element.scrollWidth > innerWidth + 1;
    }
    const vertical = /auto|scroll|overlay/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1;
    const horizontal = /auto|scroll|overlay/.test(style.overflowX) && element.scrollWidth > element.clientWidth + 1;
    return vertical || horizontal;
  }

  function hasCustomScrollbar(element, style) {
    const scrollbar = getComputedStyle(element, "::-webkit-scrollbar");
    return element.matches('[data-ds-scrollbar="custom"]')
      || element.classList.contains("dh-scroll-native")
      || !["", "auto"].includes(style.scrollbarWidth)
      || !["", "auto"].includes(style.scrollbarColor)
      || scrollbar.display === "none"
      || !["", "auto"].includes(scrollbar.width)
      || !["", "auto"].includes(scrollbar.height);
  }

  function normalizedPolicy(options = {}) {
    const allow = options.allow ?? [];
    if (!Array.isArray(allow)) throw new Error("allow는 CSS 선택자 배열이어야 합니다.");
    for (const selector of allow) document.querySelector(selector);
    return { allow, strict: Boolean(options.strict), scrollbars: options.scrollbars !== false };
  }

  function controlsWithin(root) {
    // shortcut: 닫힌 Shadow DOM과 OS 팝업은 DOM으로 관찰할 수 없음, 상태별 브라우저 검증을 도입할 때 범위 재검토.
    const selector = "button, select, input:not([type=hidden]), textarea";
    return [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)];
  }

  function scrollablesWithin(root) {
    const nodes = root.nodeType === Node.DOCUMENT_NODE
      ? [document.scrollingElement, ...root.querySelectorAll("*")]
      : [root, ...(root === document.body || root === document.documentElement ? [document.scrollingElement] : []), ...root.querySelectorAll("*")];
    return [...new Set(nodes.filter(Boolean))];
  }

  function inspectControlBaseline(root = document, options = {}) {
    const policy = normalizedPolicy(options);
    const findings = [];
    for (const element of controlsWithin(root)) {
      const style = getComputedStyle(element);
      if (!isVisible(element, style) || isAllowed(element, policy.allow)) continue;
      if (parseFloat(style.borderTopLeftRadius) <= 2 && (!element.matches("select") || style.appearance === "none")) {
        findings.push(finding("square-control", "shape", element, policy));
      }
      if (element.matches("select") && nativeAppearance(style)) {
        findings.push(finding("native-select", "platform", element, policy));
      }
      const nativeKind = nativeInputKinds.get(element.type);
      if (nativeKind && (["native-file-input", "native-date-picker"].includes(nativeKind) || nativeAppearance(style))) {
        findings.push(finding(nativeKind, "platform", element, policy));
      }
      const bounds = element.getBoundingClientRect();
      if (bounds.width < 24 || bounds.height < 24) {
        findings.push(finding("small-target", "target", element, policy));
      }
    }
    if (policy.scrollbars) {
      for (const element of scrollablesWithin(root)) {
        const style = getComputedStyle(element);
        if (!isVisible(element, style) || isAllowed(element, policy.allow)) continue;
        if (isScrollable(element, style) && !hasCustomScrollbar(element, style)) {
          findings.push(finding("native-scrollbar", "platform", element, policy));
        }
      }
    }
    return findings;
  }

  function summarizeControlAudit(findings) {
    const platform = findings.filter((entry) => entry.category === "platform").length;
    return {
      total: findings.length,
      platform,
      review: findings.length - platform,
      blocking: findings.filter((entry) => entry.severity === "error").length,
    };
  }

  globalThis.DesignSystemAudit = {
    contrastRatio(foreground, background) {
      if (!hexPattern.test(foreground) || !hexPattern.test(background)) return null;
      const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
      return (lighter + 0.05) / (darker + 0.05);
    },
    contrastResult(foreground, background, target = "text") {
      const ratio = this.contrastRatio(foreground, background);
      if (ratio === null) return { ratio, aa: false, aaa: false, threshold: null };
      const threshold = target === "large" || target === "component" ? 3 : 4.5;
      return {
        ratio,
        aa: ratio >= threshold,
        aaa: target === "component" ? null : ratio >= (target === "large" ? 4.5 : 7),
        threshold,
      };
    },
    inspectControlBaseline,
    summarizeControlAudit,
  };
})();

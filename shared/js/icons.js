const sprite = new URL('../assets/interface-icons.svg', import.meta.url);

export function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('ui-icon');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(svg.namespaceURI, 'use');
  use.setAttribute('href', `${sprite.href}#${name}`);
  svg.append(use);
  return svg;
}

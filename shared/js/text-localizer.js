// Translate text and accessible labels without replacing interactive DOM nodes.
export function createTextLocalizer(root, translate, language) {
  const originals = new WeakMap();
  const attributes = ['aria-label', 'placeholder', 'title', 'alt'];
  const apply = (node, key, read, write) => {
    const value = read();
    const saved = originals.get(node) ?? {};
    const previous = saved[key];
    const source = previous && value === previous.output ? previous.source : value;
    const output = translate(source, language());
    saved[key] = { source, output };
    originals.set(node, saved);
    if (output !== value) write(output);
  };
  const text = node => {
    if (!node.parentElement?.closest('script,style,code,pre')) apply(node, 'text', () => node.data, value => { node.data = value; });
  };
  const labels = node => {
    if (node.matches('option:not([value])')) node.setAttribute('value', node.textContent);
    for (const attribute of attributes) if (node.hasAttribute(attribute)) apply(node, attribute, () => node.getAttribute(attribute), value => node.setAttribute(attribute, value));
  };
  const visit = node => {
    if (node.nodeType === Node.TEXT_NODE) { text(node); return; }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    // Preserve implicit option values before translating their labels.
    labels(node);
    for (const child of node.querySelectorAll('*')) labels(child);
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) text(walker.currentNode);
  };
  const observe = () => observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: attributes });
  const observer = new MutationObserver(records => {
    observer.disconnect();
    for (const record of records) {
      if (record.type === 'childList') record.addedNodes.forEach(visit);
      else if (record.type === 'characterData') text(record.target);
      else labels(record.target);
    }
    observe();
  });
  const update = () => {
    observer.disconnect();
    visit(root);
    root.lang = language();
    observe();
  };
  update();
  return { update, dispose: () => observer.disconnect() };
}

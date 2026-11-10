export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}
function externalLink(item, href, label, className) {
  const link = element("a", className, `${label} ↗`);
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", `${item.name} ${label} (새 탭)`);
  return link;
}
export function exampleLink(item) {
  return externalLink(item, item.examples, item.examplesLabel, "example-link");
}
export function officialLink(item) {
  return externalLink(item, item.docs, "공식 문서", "official-link");
}

import { element } from "./dom.js";
const expandedGroups = new Set();
const PREVIEW_COUNT = 3;

export function tagDisclosure(tags, group, createChip) {
  const content = element("div", null, "facet-content");
  const preview = element("div", null, "facet-chips");
  tags
    .slice(0, PREVIEW_COUNT)
    .forEach((tag) => preview.append(createChip(tag)));
  content.append(preview);
  if (tags.length <= PREVIEW_COUNT) return content;
  const disclosure = element("div", null, "tag-disclosure");
  const trigger = element("button", null, "disclosure-trigger");
  trigger.type = "button";
  const label = element("span", null, "disclosure-label");
  const icon = element("span", "⌄", "disclosure-icon");
  icon.setAttribute("aria-hidden", "true");
  trigger.append(label, icon);
  const panel = element("div", null, "disclosure-panel");
  panel.id = `tag-options-${group.id}`;
  trigger.setAttribute("aria-controls", panel.id);
  const clip = element("div", null, "disclosure-clip");
  const extras = element("div", null, "facet-chips disclosure-chips");
  tags.slice(PREVIEW_COUNT).forEach((tag) => extras.append(createChip(tag)));
  clip.append(extras);
  panel.append(clip);
  function update(open) {
    disclosure.classList.toggle("is-open", open);
    label.textContent = open
      ? "접기"
      : `더 보기 +${tags.length - PREVIEW_COUNT}`;
    trigger.setAttribute(
      "aria-label",
      `${group.label} 태그 ${open ? "접기" : "더 보기"}`,
    );
    trigger.setAttribute("aria-expanded", String(open));
    panel.inert = !open;
    panel.setAttribute("aria-hidden", String(!open));
  }
  update(expandedGroups.has(group.id));
  trigger.addEventListener("click", () => {
    const open = !disclosure.classList.contains("is-open");
    open ? expandedGroups.add(group.id) : expandedGroups.delete(group.id);
    update(open);
  });
  disclosure.append(trigger, panel);
  content.append(disclosure);
  return content;
}

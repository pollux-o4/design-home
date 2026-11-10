import principles from "./pattern-principles.js";
import components from "./pattern-topics/components.js";
import layoutNavigation from "./pattern-topics/layout-navigation.js";
import interaction from "./pattern-topics/interaction.js";
import feedback from "./pattern-topics/feedback.js";
import motion from "./pattern-topics/motion.js";
import accessibility from "./pattern-topics/accessibility.js";

const descriptions = {
  components: "The building blocks for input, selection, and disclosure.",
  "layout-navigation": "Design screen structure and paths through content.",
  interaction: "Explore how interfaces respond to user actions.",
  feedback: "Communicate progress, outcomes, and next steps.",
  motion: "Explore timing, transitions, and expressive motion.",
  accessibility: "Explore patterns through keyboard, focus, and labels.",
  heuristics: "Ten principles for reviewing usability.",
  laws: "Principles of perception, choice, and interaction.",
};

// Learning topics reference canonical samples; markup and behavior are never duplicated.
export const topics = [components, layoutNavigation, interaction, feedback, motion, accessibility];

export function createPatternModel(catalog) {
  const resolve = (definitions) =>
    definitions.map((topic) => ({
      ...topic,
      groups: topic.groups.map((group) => ({
        ...group,
        components: group.ids.map((id) => {
          const definition = catalog.find(id);
          if (!definition) throw new Error(`Unknown pattern: ${id}`);
          return definition;
        }),
      })),
    }));
  const resolved = resolve(topics),
    principleTopics = resolve(principles);
  const topicsFor = (view) => {
    const source = view === "purpose" ? principleTopics : resolved;
    if (globalThis.document?.documentElement.lang !== "en") return source;
    // shortcut: 세부 그룹과 체험 예제는 번역 자료가 없어 한국어 유지, 콘텐츠별 영문 검수가 준비되면 확장.
    return source.map((topic) => ({
      ...topic,
      title: topic.term,
      term: topic.title,
      desc: descriptions[topic.id],
      groups: topic.groups.map((group) => ({ ...group, title: group.term || group.title })),
    }));
  };
  return {
    topics: resolved,
    topicsFor,
    find: (id, view) => topicsFor(view).find((topic) => topic.id === id),
    search: (query, view) =>
      topicsFor(view).filter((topic) =>
        [topic.title, topic.term, ...topic.groups.flatMap((group) => [group.title, group.term])]
          .filter(Boolean)
          .some((text) => text.toLowerCase().includes(query.toLowerCase())),
      ),
  };
}

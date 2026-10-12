import principles from "./pattern-principles.js";
import components from "./pattern-topics/components.js";
import layoutNavigation from "./pattern-topics/layout-navigation.js";
import interaction from "./pattern-topics/interaction.js";
import feedback from "./pattern-topics/feedback.js";
import motion from "./pattern-topics/motion.js";
import accessibility from "./pattern-topics/accessibility.js";

// Learning topics reference canonical samples; markup and behavior are never duplicated.
export const topics = [
  components,
  layoutNavigation,
  interaction,
  feedback,
  motion,
  accessibility,
];

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
  const topicsFor = (view) => (view === "purpose" ? principleTopics : resolved);
  return {
    topics: resolved,
    topicsFor,
    find: (id, view) => topicsFor(view).find((topic) => topic.id === id),
    search: (query, view) =>
      topicsFor(view).filter((topic) =>
        [
          topic.title,
          topic.term,
          ...topic.groups.flatMap((group) => [group.title, group.term]),
        ]
          .filter(Boolean)
          .some((text) => text.toLowerCase().includes(query.toLowerCase())),
      ),
  };
}

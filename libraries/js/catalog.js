import headless from "./catalog/headless.js";
import kits from "./catalog/kits.js";
import registry from "./catalog/registry.js";
import motion from "./catalog/motion.js";
import graphics from "./catalog/graphics.js";
const collections = [headless, kits, registry, motion, graphics];
export const categories = collections.map(({ items, ...category }) => category);
export const libraries = collections.flatMap(({ id, items }) =>
  items.map((item) => ({ ...item, category: id })),
);
export const libraryById = new Map(libraries.map((item) => [item.id, item]));

if (libraryById.size !== libraries.length)
  throw new Error("Duplicate library ID");

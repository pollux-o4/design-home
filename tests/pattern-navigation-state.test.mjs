import test from "node:test";
import assert from "node:assert/strict";
import { createPatternNavigation } from "../ui-components/js/pattern-navigation.js";

test("navigation restores subgroups and coalesces duplicate browser history notifications", () => {
  const events = new EventTarget();
  const location = { hash: "#/" };
  const history = {
    pushState: (_, __, hash) => {
      location.hash = hash;
    },
    replaceState: (_, __, hash) => {
      location.hash = hash;
    },
  };
  const browser = {
    location,
    history,
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
  };
  const model = {
    find: (id) =>
      ["a", "b"].includes(id) ? { groups: [{ id: "one" }] } : undefined,
  };
  const changes = [];
  const navigation = createPatternNavigation({
    model,
    browser,
    onChange: (state) => changes.push(state),
  });
  navigation.start();
  navigation.navigate({ category: "a", group: "one" });
  navigation.navigate({ category: "b" });
  navigation.navigate({ category: "a" });
  assert.equal(location.hash, "#/a/one");
  location.hash = "#/b";
  events.dispatchEvent(new Event("popstate"));
  const count = changes.length;
  events.dispatchEvent(new Event("hashchange"));
  assert.equal(changes.length, count);
  location.hash = "#/a/missing";
  events.dispatchEvent(new Event("hashchange"));
  assert.equal(changes.at(-1).group, "one");
  navigation.navigate({ category: "a", group: null });
  navigation.navigate({ category: "b" });
  navigation.navigate({ category: "a" });
  assert.equal(changes.at(-1).group, null);
  navigation.dispose();
  location.hash = "#/b";
  events.dispatchEvent(new Event("hashchange"));
  assert.equal(changes.at(-1).category, "a");
});

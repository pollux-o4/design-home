import test from "node:test";
import assert from "node:assert/strict";
import { createScope } from "../ui-components/js/samples/lifecycle.js";
test("disposed samples release once and reject asynchronous work registered after removal", async () => {
  const target = new EventTarget(),
    scope = createScope(target);
  let calls = 0,
    cleanups = 0;
  scope.on(target, "work", () => calls++);
  scope.later(() => calls++, 5);
  scope.own(() => cleanups++);
  scope.dispose();
  scope.dispose();
  target.dispatchEvent(new Event("work"));
  scope.on(target, "work", () => calls++);
  scope.later(() => calls++, 5);
  scope.own(() => cleanups++);
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(calls, 0);
  assert.equal(cleanups, 2);
});

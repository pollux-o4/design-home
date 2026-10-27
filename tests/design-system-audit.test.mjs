import test from "node:test";
import assert from "node:assert/strict";
import { contrastRatio, contrastResult } from "../shared/js/design-system-audit.js";

test("WCAG contrast uses the standard relative-luminance ratio and thresholds", () => {
  assert.equal(contrastRatio("#000", "#fff"), 21);
  assert.equal(contrastRatio("#not-a-color", "#fff"), null);
  assert.deepEqual(contrastResult("#777777", "#ffffff", "text"), {
    ratio: contrastRatio("#777777", "#ffffff"),
    aa: false,
    aaa: false,
    threshold: 4.5,
  });
  assert.equal(contrastResult("#777777", "#ffffff", "large").aa, true);
  assert.equal(contrastResult("#777777", "#ffffff", "component").aaa, null);
});

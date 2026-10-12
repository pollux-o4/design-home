import * as stateMorphing from "./state-morphing.js";
import { createScope } from "./lifecycle.js";
import * as forms from "./forms.js";
import * as selection from "./selection.js";
import * as navigation from "./navigation.js";
import * as motion from "./motion.js";
import * as foundations from "./motion-foundations.js";
import * as spatial from "./motion-spatial.js";
import * as expressive from "./motion-expressive.js";
import * as layoutPatterns from "./layout-patterns.js";
import * as dataPatterns from "./data-patterns.js";
import * as workflowPatterns from "./workflow-patterns.js";
import * as accessibilityPatterns from "./accessibility-patterns.js";
import * as layers from "./layers.js";
import * as feedback from "./feedback.js";
import { feed } from "./feed.js";
const strategies = {
  ...forms,
  ...selection,
  ...navigation,
  ...motion,
  ...foundations,
  ...stateMorphing,
  ...spatial,
  ...expressive,
  ...layoutPatterns,
  ...dataPatterns,
  ...workflowPatterns,
  ...accessibilityPatterns,
  ...layers,
  toast: feedback.toast,
  snackbar: feedback.snackbar,
  empty: feedback.empty,
  retry: feedback.retry,
  progress: feedback.progress,
  feed,
};
const active = new Map();
export function mount(root, behavior) {
  const scope = createScope(root);
  const commands = behavior ? strategies[behavior](root, scope) : {};
  active.set(root.dataset.sampleId, { root, commands });
  scope.own(() => {
    if (active.get(root.dataset.sampleId)?.root === root)
      active.delete(root.dataset.sampleId);
  });
  return scope.dispose;
}
/* Legacy integration adapters; sample internals never depend on global handlers. */
export function command(id, name) {
  active.get(id)?.commands?.[name]?.();
}
export const notify = feedback.notify;

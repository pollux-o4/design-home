import { createMotionDemo } from "./motion-demo-view.js";
import { motionDefinitions, motionFrames } from "./motion-definitions.js";
import { createPatternMotionEntries } from "./motion-patterns.js";

export const motionDemos = motionDefinitions.map((definition) =>
  createMotionDemo(definition, motionFrames),
);
export { createPatternMotionEntries };

import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { PIXEL_THRESHOLD } from "./policy.js";
import { FILES } from "../domain/artifacts.js";

function align(source, width, height) {
  const canvas = new PNG({ width, height });
  canvas.data.fill(255);
  PNG.bitblt(source, canvas, 0, 0, source.width, source.height, 0, 0);
  return canvas;
}

export function comparePixels(reference, candidate, budget) {
  const left = PNG.sync.read(reference),
    right = PNG.sync.read(candidate);
  const width = Math.max(left.width, right.width),
    height = Math.max(left.height, right.height);
  const a = align(left, width, height),
    b = align(right, width, height),
    diff = new PNG({ width, height });
  const changedPixels = pixelmatch(a.data, b.data, diff.data, width, height, {
    threshold: PIXEL_THRESHOLD,
  });
  const ratio = changedPixels / (width * height);
  return {
    visual: {
      changedPixels,
      totalPixels: width * height,
      ratio,
      budget,
      withinBudget: ratio <= budget,
      referenceSize: { width: left.width, height: left.height },
      candidateSize: { width: right.width, height: right.height },
    },
    images: {
      [FILES.reference]: reference,
      [FILES.candidate]: candidate,
      [FILES.diff]: PNG.sync.write(diff),
      [FILES.referenceAligned]: PNG.sync.write(a),
      [FILES.candidateAligned]: PNG.sync.write(b),
    },
  };
}

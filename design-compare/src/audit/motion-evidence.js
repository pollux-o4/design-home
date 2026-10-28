import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export function compareFrames(frames, expectation, events, baseline, navigation = false) {
  const images = frames.map(frame => PNG.sync.read(frame));
  const { width, height } = images[0];
  if (images.some(image => image.width !== width || image.height !== height)) throw new Error('화면 크기가 변경되어 비교할 수 없음');
  const previous = PNG.sync.read(baseline);
  if (previous.width !== width || previous.height !== height) throw new Error('기준 화면 크기가 변경되어 비교할 수 없음');
  const mask = Buffer.alloc(width * height * 4);
  const baselineChanged = pixelmatch(previous.data, images[0].data, mask, width, height, { threshold: 0.1, includeAA: false, diffMask: true });
  const ratio = (a, b) => {
    const diff = Buffer.alloc(width * height * 4);
    pixelmatch(a.data, b.data, diff, width, height, { threshold: 0.1, includeAA: false, diffMask: true });
    let changed = 0;
    for (let index = 3; index < diff.length; index += 4) if (diff[index] && !mask[index]) changed++;
    return changed / (width * height);
  };
  const changeRatio = ratio(images[0], images.at(-1));
  const intermediate = images.slice(1, -1).map(frame => ({ fromStart: ratio(images[0], frame), fromEnd: ratio(frame, images.at(-1)) }));
  const visualProgress = intermediate.some(item => item.fromStart >= 0.001 && item.fromEnd >= 0.001);
  const attributedEvents = events.filter(event => event.related === true).length;
  const motionEvidence = (!navigation && visualProgress) || attributedEvents > 0;
  let status = motionEvidence ? 'motion-observed' : changeRatio < 0.001 ? 'inconclusive' : 'review';
  if (expectation === 'instant' && motionEvidence) status = 'review';
  else if (expectation === 'instant' && status === 'review') status = 'accepted';
  if (navigation && status === 'accepted') status = 'inconclusive';
  if (baselineChanged / (width * height) > 0.75) status = 'inconclusive';
  return { status, changedPixels: Math.round(changeRatio * width * height), changeRatio, intermediate, visualProgress, expectation, evidence: { cssEvents: events.length, attributedEvents, visualProgress, baselineChangeRatio: baselineChanged / (width * height) } };
}

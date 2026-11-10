import { partKeys, getPart } from "../domain/snapshots.js";
import { GEOMETRY_TOLERANCE } from "./policy.js";

function styleDifferences(expected, actual) {
  return Object.entries(expected.styles)
    .filter(([key, value]) => value !== actual.styles[key])
    .map(([property, value]) => ({
      kind: "style",
      property,
      expected: value,
      actual: actual.styles[property],
    }));
}

function geometryDifferences(expected, actual) {
  return Object.entries(expected.bounds)
    .filter(([key, value]) => Math.abs(value - actual.bounds[key]) > GEOMETRY_TOLERANCE)
    .map(([property, value]) => ({
      kind: "geometry",
      property,
      expected: value,
      actual: actual.bounds[property],
    }));
}

function pseudoDifferences(expected, actual) {
  return Object.entries(expected.pseudo).flatMap(([pseudo, values]) =>
    Object.entries(values)
      .filter(([key, value]) => value !== actual.pseudo[pseudo]?.[key])
      .map(([key, value]) => ({
        kind: "pseudo",
        property: `${pseudo}.${key}`,
        expected: value,
        actual: actual.pseudo[pseudo]?.[key],
      })),
  );
}

const rules = [styleDifferences, geometryDifferences, pseudoDifferences];

export function compareParts(reference, candidate, ignore) {
  const ignored = new Set(ignore);
  return partKeys(reference, candidate).flatMap((part) => {
    const expected = getPart(reference, part),
      actual = getPart(candidate, part);
    const findings =
      !expected || !actual
        ? [{ kind: "mapping", property: "presence", expected: !!expected, actual: !!actual }]
        : rules.flatMap((rule) => rule(expected, actual));
    return findings.map((finding) => ({
      part,
      ...finding,
      allowed: ignored.has(finding.property),
    }));
  });
}

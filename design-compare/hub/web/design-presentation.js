const labels = {
  component: "COMPONENT",
  work: "YOUR WORK",
  trend: "PROJECT SCREEN",
};

export function kindLabel(kind) {
  return labels[kind] ?? labels.trend;
}

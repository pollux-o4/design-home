const labels = {
  component: 'COMPONENT',
  work: 'YOUR WORK',
  trend: 'DESIGN TREND',
};

export function kindLabel(kind) {
  return labels[kind] ?? labels.trend;
}

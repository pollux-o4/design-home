import { projectReport } from './projection.js';
import { renderDocument } from './document.js';

export function renderReport(report) {
  return renderDocument(report, projectReport(report));
}

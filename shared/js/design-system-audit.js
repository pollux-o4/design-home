import "./design-system-audit-runtime.js";

const audit = () => globalThis.DesignSystemAudit;

export const contrastRatio = (...args) => audit().contrastRatio(...args);
export const contrastResult = (...args) => audit().contrastResult(...args);
export const inspectControlBaseline = (...args) => audit().inspectControlBaseline(...args);
export const summarizeControlAudit = (...args) => audit().summarizeControlAudit(...args);

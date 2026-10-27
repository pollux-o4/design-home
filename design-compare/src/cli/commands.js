import { DEFAULT_PIXEL_BUDGET } from '../comparison/policy.js';
import { isIdentifier } from '../domain/identifiers.js';
import { loadProject } from '../project.js';

function parts(entries) {
  const mapping = {};
  for (const entry of entries ?? []) {
    const index = entry.indexOf('='), name = entry.slice(0, index);
    if (index <= 0 || !isIdentifier(name) || Object.hasOwn(mapping, name)) throw new Error('--part 이름=CSS 형식 필요; 유효한 이름과 중복 없는 매핑 필요');
    mapping[name] = entry.slice(index + 1);
  }
  return mapping;
}

export const commands = {
  history: {
    usage: './design history [--store 경로] [--json]', options: ['store', 'json'], stage: () => 'activity',
    prepare: values => ({ store: values.store }), execute: (app, request) => app.history(request),
  },
  brief: {
    usage: './design brief --intent "만들려는 화면이나 컴포넌트" [--base-url URL] [--limit 3] [--task ID] [--json]',
    options: ['intent', 'base-url', 'limit', 'task', 'store', 'json'], stage: () => 'capture',
    prepare(values) {
      if (!values.intent?.trim()) throw new Error('brief: --intent 필요');
      const baseUrl = values['base-url'] ?? loadProject().baseUrl;
      const url = new URL(baseUrl); if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('인증정보 없는 HTTP(S) base URL 필요');
      const limit = Number(values.limit ?? 3); if (!Number.isInteger(limit) || limit < 1 || limit > 6) throw new Error('--limit: 정수 1~6');
      return { intent: values.intent, baseUrl, limit, store: values.store };
    },
    execute: (app, request) => app.prepareBrief(request),
  },
  inventory: {
    usage: './design inventory --project 경로 [--json]', options: ['project', 'json'], stage: () => 'catalog',
    prepare(values) { if (!values.project) throw new Error('inventory: --project 필요'); return { project: values.project }; },
    execute: (app, request) => app.inventory(request),
  },
  link: {
    usage: './design link --manifest 파일.json [--store 경로] [--json]', options: ['manifest', 'store', 'json'], stage: () => 'catalog',
    prepare(values) { if (!values.manifest) throw new Error('link: --manifest 필요'); return { manifest: values.manifest, store: values.store }; },
    execute: (app, request) => app.link(request),
  },
  search: {
    usage: './design search --query "의도 또는 디자인 이름" [--tag ID ...] [--json]', options: ['query', 'tag', 'store', 'json'], stage: () => 'hub',
    prepare: values => ({ query: values.query ?? '', tags: values.tag ?? [], store: values.store }),
    execute: (app, request) => app.searchDesigns(request),
  },
  context: {
    usage: './design context --id ID [--json]', options: ['id', 'json'], stage: () => 'hub',
    prepare(values) { if (!values.id) throw new Error('context: --id 필요'); return { id: values.id }; },
    execute: (app, request) => app.getDesignContext(request),
  },
  list: {
    usage: './design list [--json]', options: ['store', 'json'], stage: () => 'catalog',
    prepare: values => ({ store: values.store }),
    execute: (app, request) => app.listReferences(request),
  },
  inspect: {
    usage: './design inspect --reference ID | --report report.json [--part 이름] [--json]',
    options: ['reference', 'report', 'part', 'store', 'json'], stage: request => request.reportPath ? 'report' : 'catalog',
    prepare(values) {
      if (!!values.reference === !!values.report) throw new Error('--reference 또는 --report 중 하나 필요');
      if ((values.part?.length ?? 0) > 1) throw new Error('inspect --part는 한 번만 지정');
      return { id: values.reference, reportPath: values.report, part: values.part?.[0], store: values.store };
    },
    execute: (app, request) => app.inspect(request),
  },
  register: {
    usage: './design register --id ID --url URL --selector CSS [--part 이름=CSS ...]',
    options: ['id', 'url', 'selector', 'part', 'viewport', 'theme', 'state', 'store', 'json'], stage: () => 'capture',
    prepare(values) {
      if (!values.id || !values.url || !values.selector) throw new Error('register: --id, --url, --selector 필요');
      const dimensions = /^(\d+)x(\d+)$/.exec(values.viewport ?? '1280x900');
      if (!dimensions) throw new Error('--viewport 형식: 1280x900');
      return { id: values.id, url: values.url, selector: values.selector, parts: parts(values.part), store: values.store,
        state: values.state ?? 'default', theme: values.theme ?? 'light', viewport: { width: Number(dimensions[1]), height: Number(dimensions[2]) } };
    },
    execute: (app, request) => app.register(request),
  },
  compare: {
    usage: './design compare --reference ID (--candidate ID | --url URL) [--selector CSS] [--part 이름=CSS ...]',
    options: ['reference', 'candidate', 'url', 'selector', 'part', 'ignore', 'pixel-budget', 'open-selector', 'store', 'json', 'details'], stage: () => 'capture',
    prepare(values) {
      if (!values.reference || !!values.url === !!values.candidate) throw new Error('compare: --reference와 --url 또는 --candidate 중 하나 필요');
      return { id: values.reference, candidateId: values.candidate, url: values.url, openSelector: values['open-selector'], selector: values.selector, parts: values.part ? parts(values.part) : undefined,
        ignore: values.ignore ?? [], pixelBudget: Number(values['pixel-budget'] ?? DEFAULT_PIXEL_BUDGET), store: values.store };
    },
    execute: (app, request) => app.comparePage(request),
  },
};

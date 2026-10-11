import { rankReferences } from './library/index.js';
import { activityStore } from './activity/index.js';
import { prepareBrief } from './application/brief.js';
import { inventory } from './application/inventory.js';
import { searchDesigns, getDesignContext } from './hub/index.js';
import { readFile } from 'node:fs/promises';
import { catalog } from './catalog/index.js';
import { validateId } from './domain/identifiers.js';
import { capture } from './capture/index.js';
import { inspectReference, inspectReport } from './application/queries.js';
import { comparePage as compareWorkflow } from './application/compare.js';

// Composition root: production adapters are replaceable by concrete test adapters.
export function createApplication({ repositoryFor = catalog, capturePage = capture, read = readFile, now = () => new Date().toISOString() } = {}) {
  return {
    inventory,
    history: async ({ store }) => ({ schemaVersion: 1, status: 'history', entries: await activityStore(store).recent() }),
    prepareBrief: request => prepareBrief(request, { repository: repositoryFor(request.store), capture: capturePage, documentsRoot: process.env.DESIGN_DOCUMENTS_ROOT }),
    async link({ manifest, store }) {
      const fields = JSON.parse(await read(manifest, 'utf8'));
      const record = { ...fields, schemaVersion: 1, mode: 'live', createdAt: now() };
      const directory = await repositoryFor(store).link(record);
      return { status: 'linked', referenceId: record.id, directory, metadata: record };
    },
    async searchDesigns({ query, tags = [], store }) {
      const result = searchDesigns(query, tags);
      const registered = rankReferences(query ?? '', (await repositoryFor(store).list()).filter(item => item.mode === 'live' && item.status === 'ready' && !item.transient), tags).results;
      return { ...result, registered };
    },
    getDesignContext: ({ id }) => getDesignContext(id),
    async listReferences({ store }) {
      return { schemaVersion: 1, status: 'listed', references: await repositoryFor(store).list() };
    },
    inspect(request) {
      return request.reportPath ? inspectReport(request, read) : inspectReference(request, repositoryFor(request.store));
    },
    async register({ id, store, ...options }) {
      validateId(id);
      const captured = await capturePage(options);
      const directory = await repositoryFor(store).save(id, captured.snapshot, captured.png, captured.capture);
      return { status: 'registered', referenceId: id, directory };
    },
    comparePage(request) {
      return compareWorkflow(request, { repository: repositoryFor(request.store), capture: capturePage, read, now });
    },
  };
}

export const { listReferences, inspect, register, comparePage } = createApplication();

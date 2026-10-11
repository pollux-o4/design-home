import { readFile, readdir, mkdir, writeFile, rename, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { assertLinked } from './linked.js';
import { assertReference } from '../domain/records.js';

import { validateId } from '../domain/identifiers.js';
export { validateId } from '../domain/identifiers.js';

export function catalog(root = '.design-compare') {
  const base = resolve(root);
  const repository = {
    async list() {
      let entries;
      try { entries = await readdir(join(base, 'references'), { withFileTypes: true }); }
      catch (error) { if (error.code === 'ENOENT') return []; throw error; }
      const references = [];
      for (const entry of entries.filter(entry => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
        try {
          const record = await repository.load(entry.name);
          references.push({ id: record.id, mode: record.mode ?? 'snapshot', transient: record.transient ?? false, tags: record.tags ?? [], keywords: record.keywords ?? [], title: record.title, category: record.category, description: record.description, sources: record.sources, status: record.mode === 'live' || record.capture.browserVersion ? 'ready' : 'needs-registration',
            ...(record.mode === 'live' || record.capture.browserVersion ? {} : { message: '브라우저 정보 없는 이전 기준. 새 ID로 등록 필요.' }), url: record.capture.url, selector: record.capture.selector,
            viewport: record.capture.viewport, theme: record.capture.theme, state: record.capture.state,
            parts: record.mode === 'live' ? ['$root', ...Object.keys(record.capture.parts)] : Object.keys(record.snapshot.parts), browserVersion: record.capture.browserVersion ?? null });
        } catch (error) { references.push({ id: entry.name, status: 'unavailable', message: error.message }); }
      }
      return references;
    },
    async load(id) {
      const dir = join(base, 'references', validateId(id));
      const record = JSON.parse(await readFile(join(dir, 'reference.json'), 'utf8'));
      if (record.mode === 'live') return assertLinked(record, id);
      assertReference(record, id);
      return { ...record, imagePath: join(dir, 'reference.png') };
    },
    async link(record) {
      assertLinked(record, record.id);
      const parent = join(base, 'references');
      await mkdir(parent, { recursive: true });
      const dir = join(parent, record.id);
      await mkdir(dir);
      try { await writeFile(join(dir, 'reference.json'), JSON.stringify(record, null, 2)); return dir; }
      catch (error) { await rm(dir, { recursive: true, force: true }); throw error; }
    },
    async save(id, snapshot, png, capture) {
      const record = assertReference({ schemaVersion: 1, id: validateId(id), createdAt: new Date().toISOString(), capture, snapshot }, id);
      const parent = join(base, 'references');
      await mkdir(parent, { recursive: true });
      const dir = join(parent, validateId(id));
      // mkdir is the exclusive claim: two registrations cannot silently replace a baseline.
      await mkdir(dir);
      try {
        await writeFile(join(dir, 'reference.png'), png);
        await writeFile(join(dir, 'reference.json'), JSON.stringify(record, null, 2));
        return dir;
      } catch (error) {
        await rm(dir, { recursive: true, force: true });
        throw error;
      }
    },
    async publish(referenceId, artifacts) {
      validateId(referenceId);
      for (const name of Object.keys(artifacts)) {
        if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name)) throw new Error('자료 파일명: 경로 없는 파일명 필요');
      }
      const parent = join(base, 'reports');
      await mkdir(parent, { recursive: true });
      const name = `${referenceId}-${Date.now()}-${randomUUID().slice(0, 8)}`;
      const staging = join(parent, `.${name}`);
      await mkdir(staging);
      try {
        // Wait for every writer before cleaning staging after any failed write.
        const writes = await Promise.allSettled(Object.entries(artifacts).map(([filename, bytes]) => writeFile(join(staging, filename), bytes)));
        const failed = writes.find(result => result.status === 'rejected');
        if (failed) throw failed.reason;
        const destination = join(parent, name);
        await rename(staging, destination);
        return destination;
      } catch (error) {
        await rm(staging, { recursive: true, force: true });
        throw error;
      }
    },
  };
  return repository;
}

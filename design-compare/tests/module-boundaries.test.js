import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../src/', import.meta.url));
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory()
    ? files(resolve(directory, entry.name))
    : entry.name.endsWith('.js') ? [resolve(directory, entry.name)] : []))).flat();
}
function imports(text) {
  return [...text.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)["']([^"']+)["']/g)].map(match => match[1]);
}

test('mod_001: Domain owns pure contracts without adapter or I/O dependencies', async () => {
  for (const file of await files(resolve(source, 'domain'))) {
    for (const dependency of imports(await readFile(file, 'utf8'))) {
      assert.ok(dependency.startsWith('.'), `${relative(source, file)} imports external ${dependency}`);
      const target = relative(resolve(source, 'domain'), resolve(dirname(file), dependency));
      assert.ok(!target.startsWith('..'), `${relative(source, file)} reaches outside Domain: ${dependency}`);
    }
  }
});

test('mod_001: Library cannot depend on application, capture or transport adapters', async () => {
  for (const file of await files(resolve(source, 'library'))) {
    for (const dependency of imports(await readFile(file, 'utf8'))) {
      if (!dependency.startsWith('.')) continue;
      const target = relative(source, resolve(dirname(file), dependency));
      assert.ok(!/^(application(?:\/|\.js)|cli\/|capture\/|audit\/|hub\/)/.test(target), `${relative(source, file)} -> ${target}`);
    }
  }
});

test('mod_001: capture compatibility facade exports the Domain contract identities', async () => {
  const domain = await import('../src/domain/capture-contract.js');
  const facade = await import('../src/capture/contract.js');
  for (const name of Object.keys(domain)) assert.equal(facade[name], domain[name], name);
});

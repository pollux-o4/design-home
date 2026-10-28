import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, readFile, symlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { loadProject } from '../src/project.js';
import { createHubServer } from '../hub/server.js';
const run = promisify(execFile);

test('project-owned configuration isolates catalogs and stores across simultaneous servers', async () => {
  const root = await mkdtemp(join(tmpdir(), 'design-project-'));
  const servers = [];
  try {
    for (const name of ['Alpha', 'Beta']) {
      const directory = join(root, name);
      await mkdir(directory);
      await mkdir(join(directory, 'docs'));
      await writeFile(join(directory, 'sample.html'), `<main>${name}</main>`);
      const metadata = { schemaVersion: 1, id: name, title: name, summary: `${name} 화면`, sourcePath: 'sample.html', previewPath: '/sample.html', tags: ['minimal'], structure: [], interactions: [], constraints: [], viewport: { width: 800, height: 600 } };
      await writeFile(join(directory, 'docs/sample.md'), '```json\n' + JSON.stringify(metadata) + '\n```\n');
      await writeFile(join(directory, 'design-system.config.json'), JSON.stringify({ schemaVersion: 1, name, documentsRoot: 'docs' }));
      const project = loadProject({ cwd: directory });
      assert.equal(project.store, join(directory, '.design-compare'));
      const server = createHubServer({ project });
      await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
      servers.push(server);
      const base = `http://127.0.0.1:${server.address().port}`;
      assert.equal((await (await fetch(`${base}/api/project`)).json()).name, name);
      assert.deepEqual((await (await fetch(`${base}/api/search`)).json()).results.map(item => item.id), [name]);
      assert.equal((await (await fetch(`${base}/api/context?id=${name}`)).json()).sourceFiles[0].absolutePath, join(directory, 'sample.html'));
    }
    await writeFile(join(root, 'broken.json'), '{"schemaVersion": 1, "name": "", "store": false}');
    assert.throws(() => loadProject({ config: join(root, 'broken.json') }), /프로젝트 설정/);
  } finally {
    await Promise.all(servers.map(server => new Promise(resolve => server.close(resolve))));
    await rm(root, { recursive: true, force: true });
  }
});

test('packed tool runs in an unrelated project without Design Home content or navigation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'design-distribution-'));
  let browser, server;
  try {
    await run('npm', ['pack', '--pack-destination', root, '--json'], { cwd: resolve('.') });
    const { readdir } = await import('node:fs/promises');
    const archive = (await readdir(root)).find(name => name.endsWith('.tgz'));
    await run('tar', ['-xzf', join(root, archive), '-C', root]);
    const packageRoot = join(root, 'package');
    await symlink(resolve('node_modules'), join(packageRoot, 'node_modules'), 'dir');
    const projectRoot = join(root, 'consumer');
    await mkdir(projectRoot);
    await writeFile(join(projectRoot, 'design-system.config.json'), JSON.stringify({ schemaVersion: 1, name: '외부 제품', store: 'review-data' }));
    const cli = await run(process.execPath, [join(packageRoot, 'src/cli.js'), 'search', '--json'], { cwd: projectRoot });
    assert.deepEqual(JSON.parse(cli.stdout).results, []);
    try {
      await run(process.execPath, [join(packageRoot, 'src/cli.js'), 'invalid-command', '--json'], { cwd: projectRoot });
      assert.fail('invalid command should fail');
    } catch (error) {
      assert.equal(error.code, 2);
      assert.ok(JSON.parse(error.stdout).activity.path.startsWith(join(projectRoot, 'review-data')));
    }
    try {
      await run(process.execPath, [join(packageRoot, 'src/cli.js'), 'search', '--json'], {
        cwd: projectRoot, env: { ...process.env, DESIGN_CONFIG: join(projectRoot, 'missing.json') },
      });
      assert.fail('missing explicit configuration should fail');
    } catch (error) {
      assert.equal(error.code, 2);
      assert.equal(JSON.parse(error.stdout).status, 'error');
    }
    const { createHubServer: createPackedServer } = await import(pathToFileURL(join(packageRoot, 'hub/server.js')));
    server = createPackedServer({ project: loadProject({ cwd: projectRoot }) });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.locator('#project-name').filter({ hasText: '외부 제품' }).waitFor();
    assert.equal(await page.locator('#dh-global-nav').count(), 0);
    await page.locator('#workspace-theme').selectOption('light');
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await page.locator('#workspace-theme').selectOption('dark');
    await page.getByRole('link', { name: /품질 점검/ }).click();
    await page.getByRole('link', { name: /색 대비 검사/ }).click();
    await page.locator('#contrast-foreground').fill('#777777');
    await page.locator('#contrast-checker').evaluate(form => form.requestSubmit());
    assert.match(await page.locator('#contrast-result').textContent(), /AA 미달/);
    await page.goto(`http://127.0.0.1:${server.address().port}/design-library/#/accessibility/controls`);
    await page.getByRole('button', { name: '이 예시 점검', exact: true }).click();
    assert.match(await page.locator('#control-audit-results').textContent(), /기본 날짜 선택/);
    const audit = await run(process.execPath, [join(packageRoot, 'src/cli.js'), 'audit', '--url', `http://127.0.0.1:${server.address().port}/design-library/#/accessibility/controls`, '--selector', '#control-audit-sample', '--json'], { cwd: projectRoot });
    assert.ok(JSON.parse(audit.stdout).findings.some(finding => finding.kind === 'native-date-picker'));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(errors, []);
    const html = await readFile(join(packageRoot, 'dist/runtime/design-library/index.html'), 'utf8');
    assert.doesNotMatch(html, /Design Home|global-nav.js/);
  } finally {
    await browser?.close();
    if (server) await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  }
});

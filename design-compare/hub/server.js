#!/usr/bin/env node
import { createApiHandler } from './api.js';
import { activityStore } from '../src/activity/index.js';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApplication } from '../src/application.js';
import { createLibrary } from '../src/library/index.js';
import { loadProject } from '../src/project.js';
import { existsSync } from 'node:fs';
const runtime = fileURLToPath(new URL('../dist/runtime/', import.meta.url));
const workspace = fileURLToPath(new URL('../../', import.meta.url));
const home = existsSync(resolve(workspace, 'design-library/index.html')) ? workspace : runtime;
const standalone = home === runtime;
const web = fileURLToPath(new URL('./web/', import.meta.url));
export function createHubServer({ project = loadProject(), store = project.store } = {}) {
  const app = createApplication({ project }), library = createLibrary(project), activity = activityStore(store);
  const hosted = !standalone && project.sourceRoot === resolve(workspace);
  const handleApi = createApiHandler({ app, library, activity, project, hosted, store });
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      if (request.method !== 'GET') { response.writeHead(405); response.end(); return; }
      if (await handleApi(url, response)) return;
      const path = decodeURIComponent(url.pathname);
      if (path === '/design-library') { response.writeHead(302, { Location: '/design-library/' }); response.end(); return; }
      if (path === '/design-library/' || path === '/design-library/index.html') {
        const html = await readFile(hosted ? resolve(home, 'design-library/index.html') : fileURLToPath(new URL('./index.html', import.meta.url)), 'utf8');
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        response.end(html.replace('data-mode="static"', 'data-mode="local"')); return;
      }
      const base = path.startsWith('/hub-assets/') ? web : home;
      if (path === '/' && !hosted) { response.writeHead(302, { Location: '/design-library/' }); response.end(); return; }
      const relative = path === '/' ? 'index.html' : path.startsWith('/hub-assets/') ? path.slice(12) : `.${path}`;
      const file = resolve(base, relative);
      if (!file.startsWith(resolve(base) + sep)) { response.writeHead(403); response.end(); return; }
      const data = await readFile(file);
      // shortcut: 로컬 편집 서버는 압축·장기 캐시 없이 원본 응답, 공용 배포 시 정적 호스트의 압축과 버전별 자산 캐시 확인.
      response.writeHead(200, {'Content-Type':{'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png'}[extname(file)] ?? 'application/octet-stream'}); response.end(data);
    } catch (error) { response.writeHead(error.code === 'ENOENT' ? 404 : 400, {'Content-Type':'application/json; charset=utf-8'}); response.end(JSON.stringify({error:error.message})); }
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 4184);
  createHubServer().listen(port, '127.0.0.1', () => console.log(`Design System Library: http://127.0.0.1:${port}/design-library/`));
}

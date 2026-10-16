import { activityStore } from '../src/activity/index.js';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApplication } from '../src/application.js';
import { searchDesigns, getDesignContext } from '../src/hub/index.js';
const home = fileURLToPath(new URL('../../', import.meta.url));
const web = fileURLToPath(new URL('./web/', import.meta.url));
export function createHubServer({ store = process.env.DESIGN_STORE } = {}) {
  const app = createApplication(), activity = activityStore(store);
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      if (request.method !== 'GET') { response.writeHead(405); response.end(); return; }
      if (url.pathname === '/api/activity' || url.pathname.startsWith('/api/activity/')) {
        const segments = url.pathname.split('/').slice(3).map(decodeURIComponent);
        if (segments.length === 3 && segments[1] === 'files') {
          const data = await activity.artifact(segments[0], segments[2]);
          const type = { '.png': 'image/png', '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8' }[extname(segments[2])];
          response.writeHead(200, { 'Content-Type': type ?? 'application/octet-stream', 'Cache-Control': 'no-store' }); response.end(data); return;
        }
        if (segments.length > 1) throw new Error('잘못된 호출 경로');
        const result = segments.length ? await activity.get(segments[0]) : { entries: await activity.recent() };
        response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); response.end(JSON.stringify(result)); return;
      }
      if (url.pathname === '/api/components') {
        const result = url.searchParams.has('id') ? await app.inspect({ id: url.searchParams.get('id'), store }) : await app.listReferences({ store });
        response.writeHead(200, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); response.end(JSON.stringify(result)); return;
      }
      if (url.pathname === '/api/search' || url.pathname === '/api/context') {
        const result = url.pathname === '/api/search' ? await searchDesigns(url.searchParams.get('q') ?? '', url.searchParams.getAll('tag'), url.searchParams.get('kind')) : await getDesignContext(url.searchParams.get('id') ?? '');
        response.writeHead(200, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); response.end(JSON.stringify(result)); return;
      }
      const path = decodeURIComponent(url.pathname);
      if (path === '/design-library') { response.writeHead(302, { Location: '/design-library/' }); response.end(); return; }
      if (path === '/design-library/' || path === '/design-library/index.html') {
        const html = await readFile(resolve(home, 'design-library/index.html'), 'utf8');
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        response.end(html.replace('data-mode="static"', 'data-mode="local"')); return;
      }
      const base = path.startsWith('/hub-assets/') ? web : home;
      const relative = path === '/' ? 'index.html' : path.startsWith('/hub-assets/') ? path.slice(12) : `.${path}`;
      const file = resolve(base, relative);
      if (!file.startsWith(resolve(base) + sep)) { response.writeHead(403); response.end(); return; }
      const data = await readFile(file);
      response.writeHead(200, {'Content-Type':{'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png'}[extname(file)] ?? 'application/octet-stream'}); response.end(data);
    } catch (error) { response.writeHead(error.code === 'ENOENT' ? 404 : 400, {'Content-Type':'application/json; charset=utf-8'}); response.end(JSON.stringify({error:error.message})); }
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 4184);
  createHubServer().listen(port, '127.0.0.1', () => console.log(`Design Library: http://127.0.0.1:${port}/design-library/`));
}

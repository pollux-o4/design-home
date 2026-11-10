import { extname } from 'node:path';

function json(response, value) {
  response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(value));
}

export function createApiHandler({ app, library, activity, project, hosted, store }) {
  return async (url, response) => {
    if (url.pathname === '/api/project') {
      json(response, { name: project.name, configured: project.configured }); return true;
    }
    if (url.pathname === '/api/activity' || url.pathname.startsWith('/api/activity/')) {
      const segments = url.pathname.split('/').slice(3).map(decodeURIComponent);
      if (segments.length === 3 && segments[1] === 'files') {
        const data = await activity.artifact(segments[0], segments[2]);
        const type = { '.png': 'image/png', '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8' }[extname(segments[2])];
        response.writeHead(200, { 'Content-Type': type ?? 'application/octet-stream', 'Cache-Control': 'no-store' }); response.end(data); return true;
      }
      if (segments.length > 1) throw new Error('잘못된 호출 경로');
      const result = segments.length ? await activity.get(segments[0]) : { entries: await activity.recent() };
      json(response, result); return true;
    }
    if (url.pathname === '/api/components') {
      const result = url.searchParams.has('id') ? await app.inspect({ id: url.searchParams.get('id'), store }) : await app.listReferences({ store });
      json(response, result); return true;
    }
    if (url.pathname === '/api/search' || url.pathname === '/api/context') {
      const result = url.pathname === '/api/search' ? library.search(url.searchParams.get('q') ?? '', url.searchParams.getAll('tag'), url.searchParams.get('kind')) : await library.context(url.searchParams.get('id') ?? '');
      if (!hosted) {
        if (result.results) result.results = result.results.map(item => ({ ...item, thumbnail: null }));
        else result.previewPath = project.baseUrl ? new URL(result.previewPath, project.baseUrl).href : null;
      }
      json(response, result); return true;
    }
    return false;
  };
}

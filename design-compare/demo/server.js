import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const home = resolve(fileURLToPath(new URL('../../', import.meta.url)));
export function demoPage(variant) {
  const drift = variant === 'drift', renamed = variant === 'renamed';
  return `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Design Compare · ${variant}</title>
<link rel="stylesheet" href="/shared/css/interface.css"><link rel="stylesheet" href="/ui-components/css/components.css"><style>
:root{--font-size-base:14px;--font-size-sm:12px;color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#edf0f3;color:#18293a;font-family:Arial,sans-serif}main{padding:48px 24px;max-width:1100px;margin:auto}header{margin-bottom:36px}h1{font-size:28px;margin:0}header p{color:#516073}article{width:360px;max-width:100%;padding:24px;background:#fff;border:1px solid #d7dde5;border-radius:16px;box-shadow:0 8px 24px #1b30420d}article h2{font-size:20px;line-height:1.4;margin:0 0 12px}article p{font-size:14px;line-height:1.6;color:#516073;margin:0 0 24px}.label{font-size:11px;color:#5c6372;letter-spacing:2px;font-weight:bold;margin-bottom:12px}.ui-btn:focus-visible{outline:3px solid #1241a5;outline-offset:4px}
${drift ? 'article{padding:32px;border-radius:4px}article h2{font-size:24px}.ui-btn-primary{background:#ef4444;box-shadow:none}' : ''}
${renamed ? '.new-card{isolation:isolate}' : ''}
@media(prefers-color-scheme:dark){body{background:#111c27;color:#f4f7fb}article{background:#1b2b3d;border-color:#405065}article p,header p,.label{color:#c1cddd}}
</style><main><header><p>DESIGN HOME · COMPONENT LAB</p><h1>제품 카드 비교</h1><p>기준 스타일과 새 페이지의 차이를 확인하는 독립 데모</p></header>
<article data-design-id="box-art" data-design-source="design-compare/demo/server.js#box-art" class="${renamed ? 'new-card' : 'box-art'}"><div class="label">DESIGN SYSTEM / 01</div><h2 data-part="title">만드는 사람의 정성</h2><p data-part="description">승인된 컴포넌트와 실제 적용 스타일을 함께 비교해, 작은 차이까지 확인하세요.</p><button data-part="action" data-design-source="ui-components/css/components.css#.ui-btn-primary" class="ui-btn ui-btn-primary">프로젝트 보기</button></article></main></html>`;
}

export function createDemoServer() {
  return createServer(async (request, response) => {
    try {
      const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (path === '/slow-image') return;
      if (path === '/stalled') {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end('<html><style>body{margin:0}main{margin-top:10000px;width:200px;height:200px}</style><main><img loading="lazy" src="/slow-image" width="100" height="100"></main></html>'); return;
      }
      if (path === '/origin') {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end('<html><style>body{margin:0}main{width:200px;height:200px;background:red}main:hover{background:blue}</style><main>origin</main></html>'); return;
      }
      if (['/', '/reference', '/same', '/drift', '/renamed', '/missing', '/duplicate', '/wide'].includes(path)) {
        let html = demoPage(path.slice(1) || 'reference');
        if (path === '/missing') html = html.replace('data-part="title"', 'data-part="gone"');
        if (path === '/duplicate') html = html.replace('</main>', '<article data-design-id="box-art">중복</article></main>');
        if (path === '/wide') html = html.replace('width:360px', 'width:720px');
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        response.end(html); return;
      }
      const file = resolve(home, `.${path}`);
      if (!file.startsWith(home + sep)) { response.writeHead(403); response.end(); return; }
      const body = await readFile(file);
      const type = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.json':'application/json', '.png':'image/png' }[extname(file)] ?? 'application/octet-stream';
      response.writeHead(200, { 'Content-Type': type }); response.end(body);
    } catch {
      response.writeHead(404); response.end('Not found');
    }
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 4173);
  createDemoServer().listen(port, '127.0.0.1', () => console.log(`Demo: http://127.0.0.1:${port}/reference\nDesign Home: http://127.0.0.1:${port}/index.html`));
}

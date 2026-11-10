// Standalone report stylesheet; comparison width is supplied by the document renderer.
export const reportStyles = `
*{box-sizing:border-box}
body{margin:0;background:#f5f5f2;color:#222b29;font:15px/1.6 system-ui,sans-serif}
main{max-width:1280px;margin:auto;padding:40px 32px 80px}
header{display:flex;justify-content:space-between;align-items:start;gap:24px;border-bottom:1px solid #ccd3ce;padding-bottom:24px}
h1{font-size:32px;letter-spacing:-1px;margin:4px 0}
h2{font-size:20px;margin:30px 0 12px}
h3{font-size:15px}
p{margin:8px 0}
.eyebrow{font-size:12px;font-weight:700;letter-spacing:2px;color:#49655a}
.status{border:1px solid;padding:5px 12px;border-radius:5px;white-space:nowrap;font-weight:700}
.fail{color:#9b3527;background:#fff1ec}
.pass{color:#17643f;background:#e9f4eb}
.muted{color:#52615b;font-size:13px}
.metrics{display:flex;gap:32px;padding:20px 0}
.metrics strong{display:block;font-size:25px}
.metrics span{font-size:13px;color:#52615b}
.notice{padding:12px 16px;background:#e8eee9;border-left:3px solid #526f5e;font-size:13px}
.toolbar{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin:16px 0}
button,a,input{accent-color:#285c47}
button{background:white;color:#243b2e;border:1px solid #98aaa0;padding:8px 14px;border-radius:5px;cursor:pointer;font:inherit}
button[aria-pressed=true]{background:#284e3b;color:white}
button:focus-visible,a:focus-visible,input:focus-visible,summary:focus-visible{outline:3px solid #346ec0;outline-offset:3px}
a{color:#21543c}
.screens{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.screen{margin:0;background:white;border:1px solid #d2d9d3;border-radius:8px;overflow:hidden}
.screen figcaption{padding:10px 14px;border-bottom:1px solid #d2d9d3;font-weight:600}
.image-wrap{padding:20px;overflow:auto;background:repeating-conic-gradient(#f7f7f7 0% 25%,#eee 0% 50%) 0/16px 16px}
.screen img{display:block;width:100%;height:auto}
.overlay{display:none;background:white;border:1px solid #d2d9d3;padding:20px;overflow:auto;border-radius:8px}
.overlay-stage{position:relative;width:100%;max-width:var(--comparison-width);margin:auto}
.overlay-stage img{display:block;width:100%}
.overlay-stage .candidate{position:absolute;inset:0;opacity:.5}
.table-wrap{overflow:auto;background:white;border:1px solid #d2d9d3;border-radius:8px}
table{width:100%;min-width:720px;border-collapse:collapse;font-size:13px}
th,td{padding:12px;text-align:left;border-bottom:1px solid #e1e6e0;vertical-align:top}
thead{background:#eaf0e9}
code{font:12px/1.5 ui-monospace,monospace;overflow-wrap:anywhere}
details{border-bottom:1px solid #ccd3ce;padding:14px 0}
summary{cursor:pointer;font-weight:600}
.mapping{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.empty{padding:24px;background:white;border:1px solid #d2d9d3;border-radius:8px}
footer{margin-top:32px;font-size:13px}
.source{overflow-wrap:anywhere}
@media(max-width:700px){main{padding:24px 16px 48px}
h1{font-size:25px}
.screens,.mapping{grid-template-columns:1fr}
.metrics{gap:18px}
.metrics strong{font-size:20px}
.image-wrap{padding:12px}
header{gap:12px}
}

.tasks{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:16px 0}
.task{text-align:left;display:flex;flex-direction:column;gap:6px;min-width:0}
.task strong{font-size:17px}
.task span{font-size:13px;word-break:keep-all}
.task code{font-size:11px}
.image-stage{position:relative}
.region{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.filters{display:flex;gap:16px;flex-wrap:wrap;align-items:center}
.filters label{font-size:13px}
.filters select,.filters input[type=search]{padding:8px;border:1px solid #98aaa0;border-radius:5px;font:inherit;max-width:100%;background:white;color:#222b29}
.filters input[type=search]{width:190px}
select:focus-visible{outline:3px solid #346ec0;outline-offset:3px}
.jump{display:flex;gap:18px;flex-wrap:wrap;font-size:13px;margin-top:16px}
.table-wrap:focus-visible{outline:3px solid #346ec0;outline-offset:3px}
.table-empty{padding:16px;background:white;border:1px solid #d2d9d3;border-radius:8px}
[hidden]{display:none!important}
@media(max-width:700px){.tasks{grid-template-columns:1fr 1fr}
.task{padding:10px}
.task code{display:none}
.filters{gap:10px}
}

`;

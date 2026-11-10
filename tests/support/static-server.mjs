import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../../", import.meta.url));
const contentTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
};

export function createStaticServer({ prefix = "/" } = {}) {
  return createServer(async (request, response) => {
    try {
      const path = new URL(request.url, "http://local").pathname;
      if (!path.startsWith(prefix)) throw new Error("Unknown prefix");
      const relative = decodeURIComponent(path.slice(prefix.length));
      const file = resolve(root, relative + (path.endsWith("/") ? "index.html" : ""));
      if (!file.startsWith(resolve(root) + sep)) throw new Error("Outside root");
      const data = await readFile(file);
      response.setHeader("content-type", contentTypes[extname(file)] ?? "application/octet-stream");
      response.end(data);
    } catch {
      response.writeHead(404).end();
    }
  });
}

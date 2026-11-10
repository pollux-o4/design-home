import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { defineConfig } from "vite";
import {
  collectStaticSiteAssets,
  collectStaticSitePages,
} from "./scripts/site-build/static-site-assets.mjs";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const staticSiteAssets = {
  name: "design-home-static-site-assets",
  apply: "build",
  async generateBundle() {
    for (const asset of await collectStaticSiteAssets(projectRoot)) {
      this.emitFile({ type: "asset", fileName: asset.fileName, source: asset.source });
    }
  },
};

export default defineConfig({
  root: projectRoot,
  publicDir: false,
  server: {
    host: "127.0.0.1",
    proxy: {
      "/api": "http://127.0.0.1:4184",
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rolldownOptions: {
      input: await collectStaticSitePages(projectRoot).then((pages) =>
        Object.fromEntries(
          pages.map(({ fileName, absolutePath }) => [
            fileName.replace(/\.html$/, ""),
            absolutePath,
          ]),
        ),
      ),
    },
  },
  plugins: [staticSiteAssets],
});

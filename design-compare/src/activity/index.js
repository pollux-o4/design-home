import { mkdir, writeFile, readFile, readdir, rename, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";

const safe = (value) => typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(value);
export function activityStore(root = ".design-compare") {
  const base = join(resolve(root), "activity");
  async function get(id) {
    if (!safe(id)) throw new Error("잘못된 호출 ID");
    return JSON.parse(await readFile(join(base, id, "entry.json"), "utf8"));
  }
  return {
    async begin({ command, args, taskId }) {
      if (taskId && !safe(taskId)) throw new Error("잘못된 task ID");
      const id = `${Date.now()}-${randomUUID()}`,
        task = taskId ?? randomUUID();
      const directory = join(base, id),
        staging = join(base, `.${id}`);
      await mkdir(staging, { recursive: true });
      const entry = {
        schemaVersion: 1,
        id,
        taskId: task,
        command,
        args,
        createdAt: new Date().toISOString(),
      };
      const images = [],
        files = [];
      return {
        id,
        taskId: task,
        store: resolve(root),
        async file(name, bytes) {
          if (!safe(name)) throw new Error("파일명 필요");
          await writeFile(join(staging, name), bytes);
          files.push(name);
          return join(directory, name);
        },
        async image(name, bytes, label) {
          if (!safe(name) || !name.endsWith(".png")) throw new Error("PNG 파일명 필요");
          await writeFile(join(staging, name), bytes);
          files.push(name);
          const path = join(directory, name);
          images.push({ name, path, label });
          return path;
        },
        async finish(output, { exitCode = 0, text = null } = {}) {
          const activity = { id, taskId: task, path: join(directory, "entry.json") };
          const delivered = { ...output, taskId: task, activity };
          const provided = new Set([
            ...(output.items ?? []).map((item) => item.imagePath),
            ...Object.values(output.evidence?.images ?? {}),
          ]);
          const deliveredImages = images.filter((image) => provided.has(image.path));
          const deliveredFiles =
            output.status === "error"
              ? []
              : files.filter(
                  (name) =>
                    !name.endsWith(".png") || deliveredImages.some((image) => image.name === name),
                );
          await writeFile(
            join(staging, "entry.json"),
            JSON.stringify(
              {
                ...entry,
                exitCode,
                images: deliveredImages,
                files: deliveredFiles,
                output: delivered,
                text: text ? `${text}\n호출 기록: ${activity.path}` : null,
              },
              null,
              2,
            ),
          );
          await rename(staging, directory);
          return delivered;
        },
        abort: () => rm(staging, { recursive: true, force: true }),
      };
    },
    get,
    async recent(limit = 10) {
      let directories;
      try {
        directories = await readdir(base, { withFileTypes: true });
      } catch (error) {
        if (error.code === "ENOENT") return [];
        throw error;
      }
      return Promise.all(
        directories
          .filter((item) => item.isDirectory() && !item.name.startsWith("."))
          .map((item) => item.name)
          .sort()
          .reverse()
          .slice(0, limit)
          .map(get),
      );
    },
    async artifact(id, name) {
      const entry = await get(id);
      if (!safe(name) || !entry.files.includes(name)) throw new Error("이 호출에 없는 이미지");
      return readFile(join(base, id, name));
    },
  };
}

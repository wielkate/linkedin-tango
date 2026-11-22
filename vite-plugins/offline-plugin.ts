import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import {
  createPrecachePaths,
  createServiceWorkerSource,
  SERVICE_WORKER_FILE_NAME,
} from "../src/offline/service-worker-source";

const TEMPLATE_PATH = fileURLToPath(
  new URL("../src/offline/service-worker.template.js", import.meta.url),
);

// After the build, writes dist/service-worker.js: the template with the list of every built
// file and a version that changes whenever any of them changes.
export function offlinePlugin(): Plugin {
  return {
    name: "offline-service-worker",
    apply: "build",
    async writeBundle(outputOptions) {
      const outputDirectory = outputOptions.dir;
      if (!outputDirectory) {
        throw new Error("The offline plugin needs an output directory.");
      }

      const builtFilePaths = await listFilesRelativeTo(outputDirectory);
      const precachePaths = createPrecachePaths(builtFilePaths);
      const cacheVersion = await hashFiles(outputDirectory, builtFilePaths);
      const template = await readFile(TEMPLATE_PATH, "utf8");

      await writeFile(
        path.join(outputDirectory, SERVICE_WORKER_FILE_NAME),
        createServiceWorkerSource(template, precachePaths, cacheVersion),
      );
    },
  };
}

async function listFilesRelativeTo(directory: string): Promise<string[]> {
  const entries = await readdir(directory, {
    recursive: true,
    withFileTypes: true,
  });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) =>
      path.relative(directory, path.join(entry.parentPath, entry.name)),
    )
    .map((filePath) => filePath.split(path.sep).join("/"));
}

async function hashFiles(
  directory: string,
  filePaths: readonly string[],
): Promise<string> {
  const hash = createHash("sha256");
  for (const filePath of [...filePaths].sort()) {
    hash.update(filePath);
    hash.update(await readFile(path.join(directory, filePath)));
  }
  return hash.digest("hex").slice(0, 12);
}

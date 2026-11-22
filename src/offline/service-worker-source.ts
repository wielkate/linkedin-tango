export const SERVICE_WORKER_FILE_NAME = "service-worker.js";

const CACHE_VERSION_PLACEHOLDER = '"__CACHE_VERSION__"';
const PRECACHE_PATHS_PLACEHOLDER = '"__PRECACHE_PATHS__"';

// Every built file except the service worker itself, plus "./" for the page address without
// "index.html". The paths are relative, so they work under any GitHub Pages folder.
export function createPrecachePaths(
  builtFilePaths: readonly string[],
): string[] {
  const filePathsToStore = builtFilePaths
    .filter((filePath) => filePath !== SERVICE_WORKER_FILE_NAME)
    .sort();
  return ["./", ...filePathsToStore];
}

// Fills the placeholders of the service worker template. A replacement function is used so a
// "$" in a file name is never read as a special replacement pattern.
export function createServiceWorkerSource(
  template: string,
  precachePaths: readonly string[],
  cacheVersion: string,
): string {
  assertTemplateContains(template, CACHE_VERSION_PLACEHOLDER);
  assertTemplateContains(template, PRECACHE_PATHS_PLACEHOLDER);

  const cacheVersionLiteral = JSON.stringify(cacheVersion);
  const precachePathsLiteral = JSON.stringify(JSON.stringify(precachePaths));

  return template
    .replace(CACHE_VERSION_PLACEHOLDER, () => cacheVersionLiteral)
    .replace(PRECACHE_PATHS_PLACEHOLDER, () => precachePathsLiteral);
}

function assertTemplateContains(template: string, placeholder: string): void {
  if (!template.includes(placeholder)) {
    throw new Error(`The service worker template has no ${placeholder}.`);
  }
}

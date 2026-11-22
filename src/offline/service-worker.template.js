// The offline service worker. The build (vite-plugins/offline-plugin.ts) copies this file to
// dist/service-worker.js and fills in the two placeholders below:
//   - the cache version, a hash of every built file, so a new release gets a new cache
//   - the list of every built file, so the whole game is stored on the first visit
//
// Strategy: cache first. Every file of the game is stored when the worker installs, so the
// game opens without a network. A new release is installed next to the old one and takes over
// when every tab of the old one is closed, so a game in progress never loses its files.

const CACHE_PREFIX = "tango-";
const CACHE_VERSION = "__CACHE_VERSION__";
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
const PRECACHE_PATHS = JSON.parse("__PRECACHE_PATHS__");

self.addEventListener("install", (event) => {
  event.waitUntil(storeEveryGameFile());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(deleteOutdatedCaches().then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (isGameFileRequest(event.request)) {
    event.respondWith(respondOfflineFirst(event.request));
  }
});

async function storeEveryGameFile() {
  const cache = await caches.open(CACHE_NAME);
  const requests = PRECACHE_PATHS.map(
    (path) => new Request(new URL(path, self.location), { cache: "reload" }),
  );
  await cache.addAll(requests);
}

async function deleteOutdatedCaches() {
  const cacheNames = await caches.keys();
  const outdatedCacheNames = cacheNames.filter(
    (cacheName) =>
      cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME,
  );
  await Promise.all(
    outdatedCacheNames.map((cacheName) => caches.delete(cacheName)),
  );
}

function isGameFileRequest(request) {
  const isGetRequest = request.method === "GET";
  const isFromThisSite = new URL(request.url).origin === self.location.origin;
  return isGetRequest && isFromThisSite;
}

async function respondOfflineFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const storedResponse = await cache.match(request, { ignoreSearch: true });
  if (storedResponse) {
    return storedResponse;
  }
  try {
    return await fetch(request);
  } catch (error) {
    const storedPage = await findStoredPageFor(request, cache);
    if (storedPage) {
      return storedPage;
    }
    throw error;
  }
}

async function findStoredPageFor(request, cache) {
  const isPageRequest = request.mode === "navigate";
  if (!isPageRequest) {
    return undefined;
  }
  return cache.match(new URL("./", self.location), { ignoreSearch: true });
}

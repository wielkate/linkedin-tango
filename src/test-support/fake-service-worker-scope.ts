type EventListener = (event: object) => void;
type RequestLike = Pick<Request, "url">;
type MatchTarget = RequestLike | URL;
type ServiceWorkerRequest = Pick<Request, "method" | "url" | "mode">;

class FakeCache {
  private readonly responsesByUrl = new Map<string, Response>();

  constructor(
    private readonly fetchFromNetwork: (
      request: RequestLike,
    ) => Promise<Response>,
  ) {}

  async addAll(requests: RequestLike[]): Promise<void> {
    for (const request of requests) {
      this.responsesByUrl.set(
        request.url,
        await this.fetchFromNetwork(request),
      );
    }
  }

  async match(
    target: MatchTarget,
    options: { ignoreSearch?: boolean } = {},
  ): Promise<Response | undefined> {
    const targetUrl = target instanceof URL ? target.href : target.url;
    const storedUrl = [...this.responsesByUrl.keys()].find(
      (storedAddress) =>
        removeSearch(storedAddress, options.ignoreSearch) ===
        removeSearch(targetUrl, options.ignoreSearch),
    );
    return storedUrl ? this.responsesByUrl.get(storedUrl)?.clone() : undefined;
  }

  get storedUrls(): string[] {
    return [...this.responsesByUrl.keys()];
  }
}

function removeSearch(address: string, shouldRemove = false): string {
  return shouldRemove ? address.split("?")[0] : address;
}

class FakeCacheStorage {
  private readonly cachesByName = new Map<string, FakeCache>();

  constructor(
    private readonly fetchFromNetwork: (
      request: RequestLike,
    ) => Promise<Response>,
  ) {}

  async open(cacheName: string): Promise<FakeCache> {
    const existingCache = this.cachesByName.get(cacheName);
    if (existingCache) {
      return existingCache;
    }
    const newCache = new FakeCache(this.fetchFromNetwork);
    this.cachesByName.set(cacheName, newCache);
    return newCache;
  }

  async keys(): Promise<string[]> {
    return [...this.cachesByName.keys()];
  }

  async delete(cacheName: string): Promise<boolean> {
    return this.cachesByName.delete(cacheName);
  }
}

// Runs the real service worker source against in-memory stand-ins for the browser's caches
// and network, so tests can check how the worker behaves without a browser.
export class FakeServiceWorkerScope {
  readonly fetchedUrls: string[] = [];
  isOffline = false;
  claimCount = 0;

  private readonly cacheStorage = new FakeCacheStorage((request) =>
    this.fetchFromNetwork(request),
  );
  private readonly listenersByType = new Map<string, EventListener>();

  constructor(
    workerSource: string,
    workerAddress = "https://example.test/linkedin-tango/service-worker.js",
  ) {
    const scope = {
      location: new URL(workerAddress),
      clients: {
        claim: async () => {
          this.claimCount += 1;
        },
      },
      addEventListener: (type: string, listener: EventListener) => {
        this.listenersByType.set(type, listener);
      },
    };
    new Function("self", "caches", "fetch", "Request", "URL", workerSource)(
      scope,
      this.cacheStorage,
      (request: RequestLike) => this.fetchFromNetwork(request),
      Request,
      URL,
    );
  }

  async install(): Promise<void> {
    await this.dispatchAndWait("install");
  }

  async activate(): Promise<void> {
    await this.dispatchAndWait("activate");
  }

  // Returns undefined when the worker leaves the request to the browser.
  async respondTo(
    request: ServiceWorkerRequest,
  ): Promise<Response | undefined> {
    let responsePromise: Promise<Response> | undefined;
    this.listenersByType.get("fetch")?.({
      request,
      respondWith: (promise: Promise<Response>) => {
        responsePromise = promise;
      },
    });
    return responsePromise;
  }

  async createCache(cacheName: string): Promise<void> {
    await this.cacheStorage.open(cacheName);
  }

  async listCacheNames(): Promise<string[]> {
    return this.cacheStorage.keys();
  }

  async listStoredUrls(cacheName: string): Promise<string[]> {
    return (await this.cacheStorage.open(cacheName)).storedUrls;
  }

  private async dispatchAndWait(type: string): Promise<void> {
    let waitingPromise: Promise<unknown> = Promise.resolve();
    this.listenersByType.get(type)?.({
      waitUntil: (promise: Promise<unknown>) => {
        waitingPromise = promise;
      },
    });
    await waitingPromise;
  }

  private async fetchFromNetwork(request: RequestLike): Promise<Response> {
    this.fetchedUrls.push(request.url);
    if (this.isOffline) {
      throw new TypeError("Failed to fetch");
    }
    return new Response(`network:${request.url}`);
  }
}

import { beforeEach, describe, expect, it } from "vitest";
import { FakeServiceWorkerScope } from "../test-support/fake-service-worker-scope";
import {
  createPrecachePaths,
  createServiceWorkerSource,
} from "./service-worker-source";
import template from "./service-worker.template.js?raw";

const SITE = "https://example.test/linkedin-tango/";
const CURRENT_CACHE_NAME = "tango-version-1";

function createInstalledWorker(): FakeServiceWorkerScope {
  const precachePaths = createPrecachePaths(["index.html", "assets/app.js"]);
  const source = createServiceWorkerSource(
    template,
    precachePaths,
    "version-1",
  );
  return new FakeServiceWorkerScope(source);
}

function createPageRequest(address: string) {
  return { method: "GET", url: address, mode: "navigate" } as const;
}

function createFileRequest(address: string, method = "GET") {
  return { method, url: address, mode: "no-cors" } as const;
}

describe("service worker", () => {
  let worker: FakeServiceWorkerScope;

  beforeEach(() => {
    worker = createInstalledWorker();
  });

  it("stores every game file when it installs", async () => {
    await worker.install();

    expect(await worker.listStoredUrls(CURRENT_CACHE_NAME)).toEqual([
      SITE,
      `${SITE}assets/app.js`,
      `${SITE}index.html`,
    ]);
  });

  it("answers from the stored files without the network", async () => {
    await worker.install();
    worker.isOffline = true;

    const response = await worker.respondTo(
      createFileRequest(`${SITE}assets/app.js`),
    );

    expect(await response?.text()).toBe(`network:${SITE}assets/app.js`);
  });

  it("does not ask the network for a stored file", async () => {
    await worker.install();
    worker.fetchedUrls.length = 0;

    await worker.respondTo(createFileRequest(`${SITE}assets/app.js`));

    expect(worker.fetchedUrls).toEqual([]);
  });

  it("ignores the search part of the address when it looks for a stored file", async () => {
    await worker.install();
    worker.isOffline = true;

    const response = await worker.respondTo(
      createFileRequest(`${SITE}assets/app.js?cache-buster=1`),
    );

    expect(await response?.text()).toBe(`network:${SITE}assets/app.js`);
  });

  it("asks the network for a file that was not stored", async () => {
    await worker.install();

    const response = await worker.respondTo(
      createFileRequest(`${SITE}unknown.json`),
    );

    expect(await response?.text()).toBe(`network:${SITE}unknown.json`);
  });

  it("opens the stored page when a page is requested without a network", async () => {
    await worker.install();
    worker.isOffline = true;

    const response = await worker.respondTo(
      createPageRequest(`${SITE}?from=home-screen`),
    );

    expect(await response?.text()).toBe(`network:${SITE}`);
  });

  it("fails a file request that has no stored copy and no network", async () => {
    await worker.install();
    worker.isOffline = true;

    const response = worker.respondTo(createFileRequest(`${SITE}unknown.json`));

    await expect(response).rejects.toThrow("Failed to fetch");
  });

  it("leaves requests to other sites to the browser", async () => {
    await worker.install();

    const response = await worker.respondTo(
      createFileRequest("https://other.test/analytics.js"),
    );

    expect(response).toBeUndefined();
  });

  it("leaves requests that are not GET to the browser", async () => {
    await worker.install();

    const response = await worker.respondTo(
      createFileRequest(`${SITE}assets/app.js`, "POST"),
    );

    expect(response).toBeUndefined();
  });

  it("deletes the caches of older versions when it activates", async () => {
    await worker.createCache("tango-version-0");
    await worker.createCache("another-app-cache");
    await worker.install();

    await worker.activate();

    expect(await worker.listCacheNames()).toEqual([
      "another-app-cache",
      CURRENT_CACHE_NAME,
    ]);
  });

  it("takes control of the open page when it activates", async () => {
    await worker.activate();

    expect(worker.claimCount).toBe(1);
  });
});

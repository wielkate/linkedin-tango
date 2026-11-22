import { describe, expect, it } from "vitest";
import {
  createPrecachePaths,
  createServiceWorkerSource,
} from "./service-worker-source";

const TEMPLATE = `
const CACHE_VERSION = "__CACHE_VERSION__";
const PRECACHE_PATHS = JSON.parse("__PRECACHE_PATHS__");
`;

describe("createPrecachePaths", () => {
  it("starts with the page address without a file name", () => {
    expect(createPrecachePaths(["index.html"])[0]).toBe("./");
  });

  it("lists every built file in a stable order", () => {
    expect(
      createPrecachePaths(["index.html", "assets/app.js", "favicon.svg"]),
    ).toEqual(["./", "assets/app.js", "favicon.svg", "index.html"]);
  });

  it("leaves out the service worker itself", () => {
    expect(createPrecachePaths(["index.html", "service-worker.js"])).toEqual([
      "./",
      "index.html",
    ]);
  });
});

describe("createServiceWorkerSource", () => {
  it("writes the cache version into the worker", () => {
    const source = createServiceWorkerSource(TEMPLATE, ["./"], "abc123");

    expect(source).toContain('const CACHE_VERSION = "abc123";');
  });

  it("writes the file list into the worker so it can be read back", () => {
    const source = createServiceWorkerSource(
      TEMPLATE,
      ["./", "assets/app.js"],
      "abc123",
    );

    const precachePaths = new Function(
      `${source}\nreturn PRECACHE_PATHS;`,
    )() as string[];

    expect(precachePaths).toEqual(["./", "assets/app.js"]);
  });

  it("keeps a dollar sign in a file name as it is", () => {
    const source = createServiceWorkerSource(TEMPLATE, ["a$&b.js"], "abc123");

    const precachePaths = new Function(
      `${source}\nreturn PRECACHE_PATHS;`,
    )() as string[];

    expect(precachePaths).toEqual(["a$&b.js"]);
  });

  it("refuses a template without the cache version placeholder", () => {
    const template = 'const PRECACHE_PATHS = JSON.parse("__PRECACHE_PATHS__");';

    expect(() => createServiceWorkerSource(template, [], "abc123")).toThrow(
      "__CACHE_VERSION__",
    );
  });

  it("refuses a template without the file list placeholder", () => {
    const template = 'const CACHE_VERSION = "__CACHE_VERSION__";';

    expect(() => createServiceWorkerSource(template, [], "abc123")).toThrow(
      "__PRECACHE_PATHS__",
    );
  });
});

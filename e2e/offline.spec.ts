import { expect, test, type Page } from "@playwright/test";
import { getCells, openBoard } from "./page";

async function waitUntilServiceWorkerControlsPage(page: Page) {
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect
    .poll(() =>
      page.evaluate(() => navigator.serviceWorker.controller !== null),
    )
    .toBe(true);
}

test("stores the page and its scripts for offline play", async ({ page }) => {
  await openBoard(page);
  await waitUntilServiceWorkerControlsPage(page);

  const storedAddresses = await page.evaluate(async () => {
    const cacheNames = await caches.keys();
    const cache = await caches.open(cacheNames[0]);
    return (await cache.keys()).map((request) => request.url);
  });

  expect(storedAddresses.some((address) => address.endsWith("/"))).toBe(true);
  expect(storedAddresses.some((address) => address.endsWith(".js"))).toBe(true);
  expect(storedAddresses.some((address) => address.endsWith(".css"))).toBe(
    true,
  );
  expect(
    storedAddresses.some((address) => address.endsWith("manifest.webmanifest")),
  ).toBe(true);
});

test("opens the game again without a network", async ({ page, context }) => {
  await openBoard(page);
  await waitUntilServiceWorkerControlsPage(page);

  await context.setOffline(true);
  await page.reload();
  await page.waitForSelector("#board .cell");

  await expect(getCells(page)).toHaveCount(36);
  await expect(page.locator("#title")).toHaveText("Tango #1");
});

test("links a manifest that names the game", async ({ page }) => {
  await openBoard(page);

  const manifest = await page.evaluate(async () => {
    const link = document.querySelector<HTMLLinkElement>(
      'link[rel="manifest"]',
    );
    const response = await fetch(link?.href ?? "");
    return response.json();
  });

  expect(manifest.name).toBe("Cat & Dog Tango");
});

import { expect, test, type Page } from "@playwright/test";
import { openBoard } from "./page";

async function changeTabVisibility(
  page: Page,
  visibility: "hidden" | "visible",
) {
  await page.evaluate((visibilityState) => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => visibilityState,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  }, visibility);
}

test.beforeEach(async ({ page }) => {
  await openBoard(page);
});

test("pauses the game while the tab is hidden and resumes when it is shown", async ({
  page,
}) => {
  await changeTabVisibility(page, "hidden");
  await expect(page.locator("#pause")).toHaveText("▶ Resume");

  await changeTabVisibility(page, "visible");
  await expect(page.locator("#pause")).toHaveText("⏸ Pause");
});

test("keeps a pause the player chose when the tab is shown again", async ({
  page,
}) => {
  await page.locator("#pause").click();

  await changeTabVisibility(page, "hidden");
  await changeTabVisibility(page, "visible");

  await expect(page.locator("#pause")).toHaveText("▶ Resume");
});

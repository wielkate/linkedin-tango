import { expect, test, type Page } from "@playwright/test";
import { openBoard } from "./page";

// A fake clock that is installed but not paused keeps ticking in real time, so a slow machine
// would add seconds to the timer. Pausing it first makes the time move only when the test says so.
async function openBoardWithFrozenClock(page: Page) {
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
  await openBoard(page);
}

test("the timer stands still while paused", async ({ page }) => {
  await openBoardWithFrozenClock(page);
  await page.locator("#pause").click();
  const timeWhenPaused = await page.locator("#timer").textContent();

  await page.clock.runFor(5000);

  await expect(page.locator("#timer")).toHaveText(timeWhenPaused ?? "");
});

test("the timer counts seconds while playing", async ({ page }) => {
  await openBoardWithFrozenClock(page);

  await page.clock.runFor(3000);

  await expect(page.locator("#timer")).toContainText("3 sec");
});

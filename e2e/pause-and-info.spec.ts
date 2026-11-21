import { expect, test } from "@playwright/test";
import { openBoard } from "./page";

test.beforeEach(async ({ page }) => {
  await openBoard(page);
});

test("pause blurs the board and disables the controls", async ({ page }) => {
  await page.locator("#pause").click();

  await expect(page.locator("#board")).toHaveClass(/blurred/);
  await expect(page.locator("#pause")).toHaveText("▶ Resume");
  await expect(page.locator("#hint")).toBeDisabled();
  await expect(page.locator("#solve")).toBeDisabled();
});

test("resume brings the board back", async ({ page }) => {
  await page.locator("#pause").click();

  await page.locator("#pause").click();

  await expect(page.locator("#board")).not.toHaveClass(/blurred/);
  await expect(page.locator("#pause")).toHaveText("⏸ Pause");
  await expect(page.locator("#hint")).toBeEnabled();
});

test("the timer stands still while paused", async ({ page }) => {
  await page.clock.install();
  await page.goto("/#easy/1");
  await page.waitForSelector("#board .cell");
  await page.locator("#pause").click();
  const timeWhenPaused = await page.locator("#timer").textContent();

  await page.clock.runFor(5000);

  await expect(page.locator("#timer")).toHaveText(timeWhenPaused ?? "");
});

test("the timer counts seconds while playing", async ({ page }) => {
  await page.clock.install();
  await page.goto("/#easy/1");
  await page.waitForSelector("#board .cell");

  await page.clock.runFor(3000);

  await expect(page.locator("#timer")).toContainText("3 sec");
});

test("the info dialog opens, pauses the game and closes with Got it", async ({
  page,
}) => {
  await page.locator("#info").click();

  await expect(page.locator("#info-dialog")).toBeVisible();
  await expect(page.locator("#board")).toHaveClass(/blurred/);

  await page.getByRole("button", { name: "Got it" }).click();

  await expect(page.locator("#info-dialog")).toBeHidden();
  await expect(page.locator("#board")).not.toHaveClass(/blurred/);
});

test("closing the info dialog keeps a pause the player chose", async ({
  page,
}) => {
  await page.locator("#pause").click();
  await page.locator("#info").click();

  await page.getByRole("button", { name: "Got it" }).click();

  await expect(page.locator("#pause")).toHaveText("▶ Resume");
  await expect(page.locator("#board")).toHaveClass(/blurred/);
});

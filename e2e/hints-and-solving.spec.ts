import { expect, test } from "@playwright/test";
import { getCells, getFirstFreeCell, openBoard } from "./page";

test.beforeEach(async ({ page }) => {
  await openBoard(page);
});

test("a hint fills one cell, locks it and explains why", async ({ page }) => {
  await page.locator("#hint").click();

  await expect(page.locator("#hint-note")).toBeVisible();
  await expect(page.locator("#hint-note-text")).not.toBeEmpty();
  await expect(getCells(page).locator(":scope.hint-target")).toHaveCount(1);
  await expect(getCells(page).locator(":scope.hint-target")).toHaveClass(
    /locked/,
  );
});

test("hides the hint note after the next click", async ({ page }) => {
  await page.locator("#hint").click();

  await getFirstFreeCell(page).click();

  await expect(page.locator("#hint-note")).toBeHidden();
});

test("marks three identical symbols in a row as an error", async ({ page }) => {
  const freeCells = getCells(page).locator(":scope:not(.locked)");
  await expect(getCells(page).locator(":scope.error")).toHaveCount(0);

  // Fill every free cell with a cat: that always breaks a rule on this board.
  const freeCellCount = await freeCells.count();
  for (let index = 0; index < freeCellCount; index++) {
    await getCells(page).locator(":scope:not(.locked)").nth(index).click();
  }

  await expect(getCells(page).locator(":scope.error").first()).toBeVisible();
});

test("repeated hints solve the board and show the solved message", async ({
  page,
}) => {
  const hintButton = page.locator("#hint");

  while (await hintButton.isEnabled()) {
    await hintButton.click();
  }

  await expect(page.locator("#status")).toContainText("Solved in");
  await expect(page.locator("#next")).toBeVisible();
  await expect(hintButton).toBeDisabled();
  await expect(page.locator("#solve")).toBeDisabled();
});

test("Solve fills the board but calls it cheating", async ({ page }) => {
  await page.locator("#solve").click();

  await expect(page.locator("#status")).toHaveText("Cheating detected 😈");
  await expect(page.locator("#next")).toBeVisible();
  await expect(page.locator("#pause")).toBeDisabled();
});

test("Next starts another board", async ({ page }) => {
  await page.locator("#solve").click();

  await page.locator("#next").click();

  await expect(page.locator("#next")).toBeHidden();
  await expect(page.locator("#status")).toHaveText("");
  await expect(page).toHaveURL(/#easy\/\d+$/);
});

test("reset after solving lets the board be played again", async ({ page }) => {
  await page.locator("#solve").click();

  await page.locator("#reset").click();

  await expect(page.locator("#solve")).toBeEnabled();
  await expect(page.locator("#status")).toHaveText("");
  await expect(page.locator("#next")).toBeHidden();
});

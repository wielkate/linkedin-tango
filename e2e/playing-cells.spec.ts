import { expect, test } from "@playwright/test";
import { getCells, getFirstFreeCell, openBoard } from "./page";

test.beforeEach(async ({ page }) => {
  await openBoard(page);
});

test("cycles a free cell empty, cat, dog, empty", async ({ page }) => {
  const cell = getFirstFreeCell(page);

  await expect(cell).toHaveText("");
  await cell.click();
  await expect(cell).toHaveText("🐱");
  await cell.click();
  await expect(cell).toHaveText("🐶");
  await cell.click();
  await expect(cell).toHaveText("");
});

test("does not change a given cell when it is clicked", async ({ page }) => {
  const givenCell = getCells(page).locator(":scope.locked").first();
  const textBefore = await givenCell.textContent();

  await givenCell.click({ force: true });

  await expect(givenCell).toHaveText(textBefore ?? "");
});

test("keeps undo disabled until a cell is changed", async ({ page }) => {
  await expect(page.locator("#undo")).toBeDisabled();

  await getFirstFreeCell(page).click();

  await expect(page.locator("#undo")).toBeEnabled();
});

test("undoes the last click", async ({ page }) => {
  const cell = getFirstFreeCell(page);
  await cell.click();

  await page.locator("#undo").click();

  await expect(cell).toHaveText("");
  await expect(page.locator("#undo")).toBeDisabled();
});

test("reset empties every free cell and keeps the given cells", async ({
  page,
}) => {
  const givenCellCount = await getCells(page).locator(":scope.locked").count();
  const cell = getFirstFreeCell(page);
  await cell.click();

  await page.locator("#reset").click();

  await expect(cell).toHaveText("");
  await expect(getCells(page).locator(":scope.locked")).toHaveCount(
    givenCellCount,
  );
  await expect(page.locator("#undo")).toBeDisabled();
});

import { expect, test, type Page } from "@playwright/test";
import { getCells, openBoard } from "./page";

// Solve shows the right symbol of every cell, and Reset takes the board back to its start.
async function readSolutionSymbols(page: Page): Promise<string[]> {
  await page.locator("#solve").click();
  const solutionSymbols = await getCells(page).allTextContents();
  await page.locator("#reset").click();
  return solutionSymbols;
}

async function findFreeCellIndexes(page: Page): Promise<number[]> {
  const isLockedByCell = await getCells(page).evaluateAll((cellElements) =>
    cellElements.map((cellElement) => cellElement.classList.contains("locked")),
  );
  return isLockedByCell.flatMap((isLocked, index) => (isLocked ? [] : [index]));
}

// One click gives a cat and two clicks give a dog, so one of the two is the wrong symbol.
async function putWrongSymbolOnCell(
  page: Page,
  cellIndex: number,
  solutionSymbol: string,
) {
  const cell = getCells(page).nth(cellIndex);
  await cell.click();

  if ((await cell.textContent()) === solutionSymbol) {
    await cell.click();
  }
}

// Undo used to put the wrong symbol back into a cell that a hint had corrected and locked.
test("a hint that corrects a clicked cell leaves nothing to undo", async ({
  page,
}) => {
  await openBoard(page);
  const solutionSymbols = await readSolutionSymbols(page);
  let checkedScenarioCount = 0;

  for (const cellIndex of await findFreeCellIndexes(page)) {
    await page.locator("#reset").click();
    await putWrongSymbolOnCell(page, cellIndex, solutionSymbols[cellIndex]);
    await page.locator("#hint").click();

    const hintedCell = getCells(page).nth(cellIndex);
    const isHintOnClickedCell = await hintedCell.evaluate((cellElement) =>
      cellElement.classList.contains("hint-target"),
    );

    if (isHintOnClickedCell) {
      checkedScenarioCount++;
      await expect(hintedCell).toHaveText(solutionSymbols[cellIndex]);
      await expect(hintedCell).toHaveClass(/locked/);
      await expect(page.locator("#undo")).toBeDisabled();
    }
  }

  expect(checkedScenarioCount).toBeGreaterThan(0);
});

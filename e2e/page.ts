import type { Locator, Page } from "@playwright/test";

// A board address always opens the same puzzle, so every test starts from a known board.
export const FIRST_EASY_BOARD = "/#easy/1";

export async function openBoard(page: Page, address = FIRST_EASY_BOARD) {
  await page.goto(address);
  await page.waitForSelector("#board .cell");
}

export function getCells(page: Page): Locator {
  return page.locator("#board .cell");
}

export function getCell(page: Page, row: number, column: number): Locator {
  return getCells(page).nth(row * 6 + column);
}

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

// The first cell the player can change, because the given cells are locked.
export function getFirstFreeCell(page: Page): Locator {
  return getCells(page).locator(":scope:not(.locked)").first();
}

import { expect, test } from "@playwright/test";
import { openBoard } from "./page";

const PAGE_PADDING = 16;
const PHONE_WIDTHS = [320, 360, 390, 430];

for (const phoneWidth of PHONE_WIDTHS) {
  test(`the board fits a ${phoneWidth}px wide screen with equal space on both sides`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: phoneWidth, height: 800 });
    await openBoard(page);

    const board = (await page.locator("#board").boundingBox())!;
    const pageScrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const spaceOnRight = phoneWidth - (board.x + board.width);

    expect(pageScrollWidth).toBe(phoneWidth);
    expect(board.x).toBeGreaterThanOrEqual(PAGE_PADDING - 1);
    expect(spaceOnRight).toBeGreaterThanOrEqual(PAGE_PADDING - 1);
  });
}

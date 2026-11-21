import { expect, test } from "@playwright/test";
import { getCells, openBoard } from "./page";

test("shows a 6 x 6 board with the board number in the title", async ({
  page,
}) => {
  await openBoard(page, "/#medium/1234");

  await expect(getCells(page)).toHaveCount(36);
  await expect(page.locator("#title")).toHaveText("Tango #1 234");
});

test("has the page title and meta description", async ({ page }) => {
  await openBoard(page);

  await expect(page).toHaveTitle("Tango");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /11 222 boards/,
  );
});

test("starts a random board when the address is missing", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("#board .cell");

  await expect(page).toHaveURL(/#easy\/\d+$/);
});

test("ignores an address of a board that does not exist", async ({ page }) => {
  await page.goto("/#easy/99999");
  await page.waitForSelector("#board .cell");

  await expect(page).toHaveURL(/#easy\/(?!99999$)\d+$/);
});

test("opens the board and difficulty written in the address", async ({
  page,
}) => {
  await openBoard(page, "/#hard/42");

  await expect(page.locator("#title")).toHaveText("Tango #42");
  await expect(page.getByRole("button", { name: "Hard" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("follows the address when it changes by hand", async ({ page }) => {
  await openBoard(page, "/#easy/1");

  await page.evaluate(() => {
    window.location.hash = "#medium/7";
  });

  await expect(page.locator("#title")).toHaveText("Tango #7");
  await expect(page.getByRole("button", { name: "Medium" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

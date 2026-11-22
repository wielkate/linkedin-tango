import { expect, test } from "@playwright/test";
import { openBoard } from "./page";

test("the boards menu opens and closes with its button, the backdrop and Escape", async ({
  page,
}) => {
  await openBoard(page);
  const drawer = page.locator("#menu-drawer");

  await page.locator("#menu-button").click();
  await expect(drawer).toHaveClass(/open/);
  await page.locator("#menu-close").click();
  await expect(drawer).not.toHaveClass(/open/);

  await page.locator("#menu-button").click();
  await page.keyboard.press("Escape");
  await expect(drawer).not.toHaveClass(/open/);

  await page.locator("#menu-button").click();
  await page.locator("#menu-backdrop").click({ position: { x: 380, y: 300 } });
  await expect(drawer).not.toHaveClass(/open/);
});

test("the menu counts solved boards", async ({ page }) => {
  await openBoard(page);
  await page.locator("#menu-button").click();

  await expect(page.locator("#menu-content")).toContainText("Easy boards");
  await expect(page.locator("#menu-content")).toContainText("0 of 11 222");
});

test("the menu opens the board whose number is typed", async ({ page }) => {
  await openBoard(page);
  await page.locator("#menu-button").click();

  await page.getByLabel("Board number").fill("77");
  await page.getByLabel("Board number").press("Enter");

  await expect(page).toHaveURL(/#easy\/77$/);
  await expect(page.locator("#title")).toHaveText("Tango #77");
  await expect(page.locator("#menu-drawer")).not.toHaveClass(/open/);
});

test("the menu refuses a board number that does not exist", async ({
  page,
}) => {
  await openBoard(page);
  await page.locator("#menu-button").click();

  await page.getByLabel("Board number").fill("99999");
  await page.getByLabel("Board number").press("Enter");

  await expect(page).toHaveURL(/#easy\/1$/);
});

test("Random in the menu starts another board", async ({ page }) => {
  await openBoard(page);
  await page.locator("#menu-button").click();

  await page.getByRole("button", { name: "🎲 Random" }).click();

  await expect(page).toHaveURL(/#easy\/\d+$/);
  await expect(page.locator("#menu-drawer")).not.toHaveClass(/open/);
});

test("switching difficulty starts a board of that difficulty", async ({
  page,
}) => {
  await openBoard(page);

  await page.getByRole("button", { name: "Hard" }).click();

  await expect(page).toHaveURL(/#hard\/\d+$/);
  await expect(page.getByRole("button", { name: "Hard" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("a solved board is remembered after a reload", async ({ page }) => {
  await openBoard(page);
  const hintButton = page.locator("#hint");
  while (await hintButton.isEnabled()) {
    await hintButton.click();
  }
  await expect(page.locator("#status")).toContainText("Solved in");

  await page.reload();
  await page.waitForSelector("#board .cell");

  await expect(page.locator("#status")).toContainText("Solved in");
  await page.locator("#menu-button").click();
  await expect(page.locator("#menu-content")).toContainText("1 of 11 222");
});

test("a board shown with Solve is not remembered as solved", async ({
  page,
}) => {
  await openBoard(page);
  await page.locator("#solve").click();

  await page.reload();
  await page.waitForSelector("#board .cell");

  await expect(page.locator("#status")).toHaveText("");
  await expect(page.locator("#solve")).toBeEnabled();
});

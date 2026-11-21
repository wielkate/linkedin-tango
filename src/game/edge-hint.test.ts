import { describe, expect, it } from "vitest";
import { Board } from "./board";
import { EdgeHint } from "./edge-hint";
import { CAT, DOG } from "./symbols";

const first = { row: 0, column: 0 };
const second = { row: 0, column: 1 };

function createBoardWith(firstValue: 0 | 1 | null, secondValue: 0 | 1 | null) {
  const board = Board.createEmpty();
  board.setValue(first, firstValue);
  board.setValue(second, secondValue);
  return board;
}

describe("EdgeHint", () => {
  it("rejects cells that are not neighbours", () => {
    expect(() => new EdgeHint(first, { row: 1, column: 1 }, "same")).toThrow(
      /not neighbours/,
    );
  });

  describe("isBrokenOn for a same hint", () => {
    const sameHint = new EdgeHint(first, second, "same");

    it("is not broken by equal symbols", () => {
      expect(sameHint.isBrokenOn(createBoardWith(CAT, CAT))).toBe(false);
    });

    it("is broken by different symbols", () => {
      expect(sameHint.isBrokenOn(createBoardWith(CAT, DOG))).toBe(true);
    });
  });

  describe("isBrokenOn for a different hint", () => {
    const differentHint = new EdgeHint(first, second, "different");

    it("is not broken by different symbols", () => {
      expect(differentHint.isBrokenOn(createBoardWith(DOG, CAT))).toBe(false);
    });

    it("is broken by equal symbols", () => {
      expect(differentHint.isBrokenOn(createBoardWith(DOG, DOG))).toBe(true);
    });
  });

  it("cannot be broken while a cell is empty", () => {
    const sameHint = new EdgeHint(first, second, "same");
    const differentHint = new EdgeHint(first, second, "different");
    const boardWithOneEmptyCell = createBoardWith(CAT, null);

    expect(sameHint.isBrokenOn(boardWithOneEmptyCell)).toBe(false);
    expect(differentHint.isBrokenOn(boardWithOneEmptyCell)).toBe(false);
    expect(sameHint.isBrokenOn(createBoardWith(null, null))).toBe(false);
  });
});

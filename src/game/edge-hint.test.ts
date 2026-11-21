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

describe("EdgeHint edge cases", () => {
  it("accepts vertical neighbours", () => {
    const verticalHint = new EdgeHint(
      { row: 2, column: 3 },
      { row: 3, column: 3 },
      "different",
    );
    const board = Board.createEmpty();
    board.setValue({ row: 2, column: 3 }, CAT);
    board.setValue({ row: 3, column: 3 }, CAT);
    expect(verticalHint.isBrokenOn(board)).toBe(true);
  });

  it("does not care which cell is listed first", () => {
    const board = createBoardWith(CAT, DOG);
    const forwardHint = new EdgeHint(first, second, "same");
    const backwardHint = new EdgeHint(second, first, "same");
    expect(backwardHint.isBrokenOn(board)).toBe(forwardHint.isBrokenOn(board));
  });

  it("rejects the same cell twice and cells two apart", () => {
    expect(() => new EdgeHint(first, first, "same")).toThrow(/not neighbours/);
    expect(() => new EdgeHint(first, { row: 0, column: 2 }, "same")).toThrow(
      /not neighbours/,
    );
  });

  it("names the offending cells in the error", () => {
    expect(
      () => new EdgeHint({ row: 0, column: 0 }, { row: 4, column: 4 }, "same"),
    ).toThrow("0,0 and 4,4");
  });
});

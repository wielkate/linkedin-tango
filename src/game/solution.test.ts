import { describe, expect, it } from "vitest";
import { createBoardFromRows } from "../test-support/create-board";
import { Board } from "./board";
import {
  createBoardOfCorrectCells,
  fillBoardWithSolution,
  findPositionsDifferingFromSolution,
  getSolutionSymbol,
} from "./solution";
import { CAT, DOG } from "./symbols";

const SOLUTION = {
  rowTexts: ["001011", "110100", "010110", "101001", "011001", "100110"],
};

const SOLUTION_AS_LETTERS = [
  "CCDCDD",
  "DDCDCC",
  "CDCDDC",
  "DCDCCD",
  "CDDCCD",
  "DCCDDC",
];

describe("getSolutionSymbol", () => {
  it("reads 0 as a cat and 1 as a dog", () => {
    expect(getSolutionSymbol(SOLUTION, { row: 0, column: 0 })).toBe(CAT);
    expect(getSolutionSymbol(SOLUTION, { row: 0, column: 2 })).toBe(DOG);
    expect(getSolutionSymbol(SOLUTION, { row: 5, column: 5 })).toBe(CAT);
  });
});

describe("fillBoardWithSolution", () => {
  it("writes the solution into every cell, replacing what was there", () => {
    const board = createBoardFromRows(["DDDDDD"]);
    fillBoardWithSolution(board, SOLUTION);
    expect(board).toEqual(createBoardFromRows(SOLUTION_AS_LETTERS));
  });
});

describe("findPositionsDifferingFromSolution", () => {
  it("finds every cell of an empty board", () => {
    expect(
      findPositionsDifferingFromSolution(Board.createEmpty(), SOLUTION),
    ).toHaveLength(36);
  });

  it("finds nothing on a finished board", () => {
    const board = createBoardFromRows(SOLUTION_AS_LETTERS);
    expect(findPositionsDifferingFromSolution(board, SOLUTION)).toEqual([]);
  });

  it("finds both wrong and empty cells", () => {
    const board = createBoardFromRows(SOLUTION_AS_LETTERS);
    board.setValue({ row: 0, column: 0 }, DOG);
    board.setValue({ row: 3, column: 4 }, null);
    expect(findPositionsDifferingFromSolution(board, SOLUTION)).toEqual([
      { row: 0, column: 0 },
      { row: 3, column: 4 },
    ]);
  });
});

describe("createBoardOfCorrectCells", () => {
  it("keeps correct cells and drops wrong and empty ones", () => {
    const board = createBoardFromRows(["CDD..."]);
    const trustedBoard = createBoardOfCorrectCells(board, SOLUTION);

    expect(trustedBoard.getValue({ row: 0, column: 0 })).toBe(CAT);
    expect(trustedBoard.isEmpty({ row: 0, column: 1 })).toBe(true);
    expect(trustedBoard.getValue({ row: 0, column: 2 })).toBe(DOG);
    expect(trustedBoard.isEmpty({ row: 0, column: 3 })).toBe(true);
  });

  it("does not change the board it was made from", () => {
    const board = createBoardFromRows(["DDDDDD"]);
    createBoardOfCorrectCells(board, SOLUTION);
    expect(board.getValue({ row: 0, column: 0 })).toBe(DOG);
  });
});

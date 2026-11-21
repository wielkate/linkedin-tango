import { describe, expect, it } from "vitest";
import {
  createBoardFromRows,
  createBoardWithTopRows,
} from "../test-support/create-board";
import { Board } from "./board";
import { toCellKey, type CellPosition } from "./cell-position";
import { EdgeHint } from "./edge-hint";
import { findCellsBreakingRules, isSolved } from "./rules";

function toKeys(positions: CellPosition[]): string[] {
  return positions.map(toCellKey).sort();
}

function findBrokenKeys(board: Board, edgeHints: EdgeHint[] = []): string[] {
  return [...findCellsBreakingRules(board, edgeHints)].sort();
}

const SOLVED_ROWS = [
  "CCDCDD",
  "DDCDCC",
  "CDCDDC",
  "DCDCCD",
  "CDDCCD",
  "DCCDDC",
];

describe("findCellsBreakingRules", () => {
  it("finds nothing on an empty board", () => {
    expect(findBrokenKeys(Board.createEmpty())).toEqual([]);
  });

  it("finds nothing on a correct unfinished board", () => {
    const board = createBoardWithTopRows(["CD...."]);
    expect(findBrokenKeys(board)).toEqual([]);
  });

  it("marks three identical symbols in a row", () => {
    const board = createBoardWithTopRows(["CCC..."]);
    expect(findBrokenKeys(board)).toEqual(
      toKeys([
        { row: 0, column: 0 },
        { row: 0, column: 1 },
        { row: 0, column: 2 },
      ]),
    );
  });

  it("marks three identical symbols in a column", () => {
    const board = createBoardWithTopRows(["D.....", "D.....", "D....."]);
    expect(findBrokenKeys(board)).toEqual(
      toKeys([
        { row: 0, column: 0 },
        { row: 1, column: 0 },
        { row: 2, column: 0 },
      ]),
    );
  });

  it("allows two identical symbols next to each other", () => {
    const board = createBoardWithTopRows(["CCDD.."]);
    expect(findBrokenKeys(board)).toEqual([]);
  });

  it("does not count a gap between identical symbols as a streak", () => {
    const board = createBoardWithTopRows(["CC.C.."]);
    expect(findBrokenKeys(board)).toEqual([]);
  });

  it("marks every cat in a line that has four cats", () => {
    const board = createBoardWithTopRows(["CDCDCC"]);
    const catPositions = [0, 2, 4, 5].map((column) => ({ row: 0, column }));
    expect(findBrokenKeys(board)).toEqual(toKeys(catPositions));
  });

  it("marks both cells of a broken edge hint", () => {
    const board = createBoardWithTopRows(["CC...."]);
    const differentHint = new EdgeHint(
      { row: 0, column: 0 },
      { row: 0, column: 1 },
      "different",
    );
    expect(findBrokenKeys(board, [differentHint])).toEqual(
      toKeys([
        { row: 0, column: 0 },
        { row: 0, column: 1 },
      ]),
    );
  });

  it("ignores an edge hint that is kept", () => {
    const board = createBoardWithTopRows(["CD...."]);
    const differentHint = new EdgeHint(
      { row: 0, column: 0 },
      { row: 0, column: 1 },
      "different",
    );
    expect(findBrokenKeys(board, [differentHint])).toEqual([]);
  });
});

describe("isSolved", () => {
  it("is true for a full board without rule violations", () => {
    expect(isSolved(createBoardFromRows(SOLVED_ROWS), [])).toBe(true);
  });

  it("is false while a cell is empty", () => {
    const board = createBoardFromRows(SOLVED_ROWS);
    board.setValue({ row: 5, column: 5 }, null);
    expect(isSolved(board, [])).toBe(false);
  });

  it("is false for a full board that breaks a rule", () => {
    const board = createBoardFromRows([
      "CCCDDD",
      "DDDCCC",
      "CCCDDD",
      "DDDCCC",
      "CCCDDD",
      "DDDCCC",
    ]);
    expect(isSolved(board, [])).toBe(false);
  });

  it("is false when an edge hint is broken", () => {
    const sameHint = new EdgeHint(
      { row: 0, column: 1 },
      { row: 0, column: 2 },
      "same",
    );
    expect(isSolved(createBoardFromRows(SOLVED_ROWS), [sameHint])).toBe(false);
  });
});

describe("findCellsBreakingRules edge cases", () => {
  it("marks all four cells of a run of four identical symbols", () => {
    const board = createBoardWithTopRows(["DCCCC."]);
    expect(findBrokenKeys(board)).toEqual(
      toKeys([1, 2, 3, 4].map((column) => ({ row: 0, column }))),
    );
  });

  it("marks a streak at the very end of a line", () => {
    const board = createBoardWithTopRows(["...DDD"]);
    expect(findBrokenKeys(board)).toEqual(
      toKeys([3, 4, 5].map((column) => ({ row: 0, column }))),
    );
  });

  it("does not join a streak across the end of one row and the start of the next", () => {
    const board = createBoardWithTopRows(["....CC", "C....."]);
    expect(findBrokenKeys(board)).toEqual([]);
  });

  it("marks a streak down the last column", () => {
    const board = createBoardFromRows([
      "......",
      "......",
      "......",
      ".....C",
      ".....C",
      ".....C",
    ]);
    expect(findBrokenKeys(board)).toEqual(
      toKeys([3, 4, 5].map((row) => ({ row, column: 5 }))),
    );
  });

  it("marks the symbol with too many cells in each of two lines", () => {
    const board = createBoardWithTopRows(["CCDDCC", "DDCCDD"]);
    expect(findBrokenKeys(board)).toContain("0,0");
    expect(findBrokenKeys(board)).toContain("1,0");
  });

  it("marks too many symbols in a column", () => {
    const board = createBoardFromRows([
      "D.....",
      "C.....",
      "D.....",
      "C.....",
      "D.....",
      "D.....",
    ]);
    const dogRows = [0, 2, 4, 5];
    expect(findBrokenKeys(board)).toEqual(
      expect.arrayContaining(dogRows.map((row) => `${row},0`)),
    );
    expect(findBrokenKeys(board)).not.toContain("1,0");
  });

  it("marks cells that break several rules once", () => {
    const board = createBoardWithTopRows(["CCCC.."]);
    const hint = new EdgeHint(
      { row: 0, column: 0 },
      { row: 0, column: 1 },
      "different",
    );
    const brokenKeys = findBrokenKeys(board, [hint]);
    expect(new Set(brokenKeys).size).toBe(brokenKeys.length);
  });

  it("marks a broken vertical edge hint", () => {
    const board = createBoardFromRows(["D.....", "C....."]);
    const sameHint = new EdgeHint(
      { row: 0, column: 0 },
      { row: 1, column: 0 },
      "same",
    );
    expect(findBrokenKeys(board, [sameHint])).toEqual(["0,0", "1,0"]);
  });

  it("allows exactly three of a symbol in a line", () => {
    const board = createBoardWithTopRows(["CDCDCD"]);
    expect(findBrokenKeys(board)).toEqual([]);
  });
});

describe("isSolved edge cases", () => {
  it("is false for a full board with every cell the same", () => {
    const board = createBoardFromRows(Array<string>(6).fill("CCCCCC"));
    expect(isSolved(board, [])).toBe(false);
  });

  it("is false for an empty board", () => {
    expect(isSolved(Board.createEmpty(), [])).toBe(false);
  });

  it("is true when every edge hint is kept", () => {
    const keptHints = [
      new EdgeHint({ row: 0, column: 0 }, { row: 0, column: 1 }, "same"),
      new EdgeHint({ row: 0, column: 1 }, { row: 0, column: 2 }, "different"),
    ];
    expect(isSolved(createBoardFromRows(SOLVED_ROWS), keptHints)).toBe(true);
  });
});

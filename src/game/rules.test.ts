import { describe, expect, it } from "vitest";
import { Board } from "./board";
import { toCellKey, type CellPosition } from "./cell-position";
import { EdgeHint } from "./edge-hint";
import { findCellsBreakingRules, isSolved } from "./rules";
import {
  createBoardFromRows,
  createBoardWithTopRows,
} from "../test-support/create-board";

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
    const board = createBoardFromRows([
      "CD....",
      "......",
      "......",
      "......",
      "......",
      "......",
    ]);
    expect(findBrokenKeys(board)).toEqual([]);
  });

  it("marks three identical symbols in a row", () => {
    const board = createBoardFromRows([
      "CCC...",
      "......",
      "......",
      "......",
      "......",
      "......",
    ]);
    expect(findBrokenKeys(board)).toEqual(
      toKeys([
        { row: 0, column: 0 },
        { row: 0, column: 1 },
        { row: 0, column: 2 },
      ]),
    );
  });

  it("marks three identical symbols in a column", () => {
    const board = createBoardFromRows([
      "D.....",
      "D.....",
      "D.....",
      "......",
      "......",
      "......",
    ]);
    expect(findBrokenKeys(board)).toEqual(
      toKeys([
        { row: 0, column: 0 },
        { row: 1, column: 0 },
        { row: 2, column: 0 },
      ]),
    );
  });

  it("allows two identical symbols next to each other", () => {
    const board = createBoardFromRows([
      "CCDD..",
      "......",
      "......",
      "......",
      "......",
      "......",
    ]);
    expect(findBrokenKeys(board)).toEqual([]);
  });

  it("does not count a gap between identical symbols as a streak", () => {
    const board = createBoardFromRows([
      "CC.C..",
      "......",
      "......",
      "......",
      "......",
      "......",
    ]);
    expect(findBrokenKeys(board)).toEqual([]);
  });

  it("marks every cat in a line that has four cats", () => {
    const board = createBoardFromRows([
      "CDCDCC",
      "......",
      "......",
      "......",
      "......",
      "......",
    ]);
    const catPositions = [0, 2, 4, 5].map((column) => ({ row: 0, column }));
    expect(findBrokenKeys(board)).toEqual(toKeys(catPositions));
  });

  it("marks both cells of a broken edge hint", () => {
    const board = createBoardFromRows([
      "CC....",
      "......",
      "......",
      "......",
      "......",
      "......",
    ]);
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
    const board = createBoardFromRows([
      "CD....",
      "......",
      "......",
      "......",
      "......",
      "......",
    ]);
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

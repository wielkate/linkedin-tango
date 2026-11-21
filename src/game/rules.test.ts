import { describe, expect, it } from "vitest";
import { Board } from "./board";
import { toCellKey, type CellPosition } from "./cell-position";
import { EdgeHint } from "./edge-hint";
import { findCellsBreakingRules, isSolved } from "./rules";
import { CAT, DOG, type CellValue } from "./symbols";

// Builds a board from six rows of text: "C" is a cat, "D" is a dog, "." is empty.
function createBoard(rows: string[]): Board {
  const board = Board.createEmpty();
  const valuesBySymbol: Record<string, CellValue> = {
    C: CAT,
    D: DOG,
    ".": null,
  };

  rows.forEach((rowText, row) => {
    [...rowText].forEach((symbol, column) => {
      board.setValue({ row, column }, valuesBySymbol[symbol]);
    });
  });

  return board;
}

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
    const board = createBoard([
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
    const board = createBoard([
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
    const board = createBoard([
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
    const board = createBoard([
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
    const board = createBoard([
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
    const board = createBoard([
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
    const board = createBoard([
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
    const board = createBoard([
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
    expect(isSolved(createBoard(SOLVED_ROWS), [])).toBe(true);
  });

  it("is false while a cell is empty", () => {
    const board = createBoard(SOLVED_ROWS);
    board.setValue({ row: 5, column: 5 }, null);
    expect(isSolved(board, [])).toBe(false);
  });

  it("is false for a full board that breaks a rule", () => {
    const board = createBoard([
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
    expect(isSolved(createBoard(SOLVED_ROWS), [sameHint])).toBe(false);
  });
});

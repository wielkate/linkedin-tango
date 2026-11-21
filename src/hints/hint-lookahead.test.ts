import { describe, expect, it } from "vitest";
import { Board } from "../game/board";
import { DOG } from "../game/symbols";
import { createBoardFromRows } from "../test-support/create-board";
import { findSimpleDeductions } from "./hint-deductions";
import { findLookaheadDeductions } from "./hint-lookahead";

// No simple rule applies here, but a cat next to a corner cat would force a broken row.
const CORNER_CATS_ROWS = [
  "......",
  "...C..",
  "......",
  "......",
  "......",
  "C....C",
];

describe("findLookaheadDeductions", () => {
  it("finds nothing on an empty board", () => {
    expect(findLookaheadDeductions(Board.createEmpty(), [])).toEqual([]);
  });

  it("finds cells that no simple rule settles", () => {
    const board = createBoardFromRows(CORNER_CATS_ROWS);
    expect(findSimpleDeductions(board, [])).toEqual([]);

    const deductions = findLookaheadDeductions(board, []);
    const dogPositions = deductions
      .filter(({ symbol }) => symbol === DOG)
      .map(({ position }) => [position.row, position.column]);

    expect(dogPositions).toContainEqual([5, 1]);
    expect(dogPositions).toContainEqual([5, 4]);
  });

  it("names the rejected symbol that led to the contradiction", () => {
    const deductions = findLookaheadDeductions(
      createBoardFromRows(CORNER_CATS_ROWS),
      [],
    );
    const deduction = deductions.find(
      ({ position }) => position.row === 5 && position.column === 1,
    );
    expect(deduction?.kind).toEqual({
      type: "contradiction",
      rejectedSymbol: 0,
    });
  });

  it("never proposes a cell that is already filled", () => {
    const board = createBoardFromRows(CORNER_CATS_ROWS);
    const deductions = findLookaheadDeductions(board, []);
    expect(deductions.every(({ position }) => board.isEmpty(position))).toBe(
      true,
    );
  });

  it("leaves the board it looked at unchanged", () => {
    const board = createBoardFromRows(CORNER_CATS_ROWS);
    const before = board.copy();
    findLookaheadDeductions(board, []);
    expect(board).toEqual(before);
  });
});

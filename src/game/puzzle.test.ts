import { describe, expect, it } from "vitest";
import { toCellKey } from "./cell-position";
import { createLockedCellKeys, createStartBoard, type Puzzle } from "./puzzle";
import { CAT, DOG } from "./symbols";

const puzzle: Puzzle = {
  id: 1,
  solution: {
    rowTexts: ["001011", "110100", "010110", "101001", "011001", "100110"],
  },
  givenCells: [
    { row: 0, column: 0, value: CAT },
    { row: 2, column: 3, value: DOG },
  ],
  edgeHints: [],
};

describe("createStartBoard", () => {
  it("holds only the given cells", () => {
    const board = createStartBoard(puzzle);
    expect(board.getValue({ row: 0, column: 0 })).toBe(CAT);
    expect(board.getValue({ row: 2, column: 3 })).toBe(DOG);
    expect(board.isEmpty({ row: 1, column: 1 })).toBe(true);
  });

  it("gives a new board every time", () => {
    const first = createStartBoard(puzzle);
    first.setValue({ row: 4, column: 4 }, CAT);
    expect(createStartBoard(puzzle).isEmpty({ row: 4, column: 4 })).toBe(true);
  });
});

describe("createLockedCellKeys", () => {
  it("locks exactly the given cells", () => {
    expect(createLockedCellKeys(puzzle)).toEqual(
      new Set([
        toCellKey({ row: 0, column: 0 }),
        toCellKey({ row: 2, column: 3 }),
      ]),
    );
  });
});

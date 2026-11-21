import { describe, expect, it } from "vitest";
import { BOARD_SIZE } from "./board-constants";
import {
  areNeighbouringCells,
  getAllCellPositions,
  toCellKey,
} from "./cell-position";

describe("toCellKey", () => {
  it("joins row and column", () => {
    expect(toCellKey({ row: 2, column: 5 })).toBe("2,5");
  });

  it("gives different keys to a position and its mirror", () => {
    expect(toCellKey({ row: 1, column: 2 })).not.toBe(
      toCellKey({ row: 2, column: 1 }),
    );
  });
});

describe("areNeighbouringCells", () => {
  const centre = { row: 2, column: 2 };

  it("accepts cells next to each other in a row or a column", () => {
    expect(areNeighbouringCells(centre, { row: 2, column: 3 })).toBe(true);
    expect(areNeighbouringCells(centre, { row: 1, column: 2 })).toBe(true);
  });

  it("rejects diagonal cells, distant cells and the same cell", () => {
    expect(areNeighbouringCells(centre, { row: 3, column: 3 })).toBe(false);
    expect(areNeighbouringCells(centre, { row: 2, column: 4 })).toBe(false);
    expect(areNeighbouringCells(centre, centre)).toBe(false);
  });
});

describe("getAllCellPositions", () => {
  it("lists every cell once", () => {
    const keys = getAllCellPositions().map(toCellKey);
    expect(keys).toHaveLength(BOARD_SIZE * BOARD_SIZE);
    expect(new Set(keys).size).toBe(BOARD_SIZE * BOARD_SIZE);
  });

  it("goes row by row from the top-left cell", () => {
    const positions = getAllCellPositions();
    expect(positions[0]).toEqual({ row: 0, column: 0 });
    expect(positions[1]).toEqual({ row: 0, column: 1 });
    expect(positions[BOARD_SIZE]).toEqual({ row: 1, column: 0 });
  });
});

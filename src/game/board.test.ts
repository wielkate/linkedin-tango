import { describe, expect, it } from "vitest";
import { Board } from "./board";
import { BOARD_SIZE } from "./board-constants";
import { getAllCellPositions } from "./cell-position";
import { CAT, DOG } from "./symbols";

describe("Board", () => {
  it("starts empty", () => {
    const board = Board.createEmpty();
    expect(
      getAllCellPositions().every((position) => board.isEmpty(position)),
    ).toBe(true);
    expect(board.isFilled()).toBe(false);
  });

  it("stores and returns a cell value", () => {
    const board = Board.createEmpty();
    board.setValue({ row: 1, column: 4 }, DOG);
    expect(board.getValue({ row: 1, column: 4 })).toBe(DOG);
    expect(board.isEmpty({ row: 1, column: 4 })).toBe(false);
    expect(board.getValue({ row: 4, column: 1 })).toBeNull();
  });

  it("clears a cell when it is set to null", () => {
    const board = Board.createEmpty();
    board.setValue({ row: 0, column: 0 }, CAT);
    board.setValue({ row: 0, column: 0 }, null);
    expect(board.isEmpty({ row: 0, column: 0 })).toBe(true);
  });

  it("starts with the given cells filled in", () => {
    const board = Board.withGivenCells([
      { row: 0, column: 1, value: CAT },
      { row: 5, column: 5, value: DOG },
    ]);
    expect(board.getValue({ row: 0, column: 1 })).toBe(CAT);
    expect(board.getValue({ row: 5, column: 5 })).toBe(DOG);
    expect(board.isEmpty({ row: 0, column: 0 })).toBe(true);
  });

  it("is filled only when every cell has a symbol", () => {
    const board = Board.createEmpty();
    const positions = getAllCellPositions();

    for (const position of positions.slice(0, BOARD_SIZE * BOARD_SIZE - 1)) {
      board.setValue(position, CAT);
    }
    expect(board.isFilled()).toBe(false);

    board.setValue(positions[positions.length - 1], DOG);
    expect(board.isFilled()).toBe(true);
  });

  it("copies without sharing cells with the original", () => {
    const original = Board.createEmpty();
    original.setValue({ row: 2, column: 2 }, CAT);

    const copy = original.copy();
    copy.setValue({ row: 2, column: 2 }, DOG);
    copy.setValue({ row: 3, column: 3 }, CAT);

    expect(original.getValue({ row: 2, column: 2 })).toBe(CAT);
    expect(original.isEmpty({ row: 3, column: 3 })).toBe(true);
  });
});

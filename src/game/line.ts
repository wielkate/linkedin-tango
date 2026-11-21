import { BOARD_SIZE } from "./board-constants";
import type { CellPosition } from "./cell-position";

export type LineDirection = "row" | "column";

// A row or a column of the board: which one it is (counted from 0) and its cell positions in order.
export interface Line {
  direction: LineDirection;
  index: number;
  positions: CellPosition[];
}

function createRow(row: number): Line {
  const positions: CellPosition[] = [];

  for (let column = 0; column < BOARD_SIZE; column++) {
    positions.push({ row, column });
  }

  return { direction: "row", index: row, positions };
}

function createColumn(column: number): Line {
  const positions: CellPosition[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    positions.push({ row, column });
  }

  return { direction: "column", index: column, positions };
}

function createAllLines(): Line[] {
  const lines: Line[] = [];

  for (let index = 0; index < BOARD_SIZE; index++) {
    lines.push(createRow(index));
    lines.push(createColumn(index));
  }

  return lines;
}

// The lines never change, so they are built once.
const ALL_LINES: Line[] = createAllLines();

// Every row and every column.
export function getAllLines(): Line[] {
  return ALL_LINES;
}

// Every run of windowLength neighbouring cells in the line.
export function getLineWindows(
  line: Line,
  windowLength: number,
): CellPosition[][] {
  const windows: CellPosition[][] = [];
  const lastWindowStartIndex = line.positions.length - windowLength;

  for (let startIndex = 0; startIndex <= lastWindowStartIndex; startIndex++) {
    windows.push(line.positions.slice(startIndex, startIndex + windowLength));
  }

  return windows;
}

// "row 3" or "column 1", counted from 1 as the player counts.
export function describeLine(line: Line): string {
  return `${line.direction} ${line.index + 1}`;
}

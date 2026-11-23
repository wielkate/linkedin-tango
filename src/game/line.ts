import { BOARD_SIZE } from "./board-constants";
import type { CellPosition } from "./cell-position";

export type LineDirection = "row" | "column";

// A row or a column of the board: which one it is (counted from 0) and its cell positions in order.
export interface Line {
  direction: LineDirection;
  index: number;
  positions: CellPosition[];
}

function createRowAndColumn(index: number): Line[] {
  const offsets = Array.from({ length: BOARD_SIZE }, (_, offset) => offset);

  return [
    {
      direction: "row",
      index,
      positions: offsets.map((column) => ({ row: index, column })),
    },
    {
      direction: "column",
      index,
      positions: offsets.map((row) => ({ row, column: index })),
    },
  ];
}

const ALL_LINES: Line[] = Array.from({ length: BOARD_SIZE }, (_, index) =>
  createRowAndColumn(index),
).flat();

export function getAllLines(): Line[] {
  return ALL_LINES;
}

export function getLineWindows(
  line: Line,
  windowLength: number,
): CellPosition[][] {
  const windowCount = line.positions.length - windowLength + 1;

  return Array.from({ length: windowCount }, (_, startIndex) =>
    line.positions.slice(startIndex, startIndex + windowLength),
  );
}

// "row 3" or "column 1", counted from 1 as the player counts (non-programmer).
export function describeLine(line: Line): string {
  return `${line.direction} ${line.index + 1}`;
}

// Board model: types, constants and small helpers shared by the rules and the rendering.

export const BOARD_SIZE = 6;
export const SYMBOLS_PER_LINE = BOARD_SIZE / 2;
export const MAX_ADJACENT_IDENTICAL = 2;

export const CAT = 0;
export const DOG = 1;
export const SYMBOL_EMOJIS = ['🐱', '🐶'] as const;

export type PlayerSymbol = typeof CAT | typeof DOG;
export type CellValue = PlayerSymbol | null;
export type Board = CellValue[][];
export type CellKey = string;

export const ALL_SYMBOLS: PlayerSymbol[] = [CAT, DOG];

// Clicking a cell cycles through these values: empty -> cat -> dog -> empty.
const CLICK_CYCLE: CellValue[] = [null, CAT, DOG];

export interface CellPosition {
  row: number;
  column: number;
}

export interface GivenCell extends CellPosition {
  value: PlayerSymbol;
}

export type HintType = 'same' | 'different';

// A hint sits on the shared edge of two neighbouring cells.
export interface EdgeHint {
  first: CellPosition;
  second: CellPosition;
  type: HintType;
}

export function toCellKey(position: CellPosition): CellKey {
  return `${position.row},${position.column}`;
}

export function getCellValue(board: Board, position: CellPosition): CellValue {
  return board[position.row][position.column];
}

export function setCellValue(board: Board, position: CellPosition, value: CellValue): void {
  board[position.row][position.column] = value;
}

export function getNextCellValue(currentValue: CellValue): CellValue {
  const currentIndex = CLICK_CYCLE.indexOf(currentValue);
  const nextIndex = (currentIndex + 1) % CLICK_CYCLE.length;
  return CLICK_CYCLE[nextIndex];
}

export function createBoardWithGivenCells(givenCells: GivenCell[]): Board {
  const board = createEmptyBoard();
  for (const givenCell of givenCells) {
    setCellValue(board, givenCell, givenCell.value);
  }
  return board;
}

function createEmptyBoard(): Board {
  const board: Board = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    board.push(createEmptyRow());
  }
  return board;
}

function createEmptyRow(): CellValue[] {
  return Array<CellValue>(BOARD_SIZE).fill(null);
}

export function areNeighbouringCells(first: CellPosition, second: CellPosition): boolean {
  const rowDistance = Math.abs(first.row - second.row);
  const columnDistance = Math.abs(first.column - second.column);
  return rowDistance + columnDistance === 1;
}

// Every row and every column, each as a list of its cell positions.
export function getAllLinePositions(): CellPosition[][] {
  const lines: CellPosition[][] = [];
  for (let index = 0; index < BOARD_SIZE; index++) {
    lines.push(getRowPositions(index));
    lines.push(getColumnPositions(index));
  }
  return lines;
}

function getRowPositions(row: number): CellPosition[] {
  const positions: CellPosition[] = [];
  for (let column = 0; column < BOARD_SIZE; column++) {
    positions.push({ row, column });
  }
  return positions;
}

function getColumnPositions(column: number): CellPosition[] {
  const positions: CellPosition[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    positions.push({ row, column });
  }
  return positions;
}

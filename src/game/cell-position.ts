import { BOARD_SIZE } from './board-constants';
import type { PlayerSymbol } from './symbols';

export interface CellPosition {
  row: number;
  column: number;
}

export interface GivenCell extends CellPosition {
  value: PlayerSymbol;
}

export type CellKey = string;

export function toCellKey(position: CellPosition): CellKey {
  return `${position.row},${position.column}`;
}

export function areNeighbouringCells(first: CellPosition, second: CellPosition): boolean {
  const rowDistance = Math.abs(first.row - second.row);
  const columnDistance = Math.abs(first.column - second.column);
  return rowDistance + columnDistance === 1;
}

function createAllCellPositions(): CellPosition[] {
  const positions: CellPosition[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let column = 0; column < BOARD_SIZE; column++) {
      positions.push({ row, column });
    }
  }

  return positions;
}

// The positions never change, so they are built once.
const ALL_CELL_POSITIONS: CellPosition[] = createAllCellPositions();

// Every cell position, row by row from the top-left cell.
export function getAllCellPositions(): CellPosition[] {
  return ALL_CELL_POSITIONS;
}

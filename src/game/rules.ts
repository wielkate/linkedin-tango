import type { Board } from './board';
import { FORBIDDEN_STREAK_LENGTH, SYMBOLS_PER_LINE } from './board-constants';
import { toCellKey, type CellKey, type CellPosition } from './cell-position';
import type { EdgeHint } from './edge-hint';
import { getAllLines, getLineWindows, type Line } from './line';
import { ALL_SYMBOLS } from './symbols';

// The rules of a puzzle are the ones every puzzle has plus its own edge hints.
// Only filled cells are checked, so an unfinished board can be valid so far.
export function findCellsBreakingRules(board: Board, edgeHints: EdgeHint[]): Set<CellKey> {
  const cellKeys: CellKey[] = [];

  for (const line of getAllLines()) {
    cellKeys.push(...findCellsWithTooManyOfOneSymbol(board, line));
    cellKeys.push(...findCellsInTooLongStreak(board, line));
  }
  cellKeys.push(...findCellsBreakingEdgeHints(board, edgeHints));

  return new Set(cellKeys);
}

export function isSolved(board: Board, edgeHints: EdgeHint[]): boolean {
  const isEveryCellFilled = board.isFilled();
  const hasNoRuleViolations = findCellsBreakingRules(board, edgeHints).size === 0;
  return isEveryCellFilled && hasNoRuleViolations;
}

function findCellsWithTooManyOfOneSymbol(board: Board, line: Line): CellKey[] {
  const cellKeys: CellKey[] = [];

  for (const symbol of ALL_SYMBOLS) {
    const positionsWithSymbol = line.positions.filter((position) => board.getValue(position) === symbol);
    const hasTooManySymbols = positionsWithSymbol.length > SYMBOLS_PER_LINE;

    if (hasTooManySymbols) {
      cellKeys.push(...positionsWithSymbol.map(toCellKey));
    }
  }

  return cellKeys;
}

function findCellsInTooLongStreak(board: Board, line: Line): CellKey[] {
  const cellKeys: CellKey[] = [];

  for (const windowPositions of getLineWindows(line, FORBIDDEN_STREAK_LENGTH)) {
    if (areFilledAndIdentical(board, windowPositions)) {
      cellKeys.push(...windowPositions.map(toCellKey));
    }
  }

  return cellKeys;
}

function areFilledAndIdentical(board: Board, positions: CellPosition[]): boolean {
  const firstValue = board.getValue(positions[0]);
  const isFirstCellFilled = firstValue !== null;
  const haveSameValue = positions.every((position) => board.getValue(position) === firstValue);
  return isFirstCellFilled && haveSameValue;
}

function findCellsBreakingEdgeHints(board: Board, edgeHints: EdgeHint[]): CellKey[] {
  const cellKeys: CellKey[] = [];

  for (const edgeHint of edgeHints) {
    if (edgeHint.isBrokenOn(board)) {
      cellKeys.push(toCellKey(edgeHint.first), toCellKey(edgeHint.second));
    }
  }

  return cellKeys;
}

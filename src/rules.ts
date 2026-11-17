import {
  ALL_SYMBOLS,
  MAX_ADJACENT_IDENTICAL,
  SYMBOLS_PER_LINE,
  getAllLinePositions,
  getCellValue,
  toCellKey,
  type Board,
  type CellKey,
  type CellPosition,
  type EdgeHint,
  type PlayerSymbol,
} from './board';

const FORBIDDEN_STREAK_LENGTH = MAX_ADJACENT_IDENTICAL + 1;

// Only filled cells are checked, so an unfinished board can be valid so far.
export function findCellsBreakingRules(board: Board, edgeHints: EdgeHint[]): Set<CellKey> {
  const cellKeys: CellKey[] = [];

  for (const linePositions of getAllLinePositions()) {
    cellKeys.push(...findCellsWithTooManyOfOneSymbol(board, linePositions));
    cellKeys.push(...findCellsInTooLongStreak(board, linePositions));
  }
  cellKeys.push(...findCellsBreakingEdgeHints(board, edgeHints));

  return new Set(cellKeys);
}

export function isSolved(board: Board, edgeHints: EdgeHint[]): boolean {
  const isEveryCellFilled = board.every(isRowFilled);
  const hasNoRuleViolations = findCellsBreakingRules(board, edgeHints).size === 0;
  return isEveryCellFilled && hasNoRuleViolations;
}

function isRowFilled(row: Board[number]): boolean {
  return row.every((value) => value !== null);
}

function findCellsWithTooManyOfOneSymbol(board: Board, linePositions: CellPosition[]): CellKey[] {
  const cellKeys: CellKey[] = [];

  for (const symbol of ALL_SYMBOLS) {
    const positionsWithSymbol = linePositions.filter((position) =>
      hasSymbol(board, position, symbol),
    );
    const hasTooManySymbols = positionsWithSymbol.length > SYMBOLS_PER_LINE;

    if (hasTooManySymbols) {
      cellKeys.push(...positionsWithSymbol.map(toCellKey));
    }
  }

  return cellKeys;
}

function hasSymbol(board: Board, position: CellPosition, symbol: PlayerSymbol): boolean {
  return getCellValue(board, position) === symbol;
}

function findCellsInTooLongStreak(board: Board, linePositions: CellPosition[]): CellKey[] {
  const cellKeys: CellKey[] = [];
  const lastWindowStartIndex = linePositions.length - FORBIDDEN_STREAK_LENGTH;

  for (let windowStartIndex = 0; windowStartIndex <= lastWindowStartIndex; windowStartIndex++) {
    const windowEndIndex = windowStartIndex + FORBIDDEN_STREAK_LENGTH;
    const windowPositions = linePositions.slice(windowStartIndex, windowEndIndex);

    if (areFilledAndIdentical(board, windowPositions)) {
      cellKeys.push(...windowPositions.map(toCellKey));
    }
  }

  return cellKeys;
}

function areFilledAndIdentical(board: Board, positions: CellPosition[]): boolean {
  const firstValue = getCellValue(board, positions[0]);
  const isFirstCellFilled = firstValue !== null;
  const haveSameValue = positions.every((position) => getCellValue(board, position) === firstValue);
  return isFirstCellFilled && haveSameValue;
}

function findCellsBreakingEdgeHints(board: Board, edgeHints: EdgeHint[]): CellKey[] {
  const cellKeys: CellKey[] = [];

  for (const edgeHint of edgeHints) {
    if (isEdgeHintBroken(board, edgeHint)) {
      cellKeys.push(toCellKey(edgeHint.first), toCellKey(edgeHint.second));
    }
  }

  return cellKeys;
}

function isEdgeHintBroken(board: Board, edgeHint: EdgeHint): boolean {
  const firstValue = getCellValue(board, edgeHint.first);
  const secondValue = getCellValue(board, edgeHint.second);
  const areBothCellsFilled = firstValue !== null && secondValue !== null;

  if (!areBothCellsFilled) {
    return false;
  }

  const haveSameValue = firstValue === secondValue;
  const shouldHaveSameValue = edgeHint.type === 'same';
  return haveSameValue !== shouldHaveSameValue;
}

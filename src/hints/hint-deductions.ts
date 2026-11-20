import {
  ALL_SYMBOLS,
  BOARD_SIZE,
  MAX_ADJACENT_IDENTICAL,
  SYMBOLS_PER_LINE,
  getAllLines,
  getCellValue,
  getOppositeSymbol,
  type Board,
  type CellPosition,
  type EdgeHint,
  type HintType,
  type Line,
  type PlayerSymbol,
} from '../game/board';

const WINDOW_LENGTH = MAX_ADJACENT_IDENTICAL + 1;

// Why a cell has to hold a certain symbol. Each kind is one rule the player can apply by hand.
export type DeductionReason =
  | { kind: 'edge-hint'; hintType: HintType; partner: CellPosition; partnerSymbol: PlayerSymbol }
  | { kind: 'neighbouring-pair'; line: Line; pair: CellPosition[]; pairSymbol: PlayerSymbol }
  | { kind: 'sandwiched'; line: Line; ends: CellPosition[]; endSymbol: PlayerSymbol }
  | { kind: 'line-complete'; line: Line; completeSymbol: PlayerSymbol; completedPositions: CellPosition[] }
  | { kind: 'contradiction'; rejectedSymbol: PlayerSymbol }
  | { kind: 'solution-only' };

export interface Deduction {
  position: CellPosition;
  symbol: PlayerSymbol;
  reason: DeductionReason;
}

// Every empty cell that one simple rule settles, easiest rules first.
// A cell can appear more than once when several rules agree on it (or, on a broken board, disagree).
export function findSimpleDeductions(board: Board, edgeHints: EdgeHint[]): Deduction[] {
  const lines = getAllLines();

  return [
    ...findEdgeHintDeductions(board, edgeHints),
    ...lines.flatMap((line) => findNeighbouringPairDeductions(board, line)),
    ...lines.flatMap((line) => findSandwichDeductions(board, line)),
    ...lines.flatMap((line) => findCompleteLineDeductions(board, line)),
  ];
}

function isEmpty(board: Board, position: CellPosition): boolean {
  return getCellValue(board, position) === null;
}

function findEdgeHintDeductions(board: Board, edgeHints: EdgeHint[]): Deduction[] {
  const deductions: Deduction[] = [];

  for (const edgeHint of edgeHints) {
    const deduction = deduceFromEdgeHint(board, edgeHint);

    if (deduction !== null) {
      deductions.push(deduction);
    }
  }

  return deductions;
}

function deduceFromEdgeHint(board: Board, edgeHint: EdgeHint): Deduction | null {
  const firstValue = getCellValue(board, edgeHint.first);
  const secondValue = getCellValue(board, edgeHint.second);
  const isOnlyFirstFilled = firstValue !== null && secondValue === null;
  const isOnlySecondFilled = firstValue === null && secondValue !== null;

  if (isOnlyFirstFilled) {
    return createEdgeHintDeduction(edgeHint.type, edgeHint.second, edgeHint.first, firstValue);
  }

  if (isOnlySecondFilled) {
    return createEdgeHintDeduction(edgeHint.type, edgeHint.first, edgeHint.second, secondValue);
  }

  return null;
}

function createEdgeHintDeduction(
  hintType: HintType,
  emptyPosition: CellPosition,
  partner: CellPosition,
  partnerSymbol: PlayerSymbol,
): Deduction {
  const symbol = hintType === 'same' ? partnerSymbol : getOppositeSymbol(partnerSymbol);
  return {
    position: emptyPosition,
    symbol,
    reason: { kind: 'edge-hint', hintType, partner, partnerSymbol },
  };
}

// Every run of three neighbouring cells in a line.
function getWindows(line: Line): CellPosition[][] {
  const windows: CellPosition[][] = [];
  const lastWindowStartIndex = BOARD_SIZE - WINDOW_LENGTH;

  for (let startIndex = 0; startIndex <= lastWindowStartIndex; startIndex++) {
    windows.push(line.positions.slice(startIndex, startIndex + WINDOW_LENGTH));
  }

  return windows;
}

// Two identical symbols side by side: the cell next to the pair has to be the other symbol.
function findNeighbouringPairDeductions(board: Board, line: Line): Deduction[] {
  const deductions: Deduction[] = [];

  for (const [firstPosition, middlePosition, lastPosition] of getWindows(line)) {
    const firstValue = getCellValue(board, firstPosition);
    const middleValue = getCellValue(board, middlePosition);
    const lastValue = getCellValue(board, lastPosition);
    const isPairAtStart = firstValue !== null && firstValue === middleValue && lastValue === null;
    const isPairAtEnd = lastValue !== null && lastValue === middleValue && firstValue === null;

    if (isPairAtStart) {
      deductions.push(createPairDeduction(line, lastPosition, [firstPosition, middlePosition], firstValue));
    }

    if (isPairAtEnd) {
      deductions.push(createPairDeduction(line, firstPosition, [middlePosition, lastPosition], lastValue));
    }
  }

  return deductions;
}

function createPairDeduction(
  line: Line,
  emptyPosition: CellPosition,
  pair: CellPosition[],
  pairSymbol: PlayerSymbol,
): Deduction {
  return {
    position: emptyPosition,
    symbol: getOppositeSymbol(pairSymbol),
    reason: { kind: 'neighbouring-pair', line, pair, pairSymbol },
  };
}

// An empty cell between two identical symbols has to be the other symbol.
function findSandwichDeductions(board: Board, line: Line): Deduction[] {
  const deductions: Deduction[] = [];

  for (const [firstPosition, middlePosition, lastPosition] of getWindows(line)) {
    const firstValue = getCellValue(board, firstPosition);
    const lastValue = getCellValue(board, lastPosition);
    const areEndsIdentical = firstValue !== null && firstValue === lastValue;

    if (areEndsIdentical && isEmpty(board, middlePosition)) {
      deductions.push({
        position: middlePosition,
        symbol: getOppositeSymbol(firstValue),
        reason: { kind: 'sandwiched', line, ends: [firstPosition, lastPosition], endSymbol: firstValue },
      });
    }
  }

  return deductions;
}

// A line that already holds all three of one symbol can only take the other symbol.
function findCompleteLineDeductions(board: Board, line: Line): Deduction[] {
  const deductions: Deduction[] = [];

  for (const completeSymbol of ALL_SYMBOLS) {
    const completedPositions = line.positions.filter(
      (position) => getCellValue(board, position) === completeSymbol,
    );
    const isSymbolComplete = completedPositions.length === SYMBOLS_PER_LINE;

    if (!isSymbolComplete) {
      continue;
    }

    for (const position of line.positions.filter((linePosition) => isEmpty(board, linePosition))) {
      deductions.push({
        position,
        symbol: getOppositeSymbol(completeSymbol),
        reason: { kind: 'line-complete', line, completeSymbol, completedPositions },
      });
    }
  }

  return deductions;
}

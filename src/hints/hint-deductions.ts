import type { Board } from '../game/board';
import { FORBIDDEN_STREAK_LENGTH, SYMBOLS_PER_LINE } from '../game/board-constants';
import type { CellPosition } from '../game/cell-position';
import type { EdgeHint } from '../game/edge-hint';
import { getAllLines, getLineWindows, type Line } from '../game/line';
import { ALL_SYMBOLS, getOppositeSymbol, type PlayerSymbol } from '../game/symbols';
import type { Deduction } from './deduction';

// Every empty cell that one simple rule settles (the rules a player can apply by hand), easiest rules first.
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
  const firstValue = board.getValue(edgeHint.first);
  const secondValue = board.getValue(edgeHint.second);
  const isOnlyFirstFilled = firstValue !== null && secondValue === null;
  const isOnlySecondFilled = firstValue === null && secondValue !== null;

  if (isOnlyFirstFilled) {
    return createEdgeHintDeduction(edgeHint, edgeHint.second, edgeHint.first, firstValue);
  }

  if (isOnlySecondFilled) {
    return createEdgeHintDeduction(edgeHint, edgeHint.first, edgeHint.second, secondValue);
  }

  return null;
}

function createEdgeHintDeduction(
  edgeHint: EdgeHint,
  emptyPosition: CellPosition,
  partner: CellPosition,
  partnerSymbol: PlayerSymbol,
): Deduction {
  const symbol = edgeHint.type === 'same' ? partnerSymbol : getOppositeSymbol(partnerSymbol);
  return { position: emptyPosition, symbol, kind: { type: 'edge-hint', hintType: edgeHint.type, partner } };
}

// Two identical symbols side by side: the cell next to the pair has to be the other symbol.
function findNeighbouringPairDeductions(board: Board, line: Line): Deduction[] {
  const deductions: Deduction[] = [];

  for (const [firstPosition, middlePosition, lastPosition] of getLineWindows(line, FORBIDDEN_STREAK_LENGTH)) {
    const firstValue = board.getValue(firstPosition);
    const middleValue = board.getValue(middlePosition);
    const lastValue = board.getValue(lastPosition);
    const isPairAtStart = firstValue !== null && firstValue === middleValue && lastValue === null;
    const isPairAtEnd = lastValue !== null && lastValue === middleValue && firstValue === null;

    if (isPairAtStart) {
      deductions.push(createPairDeduction(lastPosition, [firstPosition, middlePosition], firstValue));
    }

    if (isPairAtEnd) {
      deductions.push(createPairDeduction(firstPosition, [middlePosition, lastPosition], lastValue));
    }
  }

  return deductions;
}

function createPairDeduction(emptyPosition: CellPosition, pair: CellPosition[], pairSymbol: PlayerSymbol): Deduction {
  return { position: emptyPosition, symbol: getOppositeSymbol(pairSymbol), kind: { type: 'neighbouring-pair', pair } };
}

// An empty cell between two identical symbols has to be the other symbol.
function findSandwichDeductions(board: Board, line: Line): Deduction[] {
  const deductions: Deduction[] = [];

  for (const [firstPosition, middlePosition, lastPosition] of getLineWindows(line, FORBIDDEN_STREAK_LENGTH)) {
    const firstValue = board.getValue(firstPosition);
    const lastValue = board.getValue(lastPosition);
    const areEndsIdentical = firstValue !== null && firstValue === lastValue;

    if (areEndsIdentical && board.isEmpty(middlePosition)) {
      deductions.push({
        position: middlePosition,
        symbol: getOppositeSymbol(firstValue),
        kind: { type: 'sandwiched', line, ends: [firstPosition, lastPosition], endSymbol: firstValue },
      });
    }
  }

  return deductions;
}

// A line that already holds all three of one symbol can only take the other symbol.
function findCompleteLineDeductions(board: Board, line: Line): Deduction[] {
  const deductions: Deduction[] = [];

  for (const completeSymbol of ALL_SYMBOLS) {
    const completedPositions = line.positions.filter((position) => board.getValue(position) === completeSymbol);
    const isSymbolComplete = completedPositions.length === SYMBOLS_PER_LINE;

    if (!isSymbolComplete) {
      continue;
    }

    for (const position of line.positions.filter((linePosition) => board.isEmpty(linePosition))) {
      deductions.push({
        position,
        symbol: getOppositeSymbol(completeSymbol),
        kind: { type: 'line-complete', completedPositions },
      });
    }
  }

  return deductions;
}

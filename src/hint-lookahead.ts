import {
  ALL_SYMBOLS,
  BOARD_SIZE,
  copyBoard,
  getCellValue,
  getOppositeSymbol,
  setCellValue,
  toCellKey,
  type Board,
  type CellKey,
  type CellPosition,
  type EdgeHint,
  type PlayerSymbol,
} from './board';
import { findSimpleDeductions, type Deduction } from './hint-deductions';
import { findCellsBreakingRules } from './rules';

// The step after the simple rules: assume a symbol, follow what the simple rules then force,
// and if that ends in a broken rule, the cell must hold the other symbol.
export function findDeductionsByLookahead(board: Board, edgeHints: EdgeHint[]): Deduction[] {
  const deductions: Deduction[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let column = 0; column < BOARD_SIZE; column++) {
      deductions.push(...deduceFromAssumptions(board, edgeHints, { row, column }));
    }
  }

  return deductions;
}

function deduceFromAssumptions(board: Board, edgeHints: EdgeHint[], position: CellPosition): Deduction[] {
  if (getCellValue(board, position) !== null) {
    return [];
  }

  const rejectedSymbols = ALL_SYMBOLS.filter((symbol) =>
    doesAssumptionLeadToContradiction(board, edgeHints, position, symbol),
  );

  return rejectedSymbols.map((rejectedSymbol) => ({
    position,
    symbol: getOppositeSymbol(rejectedSymbol),
    reason: { kind: 'contradiction', rejectedSymbol },
  }));
}

function doesAssumptionLeadToContradiction(
  board: Board,
  edgeHints: EdgeHint[],
  position: CellPosition,
  assumedSymbol: PlayerSymbol,
): boolean {
  const trialBoard = copyBoard(board);
  setCellValue(trialBoard, position, assumedSymbol);
  return doesPropagationLeadToContradiction(trialBoard, edgeHints);
}

// Fills in whatever the simple rules force, again and again, until nothing more is forced.
function doesPropagationLeadToContradiction(trialBoard: Board, edgeHints: EdgeHint[]): boolean {
  let isStable = false;

  while (!isStable) {
    const isAnyRuleBroken = findCellsBreakingRules(trialBoard, edgeHints).size > 0;

    if (isAnyRuleBroken) {
      return true;
    }

    const deductions = findSimpleDeductions(trialBoard, edgeHints);

    if (areDeductionsConflicting(deductions)) {
      return true;
    }

    applyDeductions(trialBoard, deductions);
    isStable = deductions.length === 0;
  }

  return false;
}

function areDeductionsConflicting(deductions: Deduction[]): boolean {
  const symbolsByCellKey = new Map<CellKey, PlayerSymbol>();

  for (const deduction of deductions) {
    const cellKey = toCellKey(deduction.position);
    const earlierSymbol = symbolsByCellKey.get(cellKey);
    const isContradictingEarlierDeduction = earlierSymbol !== undefined && earlierSymbol !== deduction.symbol;

    if (isContradictingEarlierDeduction) {
      return true;
    }

    symbolsByCellKey.set(cellKey, deduction.symbol);
  }

  return false;
}

function applyDeductions(board: Board, deductions: Deduction[]): void {
  for (const deduction of deductions) {
    setCellValue(board, deduction.position, deduction.symbol);
  }
}

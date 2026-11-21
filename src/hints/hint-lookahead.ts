import { Board } from "../game/board";
import {
  getAllCellPositions,
  toCellKey,
  type CellKey,
  type CellPosition,
} from "../game/cell-position";
import type { EdgeHint } from "../game/edge-hint";
import { findCellsBreakingRules } from "../game/rules";
import {
  ALL_SYMBOLS,
  getOppositeSymbol,
  type PlayerSymbol,
} from "../game/symbols";
import type { Deduction } from "./deduction";
import { findSimpleDeductions } from "./hint-deductions";

// The step after the simple rules: assume a symbol, follow what the simple rules then force,
// and if that ends in a broken rule, the cell must hold the other symbol.
export function findLookaheadDeductions(
  board: Board,
  edgeHints: EdgeHint[],
): Deduction[] {
  return getAllCellPositions().flatMap((position) =>
    deduceFromAssumptions(board, edgeHints, position),
  );
}

function deduceFromAssumptions(
  board: Board,
  edgeHints: EdgeHint[],
  position: CellPosition,
): Deduction[] {
  if (!board.isEmpty(position)) {
    return [];
  }

  const rejectedSymbols = ALL_SYMBOLS.filter((symbol) =>
    doesAssumptionLeadToContradiction(board, edgeHints, position, symbol),
  );

  return rejectedSymbols.map((rejectedSymbol) => ({
    position,
    symbol: getOppositeSymbol(rejectedSymbol),
    kind: { type: "contradiction", rejectedSymbol },
  }));
}

function doesAssumptionLeadToContradiction(
  board: Board,
  edgeHints: EdgeHint[],
  position: CellPosition,
  assumedSymbol: PlayerSymbol,
): boolean {
  const trialBoard = board.copy();
  trialBoard.setValue(position, assumedSymbol);
  return doesPropagationLeadToContradiction(trialBoard, edgeHints);
}

// Fills in whatever the simple rules force, again and again, until nothing more is forced.
function doesPropagationLeadToContradiction(
  trialBoard: Board,
  edgeHints: EdgeHint[],
): boolean {
  let isStable = false;

  while (!isStable) {
    const isAnyRuleBroken =
      findCellsBreakingRules(trialBoard, edgeHints).size > 0;

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
    const isContradictingEarlierDeduction =
      earlierSymbol !== undefined && earlierSymbol !== deduction.symbol;

    if (isContradictingEarlierDeduction) {
      return true;
    }

    symbolsByCellKey.set(cellKey, deduction.symbol);
  }

  return false;
}

function applyDeductions(board: Board, deductions: Deduction[]): void {
  for (const deduction of deductions) {
    board.setValue(deduction.position, deduction.symbol);
  }
}

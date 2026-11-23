import type { Board } from "./board";
import { FORBIDDEN_STREAK_LENGTH, SYMBOLS_PER_LINE } from "./board-constants";
import { toCellKey, type CellKey, type CellPosition } from "./cell-position";
import type { EdgeHint } from "./edge-hint";
import { getAllLines, getLineWindows, type Line } from "./line";
import { ALL_SYMBOLS } from "./symbols";

// Common rules + own hints.
// Only filled cells are checked, so an unfinished board can be valid so far.
export function findCellsBreakingRules(
  board: Board,
  edgeHints: EdgeHint[],
): Set<CellKey> {
  return new Set([
    ...getAllLines().flatMap((line) => [
      ...findCellsWithTooManyOfOneSymbol(board, line),
      ...findCellsInTooLongStreak(board, line),
    ]),
    ...findCellsBreakingEdgeHints(board, edgeHints),
  ]);
}

export function isSolved(board: Board, edgeHints: EdgeHint[]): boolean {
  const isEveryCellFilled = board.isFilled();
  const hasNoRuleViolations =
    findCellsBreakingRules(board, edgeHints).size === 0;
  return isEveryCellFilled && hasNoRuleViolations;
}

function findCellsWithTooManyOfOneSymbol(board: Board, line: Line): CellKey[] {
  return ALL_SYMBOLS.flatMap((symbol) => {
    const positionsWithSymbol = line.positions.filter(
      (position) => board.getValue(position) === symbol,
    );
    const hasTooManySymbols = positionsWithSymbol.length > SYMBOLS_PER_LINE;
    return hasTooManySymbols ? positionsWithSymbol.map(toCellKey) : [];
  });
}

function findCellsInTooLongStreak(board: Board, line: Line): CellKey[] {
  return getLineWindows(line, FORBIDDEN_STREAK_LENGTH)
    .filter((windowPositions) => areFilledAndIdentical(board, windowPositions))
    .flatMap((windowPositions) => windowPositions.map(toCellKey));
}

function areFilledAndIdentical(
  board: Board,
  positions: CellPosition[],
): boolean {
  const firstValue = board.getValue(positions[0]);
  const isFirstCellFilled = firstValue !== null;
  const haveSameValue = positions.every(
    (position) => board.getValue(position) === firstValue,
  );
  return isFirstCellFilled && haveSameValue;
}

function findCellsBreakingEdgeHints(
  board: Board,
  edgeHints: EdgeHint[],
): CellKey[] {
  return edgeHints
    .filter((edgeHint) => edgeHint.isBrokenOn(board))
    .flatMap((edgeHint) => [
      toCellKey(edgeHint.first),
      toCellKey(edgeHint.second),
    ]);
}

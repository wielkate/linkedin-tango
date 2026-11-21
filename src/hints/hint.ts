import type { Board } from "../game/board";
import type { CellPosition } from "../game/cell-position";
import type { Puzzle } from "../game/puzzle";
import {
  createBoardOfCorrectCells,
  findPositionsDifferingFromSolution,
  getSolutionSymbol,
} from "../game/solution";
import { SYMBOL_EMOJIS, type PlayerSymbol } from "../game/symbols";
import type { Deduction } from "./deduction";
import { findSimpleDeductions } from "./hint-deductions";
import { explainDeduction } from "./hint-explanation";
import { findLookaheadDeductions } from "./hint-lookahead";

export interface Hint {
  position: CellPosition;
  correctValue: PlayerSymbol;
  // Why the cell holds this symbol, as a sentence for the player.
  explanation: string;
  // The cells the explanation refers to, so the board can point at them.
  relatedPositions: CellPosition[];
}

// Finds a cell that the rules settle, easiest rule first, and says which rule it is.
// Returns null when every cell already matches the solution.
export function findHint(board: Board, puzzle: Puzzle): Hint | null {
  const cellPositionsToFix = findPositionsDifferingFromSolution(
    board,
    puzzle.solution,
  );

  if (cellPositionsToFix.length === 0) {
    return null;
  }

  const deduction = findBestDeduction(board, puzzle, cellPositionsToFix);
  return createHint(board, deduction);
}

function findBestDeduction(
  board: Board,
  puzzle: Puzzle,
  cellPositionsToFix: CellPosition[],
): Deduction {
  // Only cells that match the solution are trusted, so a wrong move of the player
  // can never lead the hint astray.
  const trustedBoard = createBoardOfCorrectCells(board, puzzle.solution);
  const simpleDeduction = pickDeductionPreferringWrongCells(
    board,
    findSimpleDeductions(trustedBoard, puzzle.edgeHints),
  );

  if (simpleDeduction !== undefined) {
    return simpleDeduction;
  }

  const lookaheadDeduction = pickDeductionPreferringWrongCells(
    board,
    findLookaheadDeductions(trustedBoard, puzzle.edgeHints),
  );

  return (
    lookaheadDeduction ??
    createSolutionOnlyDeduction(board, puzzle, cellPositionsToFix)
  );
}

// A cell the player filled wrongly is fixed before an empty cell is filled in.
function pickDeductionPreferringWrongCells(
  board: Board,
  deductions: Deduction[],
): Deduction | undefined {
  const isCellWrong = (deduction: Deduction): boolean =>
    !board.isEmpty(deduction.position);
  return deductions.find(isCellWrong) ?? deductions[0];
}

function createSolutionOnlyDeduction(
  board: Board,
  puzzle: Puzzle,
  cellPositionsToFix: CellPosition[],
): Deduction {
  const wrongPosition = cellPositionsToFix.find(
    (cellPosition) => !board.isEmpty(cellPosition),
  );
  const position = wrongPosition ?? cellPositionsToFix[0];
  return {
    position,
    symbol: getSolutionSymbol(puzzle.solution, position),
    kind: { type: "solution-only" },
  };
}

function createHint(board: Board, deduction: Deduction): Hint {
  const { explanation, relatedPositions } = explainDeduction(deduction);

  return {
    position: deduction.position,
    correctValue: deduction.symbol,
    explanation: `${describeWrongMove(board, deduction.position)}${explanation}`,
    relatedPositions,
  };
}

// When the player had put the wrong symbol in the cell, the explanation starts by saying so.
function describeWrongMove(board: Board, position: CellPosition): string {
  const currentValue = board.getValue(position);

  if (currentValue === null) {
    return "";
  }

  return `Your ${SYMBOL_EMOJIS[currentValue]} did not belong here. `;
}

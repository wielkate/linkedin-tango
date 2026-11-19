import {
  BOARD_SIZE,
  SYMBOL_EMOJIS,
  createBoardWithGivenCells,
  getCellValue,
  type Board,
  type CellPosition,
  type EdgeHint,
  type PlayerSymbol,
} from './board';
import { findSimpleDeductions, type Deduction } from './hint-deductions';
import { createExplanationMessage, findRelatedPositions } from './hint-explanation';
import { findDeductionsByLookahead } from './hint-lookahead';
import { getSolutionSymbol } from './solution';

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
export function findHint(board: Board, solution: string[], edgeHints: EdgeHint[]): Hint | null {
  const cellPositionsToFix = findCellPositionsDifferingFromSolution(board, solution);

  if (cellPositionsToFix.length === 0) {
    return null;
  }

  const deduction = findBestDeduction(board, solution, edgeHints, cellPositionsToFix);
  return createHint(board, deduction);
}

function findBestDeduction(
  board: Board,
  solution: string[],
  edgeHints: EdgeHint[],
  cellPositionsToFix: CellPosition[],
): Deduction {
  // Only cells that match the solution are trusted, so a wrong move of the player
  // can never lead the hint astray.
  const trustedBoard = createBoardOfCorrectCells(board, solution);
  const deductions = findSimpleDeductions(trustedBoard, edgeHints);
  const deduction = pickDeductionPreferringWrongCells(board, solution, deductions);

  if (deduction !== undefined) {
    return deduction;
  }

  const lookaheadDeduction = pickDeductionPreferringWrongCells(
    board,
    solution,
    findDeductionsByLookahead(trustedBoard, edgeHints),
  );

  return lookaheadDeduction ?? createSolutionOnlyDeduction(board, solution, cellPositionsToFix);
}

function findCellPositionsDifferingFromSolution(board: Board, solution: string[]): CellPosition[] {
  const positions: CellPosition[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let column = 0; column < BOARD_SIZE; column++) {
      const position = { row, column };

      if (getCellValue(board, position) !== getSolutionSymbol(solution, position)) {
        positions.push(position);
      }
    }
  }

  return positions;
}

function createBoardOfCorrectCells(board: Board, solution: string[]): Board {
  const givenCells = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let column = 0; column < BOARD_SIZE; column++) {
      const position = { row, column };
      const solutionSymbol = getSolutionSymbol(solution, position);

      if (getCellValue(board, position) === solutionSymbol) {
        givenCells.push({ ...position, value: solutionSymbol });
      }
    }
  }

  return createBoardWithGivenCells(givenCells);
}

// A cell the player filled wrongly is fixed before an empty cell is filled in.
function pickDeductionPreferringWrongCells(
  board: Board,
  solution: string[],
  deductions: Deduction[],
): Deduction | undefined {
  const isCellWrong = (deduction: Deduction): boolean => getCellValue(board, deduction.position) !== null;
  return deductions.find(isCellWrong) ?? deductions[0];
}

function createSolutionOnlyDeduction(
  board: Board,
  solution: string[],
  cellPositionsToFix: CellPosition[],
): Deduction {
  const position = cellPositionsToFix.find((cellPosition) => getCellValue(board, cellPosition) !== null)
    ?? cellPositionsToFix[0];

  return {
    position,
    symbol: getSolutionSymbol(solution, position),
    reason: { kind: 'solution-only' },
  };
}

function createHint(board: Board, deduction: Deduction): Hint {
  return {
    position: deduction.position,
    correctValue: deduction.symbol,
    explanation: `${describeWrongMove(board, deduction.position)}${createExplanationMessage(deduction)}`,
    relatedPositions: findRelatedPositions(deduction),
  };
}

// When the player had put the wrong symbol in the cell, the explanation starts by saying so.
function describeWrongMove(board: Board, position: CellPosition): string {
  const currentValue = getCellValue(board, position);

  if (currentValue === null) {
    return '';
  }

  return `Your ${SYMBOL_EMOJIS[currentValue]} did not belong here. `;
}

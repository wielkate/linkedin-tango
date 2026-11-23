import { Board } from "./board";
import { getAllCellPositions, type CellPosition } from "./cell-position";
import type { PlayerSymbol } from "./symbols";

export interface Solution {
  readonly rowTexts: string[];
}

export function getSolutionSymbol(
  solution: Solution,
  position: CellPosition,
): PlayerSymbol {
  return Number(
    solution.rowTexts[position.row][position.column],
  ) as PlayerSymbol;
}

export function fillBoardWithSolution(board: Board, solution: Solution): void {
  for (const position of getAllCellPositions()) {
    board.setValue(position, getSolutionSymbol(solution, position));
  }
}

// The cells that are empty or hold the wrong symbol.
export function findPositionsDifferingFromSolution(
  board: Board,
  solution: Solution,
): CellPosition[] {
  return getAllCellPositions().filter(
    (position) =>
      board.getValue(position) !== getSolutionSymbol(solution, position),
  );
}

// A copy of the board that keeps only the cells matching the solution.
export function createBoardOfCorrectCells(
  board: Board,
  solution: Solution,
): Board {
  const boardOfCorrectCells = Board.createEmpty();

  for (const position of getAllCellPositions()) {
    const solutionSymbol = getSolutionSymbol(solution, position);

    if (board.getValue(position) === solutionSymbol) {
      boardOfCorrectCells.setValue(position, solutionSymbol);
    }
  }

  return boardOfCorrectCells;
}

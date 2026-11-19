import { BOARD_SIZE, getCellValue, type Board, type CellPosition, type CellValue } from './board';

export interface Hint {
  position: CellPosition;
  correctValue: CellValue;
}

// Picks a random cell that is empty or wrong and tells what belongs in it.
// Returns null when every cell already matches the solution.
export function findHint(board: Board, solution: string[]): Hint | null {
  const hints: Hint[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let column = 0; column < BOARD_SIZE; column++) {
      const position = { row, column };
      const correctValue = Number(solution[row][column]) as CellValue;

      if (getCellValue(board, position) !== correctValue) {
        hints.push({ position, correctValue });
      }
    }
  }

  if (hints.length === 0) {
    return null;
  }

  return hints[Math.floor(Math.random() * hints.length)];
}

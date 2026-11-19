import { BOARD_SIZE, setCellValue, type Board, type CellValue } from './board';

// Writes the stored solution into every cell of the board.
export function fillBoardWithSolution(board: Board, solution: string[]): void {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let column = 0; column < BOARD_SIZE; column++) {
      setCellValue(board, { row, column }, Number(solution[row][column]) as CellValue);
    }
  }
}

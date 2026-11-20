import { BOARD_SIZE, setCellValue, type Board, type CellPosition, type PlayerSymbol } from './board';

// The symbol that the stored solution has in a cell.
export function getSolutionSymbol(solution: string[], position: CellPosition): PlayerSymbol {
  return Number(solution[position.row][position.column]) as PlayerSymbol;
}

// Writes the stored solution into every cell of the board.
export function fillBoardWithSolution(board: Board, solution: string[]): void {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let column = 0; column < BOARD_SIZE; column++) {
      const position = { row, column };
      setCellValue(board, position, getSolutionSymbol(solution, position));
    }
  }
}

import { BOARD_SIZE } from "./board-constants";
import {
  getAllCellPositions,
  type CellPosition,
  type GivenCell,
} from "./cell-position";
import type { CellValue } from "./symbols";

// The grid of cells the player fills in. A cell is empty (null), a cat or a dog.
export class Board {
  private constructor(private readonly rows: CellValue[][]) {}

  static createEmpty(): Board {
    const rows: CellValue[][] = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
      rows.push(Array<CellValue>(BOARD_SIZE).fill(null));
    }

    return new Board(rows);
  }

  static withGivenCells(givenCells: GivenCell[]): Board {
    const board = Board.createEmpty();

    for (const givenCell of givenCells) {
      board.setValue(givenCell, givenCell.value);
    }

    return board;
  }

  getValue(position: CellPosition): CellValue {
    return this.rows[position.row][position.column];
  }

  setValue(position: CellPosition, value: CellValue): void {
    this.rows[position.row][position.column] = value;
  }

  isEmpty(position: CellPosition): boolean {
    return this.getValue(position) === null;
  }

  isFilled(): boolean {
    return getAllCellPositions().every((position) => !this.isEmpty(position));
  }

  copy(): Board {
    return new Board(this.rows.map((row) => [...row]));
  }
}

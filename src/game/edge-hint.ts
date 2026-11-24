import type { Board } from "./board";
import {
  areNeighbouringCells,
  toCellKey,
  type CellPosition,
} from "./cell-position";

export type HintType = "same" | "different"; // "=", "×"

export class EdgeHint {
  constructor(
    readonly first: CellPosition,
    readonly second: CellPosition,
    readonly type: HintType,
  ) {
    if (!areNeighbouringCells(first, second)) {
      throw new Error(
        `A hint must sit on the edge of two neighbouring cells, but ${toCellKey(first)} and ${toCellKey(second)} are not neighbours.`,
      );
    }
  }

  // Only when both cells are filled can the hint be broken.
  isBrokenOn(board: Board): boolean {
    const firstValue = board.getValue(this.first);
    const secondValue = board.getValue(this.second);
    const areBothCellsFilled = firstValue !== null && secondValue !== null;
    const haveSameValue = firstValue === secondValue;
    const shouldHaveSameValue = this.type === "same";
    return areBothCellsFilled && haveSameValue !== shouldHaveSameValue;
  }
}

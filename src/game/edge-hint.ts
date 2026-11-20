import type { Board } from './board';
import { areNeighbouringCells, toCellKey, type CellPosition } from './cell-position';

export type HintType = 'same' | 'different';

// A hint sits on the shared edge of two neighbouring cells:
// "=" means they hold the same symbol, "×" means they hold different symbols.
export class EdgeHint {
  constructor(
    readonly first: CellPosition,
    readonly second: CellPosition,
    readonly type: HintType,
  ) {
    this.assertCellsAreNeighbours();
  }

  // Only when both cells are filled can the hint be broken.
  isBrokenOn(board: Board): boolean {
    const firstValue = board.getValue(this.first);
    const secondValue = board.getValue(this.second);
    const areBothCellsFilled = firstValue !== null && secondValue !== null;

    if (!areBothCellsFilled) {
      return false;
    }

    const haveSameValue = firstValue === secondValue;
    const shouldHaveSameValue = this.type === 'same';
    return haveSameValue !== shouldHaveSameValue;
  }

  private assertCellsAreNeighbours(): void {
    const areNeighbours = areNeighbouringCells(this.first, this.second);

    if (!areNeighbours) {
      const firstKey = toCellKey(this.first);
      const secondKey = toCellKey(this.second);
      throw new Error(`A hint must sit on the edge of two neighbouring cells, but ${firstKey} and ${secondKey} are not neighbours.`);
    }
  }
}

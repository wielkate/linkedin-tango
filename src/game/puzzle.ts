import { Board } from './board';
import { toCellKey, type CellKey, type GivenCell } from './cell-position';
import type { EdgeHint } from './edge-hint';
import type { Solution } from './solution';

// One board with some cells given and some edge hints, and the solution that is the only one.
export interface Puzzle {
  // Shown to the player as the board number, from 1 to the number of boards.
  readonly id: number;
  readonly solution: Solution;
  readonly givenCells: GivenCell[];
  readonly edgeHints: EdgeHint[];
}

export function createStartBoard(puzzle: Puzzle): Board {
  return Board.withGivenCells(puzzle.givenCells);
}

// The given cells cannot be changed by the player.
export function createLockedCellKeys(puzzle: Puzzle): Set<CellKey> {
  return new Set(puzzle.givenCells.map(toCellKey));
}

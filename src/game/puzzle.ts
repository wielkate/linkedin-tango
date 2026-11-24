import { Board } from "./board";
import { toCellKey, type CellKey, type GivenCell } from "./cell-position";
import type { EdgeHint } from "./edge-hint";
import type { Solution } from "./solution";

// Board with given cells and hints
export interface Puzzle {
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

import type { EdgeHint, GivenCell } from './board';
import puzzlesData from './puzzles.json';

// The puzzles live in puzzles.json: one per difficulty, each with a unique solution
// (generated offline). Rows and columns are counted from 0, starting at the top-left
// cell. Cell values are 0 for 🐱 and 1 for 🐶. Fewer clues make a puzzle harder.

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export const DEFAULT_DIFFICULTY: Difficulty = 'easy';

export interface Puzzle {
  givenCells: GivenCell[];
  edgeHints: EdgeHint[];
}

export const puzzles = puzzlesData as Record<Difficulty, Puzzle>;

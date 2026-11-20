// Fewer clues make a puzzle harder.
export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const DEFAULT_DIFFICULTY: Difficulty = 'easy';

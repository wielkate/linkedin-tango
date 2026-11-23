import type { Difficulty } from "./difficulty";

type SolveSecondsByDifficulty = Record<Difficulty, Record<number, number>>;

const STORAGE_KEY = "tango-solve-seconds";

function readSavedRecords(): Partial<SolveSecondsByDifficulty> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") ?? {};
  } catch {
    // Unreadable saved progress is treated as no progress.
    return {};
  }
}

// The boards the player has solved, per difficulty, with the best time
// localStorage can be unavailable (private window, blocked site data)
export class SolvedBoards {
  private constructor(
    private readonly solveSecondsByDifficulty: SolveSecondsByDifficulty,
  ) {}

  static loadFromStorage(): SolvedBoards {
    const savedRecords = readSavedRecords();

    return new SolvedBoards({
      easy: { ...savedRecords.easy },
      medium: { ...savedRecords.medium },
      hard: { ...savedRecords.hard },
    });
  }

  getBoardIds(difficulty: Difficulty): Set<number> {
    return new Set(
      Object.keys(this.solveSecondsByDifficulty[difficulty]).map(Number),
    );
  }

  // The best time the board was solved in, or null
  getSolveSeconds(difficulty: Difficulty, boardId: number): number | null {
    return this.solveSecondsByDifficulty[difficulty][boardId] ?? null;
  }

  markSolved(
    difficulty: Difficulty,
    boardId: number,
    solveSeconds: number,
  ): void {
    const bestSeconds = this.getSolveSeconds(difficulty, boardId);
    const isNewBestTime = bestSeconds === null || solveSeconds < bestSeconds;

    if (isNewBestTime) {
      this.solveSecondsByDifficulty[difficulty][boardId] = solveSeconds;
      this.saveToStorage();
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(this.solveSecondsByDifficulty),
      );
    } catch {
      // Progress just won't survive a reload.
    }
  }
}

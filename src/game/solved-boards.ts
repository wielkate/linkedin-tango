import { DIFFICULTIES, type Difficulty } from "./difficulty";

const STORAGE_KEY = "tango-solve-seconds";

// The boards the player has solved, per difficulty, with the best time each was solved in,
// kept in localStorage between visits.
// localStorage can be unavailable (private window, blocked site data), so every access is guarded.
export class SolvedBoards {
  private constructor(
    private readonly solveSecondsByDifficulty: Record<
      Difficulty,
      Map<number, number>
    >,
  ) {}

  static loadFromStorage(): SolvedBoards {
    const solveSecondsByDifficulty: Record<Difficulty, Map<number, number>> = {
      easy: new Map(),
      medium: new Map(),
      hard: new Map(),
    };

    try {
      const savedText = localStorage.getItem(STORAGE_KEY);
      const savedRecords: unknown =
        savedText === null ? {} : JSON.parse(savedText);

      for (const difficulty of DIFFICULTIES) {
        const savedRecord =
          (savedRecords as Record<string, unknown>)[difficulty] ?? {};

        for (const [boardIdText, seconds] of Object.entries(savedRecord)) {
          solveSecondsByDifficulty[difficulty].set(
            Number(boardIdText),
            seconds as number,
          );
        }
      }
    } catch {
      // Unreadable saved progress is treated as no progress.
    }

    return new SolvedBoards(solveSecondsByDifficulty);
  }

  getBoardIds(difficulty: Difficulty): Set<number> {
    return new Set(this.solveSecondsByDifficulty[difficulty].keys());
  }

  // The best time the board was solved in, or null when it was never solved.
  getSolveSeconds(difficulty: Difficulty, boardId: number): number | null {
    return this.solveSecondsByDifficulty[difficulty].get(boardId) ?? null;
  }

  markSolved(
    difficulty: Difficulty,
    boardId: number,
    solveSeconds: number,
  ): void {
    const bestSeconds = this.solveSecondsByDifficulty[difficulty].get(boardId);
    const isNewBestTime =
      bestSeconds === undefined || solveSeconds < bestSeconds;

    if (isNewBestTime) {
      this.solveSecondsByDifficulty[difficulty].set(boardId, solveSeconds);
      this.saveToStorage();
    }
  }

  private saveToStorage(): void {
    const savedRecords = Object.fromEntries(
      DIFFICULTIES.map((difficulty) => [
        difficulty,
        Object.fromEntries(this.solveSecondsByDifficulty[difficulty]),
      ]),
    );

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRecords));
    } catch {
      // Progress just won't survive a reload.
    }
  }
}

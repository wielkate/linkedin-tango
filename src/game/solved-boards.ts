import { DIFFICULTIES, type Difficulty } from './difficulty';

const STORAGE_KEY = 'tango-solved-boards';

// The boards the player has solved, per difficulty, kept in localStorage between visits.
// localStorage can be unavailable (private window, blocked site data), so every access is guarded.
export class SolvedBoards {
  private constructor(private readonly boardIdsByDifficulty: Record<Difficulty, Set<number>>) {}

  static loadFromStorage(): SolvedBoards {
    const boardIdsByDifficulty: Record<Difficulty, Set<number>> = {
      easy: new Set(),
      medium: new Set(),
      hard: new Set(),
    };

    try {
      const savedText = localStorage.getItem(STORAGE_KEY);
      const savedLists: unknown = savedText === null ? {} : JSON.parse(savedText);

      for (const difficulty of DIFFICULTIES) {
        const savedList = (savedLists as Record<string, unknown>)[difficulty];

        if (Array.isArray(savedList)) {
          boardIdsByDifficulty[difficulty] = new Set(savedList.filter(Number.isInteger));
        }
      }
    } catch {
      // Unreadable saved progress is treated as no progress.
    }

    return new SolvedBoards(boardIdsByDifficulty);
  }

  getBoardIds(difficulty: Difficulty): Set<number> {
    return this.boardIdsByDifficulty[difficulty];
  }

  markSolved(difficulty: Difficulty, boardId: number): void {
    this.boardIdsByDifficulty[difficulty].add(boardId);
    this.saveToStorage();
  }

  private saveToStorage(): void {
    const savedLists = Object.fromEntries(
      DIFFICULTIES.map((difficulty) => [difficulty, [...this.boardIdsByDifficulty[difficulty]]]),
    );

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedLists));
    } catch {
      // Progress just won't survive a reload.
    }
  }
}

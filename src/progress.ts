import './panel.css';
import { BOARD_COUNT, DIFFICULTIES, type Difficulty } from './puzzle';

const STORAGE_KEY = 'tango-solved-boards';

export type SolvedBoardIds = Record<Difficulty, Set<number>>;

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

// localStorage can be unavailable (private window, blocked site data), so every access is guarded.
export function loadSolvedBoardIds(): SolvedBoardIds {
  const solvedBoardIds = createEmptySolvedBoardIds();

  try {
    const savedText = localStorage.getItem(STORAGE_KEY);
    const savedLists: unknown = savedText === null ? {} : JSON.parse(savedText);

    for (const difficulty of DIFFICULTIES) {
      const savedList = (savedLists as Record<string, unknown>)[difficulty];
      if (Array.isArray(savedList)) {
        solvedBoardIds[difficulty] = new Set(savedList.filter(Number.isInteger));
      }
    }
  } catch {
    // Unreadable saved progress is treated as no progress.
  }

  return solvedBoardIds;
}

function createEmptySolvedBoardIds(): SolvedBoardIds {
  return { easy: new Set(), medium: new Set(), hard: new Set() };
}

export function saveSolvedBoardIds(solvedBoardIds: SolvedBoardIds): void {
  const savedLists = Object.fromEntries(
    DIFFICULTIES.map((difficulty) => [difficulty, [...solvedBoardIds[difficulty]]]),
  );

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedLists));
  } catch {
    // Progress just won't survive a reload.
  }
}

export function renderProgress(
  progressElement: HTMLElement,
  solvedBoardIds: SolvedBoardIds,
  difficulty: Difficulty,
): void {
  const solvedCount = solvedBoardIds[difficulty].size;

  const labelElement = document.createElement('p');
  labelElement.className = 'progress-label';
  labelElement.textContent = `${DIFFICULTY_LABELS[difficulty]}: ${solvedCount.toLocaleString()} of ${BOARD_COUNT.toLocaleString()} solved`;

  const barElement = document.createElement('progress');
  barElement.max = BOARD_COUNT;
  barElement.value = solvedCount;

  progressElement.replaceChildren(labelElement, barElement);
}

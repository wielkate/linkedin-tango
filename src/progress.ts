import './panel.css';
import { DIFFICULTIES, type Difficulty } from './puzzle';

const STORAGE_KEY = 'tango-solved-difficulties';

// localStorage can be unavailable (private window, blocked site data), so every access is guarded.
export function loadSolvedDifficulties(): Set<Difficulty> {
  try {
    const savedText = localStorage.getItem(STORAGE_KEY);
    const savedValues: unknown = savedText === null ? [] : JSON.parse(savedText);
    const savedList = Array.isArray(savedValues) ? savedValues : [];
    return new Set(DIFFICULTIES.filter((difficulty) => savedList.includes(difficulty)));
  } catch {
    return new Set();
  }
}

export function saveSolvedDifficulties(solvedDifficulties: Set<Difficulty>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...solvedDifficulties]));
  } catch {
    // Progress just won't survive a reload.
  }
}

export function renderProgress(
  progressElement: HTMLElement,
  solvedDifficulties: Set<Difficulty>,
  currentBoardId: number,
): void {
  const solvedCount = solvedDifficulties.size;

  const labelElement = document.createElement('p');
  labelElement.className = 'progress-label';
  labelElement.textContent = `Board #${currentBoardId} · ${solvedCount} of ${DIFFICULTIES.length} levels solved`;

  const barElement = document.createElement('progress');
  barElement.max = DIFFICULTIES.length;
  barElement.value = solvedCount;

  progressElement.replaceChildren(labelElement, barElement);
}

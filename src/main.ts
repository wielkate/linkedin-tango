import './style.css';
import {
  createBoardWithGivenCells,
  getCellValue,
  getNextCellValue,
  setCellValue,
  toCellKey,
  type CellPosition,
} from './board';
import { renderDifficultyPicker } from './difficulty';
import { ChangeHistory } from './history';
import { DEFAULT_DIFFICULTY, puzzles, type Difficulty } from './puzzle';
import { renderBoard } from './render';
import { findCellsBreakingRules, isSolved } from './rules';

let selectedDifficulty: Difficulty = DEFAULT_DIFFICULTY;
let { givenCells, edgeHints } = puzzles[selectedDifficulty];
let board = createBoardWithGivenCells(givenCells);
let lockedCellKeys = new Set(givenCells.map(toCellKey));

const changeHistory = new ChangeHistory();

const difficultyElement = getRequiredElement('difficulty');
const undoButton = getRequiredButton('undo');
const resetButton = getRequiredButton('reset');
const boardElement = getRequiredElement('board');
const statusElement = getRequiredElement('status');

function getRequiredElement(elementId: string): HTMLElement {
  const element = document.getElementById(elementId);

  if (element === null) {
    throw new Error(`Missing element with id "${elementId}" in index.html`);
  }

  return element;
}

function getRequiredButton(elementId: string): HTMLButtonElement {
  return getRequiredElement(elementId) as HTMLButtonElement;
}

function startPuzzle(difficulty: Difficulty): void {
  selectedDifficulty = difficulty;
  ({ givenCells, edgeHints } = puzzles[difficulty]);
  resetBoard();
}

function resetBoard(): void {
  changeHistory.clear();
  board = createBoardWithGivenCells(givenCells);
  lockedCellKeys = new Set(givenCells.map(toCellKey));
  render();
}

function undoLastChange(): void {
  const lastChange = changeHistory.takeLast();

  if (lastChange === undefined) {
    return;
  }

  setCellValue(board, lastChange.position, lastChange.previousValue);
  render();
}

function handleCellClick(position: CellPosition): void {
  const isLocked = lockedCellKeys.has(toCellKey(position));

  if (isLocked) {
    return;
  }

  const previousValue = getCellValue(board, position);
  changeHistory.record({ position, previousValue });
  setCellValue(board, position, getNextCellValue(previousValue));
  render();
}

function render(): void {
  renderDifficultyPicker(difficultyElement, selectedDifficulty, startPuzzle);
  const cellKeysBreakingRules = findCellsBreakingRules(board, edgeHints);
  renderBoard(
    boardElement,
    { board, lockedCellKeys, cellKeysBreakingRules, edgeHints },
    handleCellClick,
  );
  undoButton.disabled = changeHistory.isEmpty();
  statusElement.textContent = createStatusMessage();
}

function createStatusMessage(): string {
  if (isSolved(board, edgeHints)) {
    return '🎉 Solved!';
  }
  return '';
}

undoButton.addEventListener('click', undoLastChange);
resetButton.addEventListener('click', resetBoard);
render();

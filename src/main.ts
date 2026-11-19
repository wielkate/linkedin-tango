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
import { findHint } from './hint';
import { loadSolvedBoardIds, renderProgress, saveSolvedBoardIds } from './progress';
import { DEFAULT_DIFFICULTY, getPuzzle, pickBoardId, type Difficulty } from './puzzle';
import { renderBoard } from './render';
import { findCellsBreakingRules, isSolved } from './rules';
import { Stopwatch, formatDuration } from './stopwatch';

const TIMER_REFRESH_MILLISECONDS = 1000;

let selectedDifficulty: Difficulty = DEFAULT_DIFFICULTY;
const solvedBoardIds = loadSolvedBoardIds();
let currentPuzzle = getPuzzle(selectedDifficulty, pickBoardId(solvedBoardIds[selectedDifficulty]));
let { givenCells, edgeHints } = currentPuzzle;
let board = createBoardWithGivenCells(givenCells);
let lockedCellKeys = new Set(givenCells.map(toCellKey));

const changeHistory = new ChangeHistory();
const stopwatch = new Stopwatch();
let wasStopwatchPausedBeforeInfo = false;

const difficultyElement = getRequiredElement('difficulty');
const undoButton = getRequiredButton('undo');
const resetButton = getRequiredButton('reset');
const hintButton = getRequiredButton('hint');
const pauseButton = getRequiredButton('pause');
const nextButton = getRequiredButton('next');
const infoButton = getRequiredButton('info');
const infoDialog = getRequiredElement('info-dialog') as HTMLDialogElement;
const timerElement = getRequiredElement('timer');
const progressElement = getRequiredElement('progress');
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
  startNextPuzzle();
}

function startNextPuzzle(): void {
  currentPuzzle = getPuzzle(selectedDifficulty, pickBoardId(solvedBoardIds[selectedDifficulty]));
  ({ givenCells, edgeHints } = currentPuzzle);
  resetBoard();
}

function resetBoard(): void {
  changeHistory.clear();
  stopwatch.restart();
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
  finishPuzzleIfSolved();
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
  finishPuzzleIfSolved();
  render();
}

function revealHint(): void {
  const hint = findHint(board, currentPuzzle.solution);

  if (hint === null) {
    return;
  }

  setCellValue(board, hint.position, hint.correctValue);
  lockedCellKeys.add(toCellKey(hint.position));
  finishPuzzleIfSolved();
  render();
}

function finishPuzzleIfSolved(): void {
  const isRunningAndSolved = !stopwatch.isStopped() && isSolved(board, edgeHints);

  if (!isRunningAndSolved) {
    return;
  }

  stopwatch.stop();
  solvedBoardIds[selectedDifficulty].add(currentPuzzle.id);
  saveSolvedBoardIds(solvedBoardIds);
}

function togglePause(): void {
  if (stopwatch.isPaused()) {
    stopwatch.resume();
  } else {
    stopwatch.pause();
  }
  render();
}

function openInfo(): void {
  wasStopwatchPausedBeforeInfo = stopwatch.isPaused();
  stopwatch.pause();
  infoDialog.showModal();
  render();
}

function handleInfoClosed(): void {
  if (!wasStopwatchPausedBeforeInfo) {
    stopwatch.resume();
  }
  render();
}

function renderTimer(): void {
  timerElement.textContent = formatDuration(stopwatch.getElapsedSeconds());
}

function render(): void {
  renderDifficultyPicker(difficultyElement, selectedDifficulty, startPuzzle);
  const cellKeysBreakingRules = findCellsBreakingRules(board, edgeHints);
  renderBoard(
    boardElement,
    { board, lockedCellKeys, cellKeysBreakingRules, edgeHints },
    handleCellClick,
  );
  const isPaused = stopwatch.isPaused();
  boardElement.classList.toggle('paused', isPaused);
  pauseButton.textContent = isPaused ? '▶ Resume' : '⏸ Pause';
  pauseButton.disabled = stopwatch.isStopped();
  undoButton.disabled = changeHistory.isEmpty() || isPaused;
  nextButton.hidden = !isSolved(board, edgeHints);
  hintButton.disabled = isSolved(board, edgeHints) || isPaused;
  renderTimer();
  renderProgress(progressElement, solvedBoardIds, selectedDifficulty, currentPuzzle.id);
  statusElement.textContent = createStatusMessage();
}

function createStatusMessage(): string {
  if (isSolved(board, edgeHints)) {
    return `🎉 Solved in ${formatDuration(stopwatch.getElapsedSeconds())}!`;
  }
  return '';
}

undoButton.addEventListener('click', undoLastChange);
resetButton.addEventListener('click', resetBoard);
hintButton.addEventListener('click', revealHint);
nextButton.addEventListener('click', startNextPuzzle);
pauseButton.addEventListener('click', togglePause);
infoButton.addEventListener('click', openInfo);
infoDialog.addEventListener('close', handleInfoClosed);
window.setInterval(renderTimer, TIMER_REFRESH_MILLISECONDS);
render();

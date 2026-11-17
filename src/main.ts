import './style.css';
import {
  createBoardWithGivenCells,
  getCellValue,
  getNextCellValue,
  setCellValue,
  toCellKey,
  type CellPosition,
} from './board';
import { edgeHints, givenCells } from './puzzle';
import { renderBoard } from './render';
import { findCellsBreakingRules, isSolved } from './rules';

const board = createBoardWithGivenCells(givenCells);
const lockedCellKeys = new Set(givenCells.map(toCellKey));

const boardElement = getRequiredElement('board');
const statusElement = getRequiredElement('status');

function getRequiredElement(elementId: string): HTMLElement {
  const element = document.getElementById(elementId);

  if (element === null) {
    throw new Error(`Missing element with id "${elementId}" in index.html`);
  }

  return element;
}

function handleCellClick(position: CellPosition): void {
  const isLocked = lockedCellKeys.has(toCellKey(position));

  if (isLocked) {
    return;
  }

  const nextValue = getNextCellValue(getCellValue(board, position));
  setCellValue(board, position, nextValue);
  render();
}

function render(): void {
  const cellKeysBreakingRules = findCellsBreakingRules(board, edgeHints);
  renderBoard(
    boardElement,
    { board, lockedCellKeys, cellKeysBreakingRules, edgeHints },
    handleCellClick,
  );
  statusElement.textContent = createStatusMessage();
}

function createStatusMessage(): string {
  if (isSolved(board, edgeHints)) {
    return '🎉 Solved!';
  }
  return '';
}

render();

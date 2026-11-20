import type { EdgeHint, GivenCell, HintType } from './board';
import { BOARD_SIZE } from './board';
import boardsData from '../data/boards.json';
import easyPuzzlesData from '../data/easy.json';
import hardPuzzlesData from '../data/hard.json';
import mediumPuzzlesData from '../data/medium.json';

// src/data holds every valid board (boards.json) and one puzzle per board and difficulty
// (easy.json, medium.json, hard.json), all made by scripts/generate-puzzles.mjs.
// A puzzle is stored as "cells|edges"; the script's header explains the numbering.
// Rows and columns are counted from 0, starting at the top-left cell.
// Cell values are 0 for 🐱 and 1 for 🐶. Fewer clues make a puzzle harder.

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const DEFAULT_DIFFICULTY: Difficulty = 'easy';

export const BOARD_COUNT = boardsData.length;

export interface Puzzle {
  // Shown to the player as the board number, from 1 to BOARD_COUNT.
  id: number;
  // One string per row; '0' is 🐱 and '1' is 🐶. Used by the hint button.
  solution: string[];
  givenCells: GivenCell[];
  edgeHints: EdgeHint[];
}

const PUZZLES_DATA: Record<Difficulty, string[]> = {
  easy: easyPuzzlesData,
  medium: mediumPuzzlesData,
  hard: hardPuzzlesData,
};

const HORIZONTAL_EDGE_COUNT = BOARD_SIZE * (BOARD_SIZE - 1);

export function getPuzzle(difficulty: Difficulty, boardId: number): Puzzle {
  const boardText = boardsData[boardId - 1];
  const [cellsText, edgesText] = PUZZLES_DATA[difficulty][boardId - 1].split('|');

  return {
    id: boardId,
    solution: splitIntoRows(boardText),
    givenCells: parseNumbers(cellsText).map((cellIndex) => decodeGivenCell(boardText, cellIndex)),
    edgeHints: parseNumbers(edgesText).map((edgeIndex) => decodeEdgeHint(boardText, edgeIndex)),
  };
}

function parseNumbers(text: string): number[] {
  if (text === '') {
    return [];
  }

  return text.split(',').map(Number);
}

function splitIntoRows(boardText: string): string[] {
  const rows: string[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    rows.push(boardText.slice(row * BOARD_SIZE, (row + 1) * BOARD_SIZE));
  }

  return rows;
}

function decodeGivenCell(boardText: string, cellIndex: number): GivenCell {
  return {
    ...toPosition(cellIndex),
    value: Number(boardText[cellIndex]) as GivenCell['value'],
  };
}

function decodeEdgeHint(boardText: string, edgeIndex: number): EdgeHint {
  const [firstCellIndex, secondCellIndex] = getEdgeCellIndexes(edgeIndex);
  const hasSameSymbols = boardText[firstCellIndex] === boardText[secondCellIndex];
  const type: HintType = hasSameSymbols ? 'same' : 'different';

  return {
    first: toPosition(firstCellIndex),
    second: toPosition(secondCellIndex),
    type,
  };
}

function getEdgeCellIndexes(edgeIndex: number): [number, number] {
  const isHorizontalEdge = edgeIndex < HORIZONTAL_EDGE_COUNT;

  if (isHorizontalEdge) {
    const row = Math.floor(edgeIndex / (BOARD_SIZE - 1));
    const column = edgeIndex % (BOARD_SIZE - 1);
    const firstCellIndex = row * BOARD_SIZE + column;
    return [firstCellIndex, firstCellIndex + 1];
  }

  const firstCellIndex = edgeIndex - HORIZONTAL_EDGE_COUNT;
  return [firstCellIndex, firstCellIndex + BOARD_SIZE];
}

function toPosition(cellIndex: number): { row: number; column: number } {
  return {
    row: Math.floor(cellIndex / BOARD_SIZE),
    column: cellIndex % BOARD_SIZE,
  };
}

// A random board the player has not solved on this difficulty yet,
// or any random board once every one of them is solved.
export function pickBoardId(solvedBoardIds: Set<number>): number {
  const unsolvedBoardIds: number[] = [];

  for (let boardId = 1; boardId <= BOARD_COUNT; boardId++) {
    if (!solvedBoardIds.has(boardId)) {
      unsolvedBoardIds.push(boardId);
    }
  }

  const candidateBoardIds = unsolvedBoardIds.length > 0 ? unsolvedBoardIds : [...Array(BOARD_COUNT).keys()].map((index) => index + 1);
  return candidateBoardIds[Math.floor(Math.random() * candidateBoardIds.length)];
}

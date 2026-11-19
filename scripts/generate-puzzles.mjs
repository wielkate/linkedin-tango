// Generates every valid board and, for each board, one puzzle per difficulty.
// Run with: node scripts/generate-puzzles.mjs
// Output (src/data/): boards.json plus easy.json, medium.json and hard.json.
//
// Board: 6x6 cells, 0 = cat, 1 = dog, stored as a 36-character string, row by row.
// Valid board: every row and column has three cats and three dogs, and no three identical
// symbols are next to each other in a row or a column.
//
// Puzzle: a list of given cells and edge hints that leave exactly one valid board.
// The puzzle of board N sits at index N - 1 of each difficulty file, as "cells|edges".
// A cell is its index (row * 6 + column). An edge hint is the index of the edge between two
// neighbouring cells; its type (same or different) is read from the board itself:
//   0..29   horizontal edge between (row, column) and (row, column + 1): row * 5 + column
//   30..59  vertical edge between (row, column) and (row + 1, column): 30 + row * 6 + column

import { mkdirSync, writeFileSync } from 'node:fs';

const BOARD_SIZE = 6;
const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;
const SYMBOLS_PER_LINE = BOARD_SIZE / 2;
const MAX_ADJACENT_IDENTICAL = 2;
const OUTPUT_DIRECTORY = new URL('../src/data/', import.meta.url);

// Easy keeps the most clues, hard removes clues until none can go.
// A target of 0 means "remove as many clues as possible".
const TARGET_CLUE_COUNT_PER_DIFFICULTY = { easy: 18, medium: 13, hard: 0 };

function createValidRows() {
  const validRows = [];

  for (let rowBits = 0; rowBits < 2 ** BOARD_SIZE; rowBits++) {
    const row = [];
    for (let column = 0; column < BOARD_SIZE; column++) {
      row.push((rowBits >> column) & 1);
    }

    const dogCount = row.reduce((total, value) => total + value, 0);
    if (dogCount === SYMBOLS_PER_LINE && !hasTooLongStreak(row)) {
      validRows.push(row);
    }
  }

  return validRows;
}

function hasTooLongStreak(line) {
  const streakLength = MAX_ADJACENT_IDENTICAL + 1;

  for (let start = 0; start + streakLength <= line.length; start++) {
    const streak = line.slice(start, start + streakLength);
    if (streak.every((value) => value === streak[0])) {
      return true;
    }
  }

  return false;
}

function createAllBoards(validRows) {
  const boards = [];
  collectBoards(validRows, [], boards);
  return boards;
}

function collectBoards(validRows, rowsSoFar, boards) {
  if (rowsSoFar.length === BOARD_SIZE) {
    boards.push(rowsSoFar.flat());
    return;
  }

  for (const row of validRows) {
    const candidateRows = [...rowsSoFar, row];
    if (areColumnsStillValid(candidateRows)) {
      collectBoards(validRows, candidateRows, boards);
    }
  }
}

function areColumnsStillValid(rows) {
  for (let column = 0; column < BOARD_SIZE; column++) {
    const columnValues = rows.map((row) => row[column]);
    const dogCount = columnValues.reduce((total, value) => total + value, 0);
    const catCount = columnValues.length - dogCount;
    const hasTooManyOfOneSymbol = dogCount > SYMBOLS_PER_LINE || catCount > SYMBOLS_PER_LINE;

    if (hasTooManyOfOneSymbol || hasTooLongStreak(columnValues)) {
      return false;
    }
  }

  return true;
}

function listEdges() {
  const edges = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let column = 0; column < BOARD_SIZE - 1; column++) {
      const firstCell = row * BOARD_SIZE + column;
      edges.push([firstCell, firstCell + 1]);
    }
  }

  for (let row = 0; row < BOARD_SIZE - 1; row++) {
    for (let column = 0; column < BOARD_SIZE; column++) {
      const firstCell = row * BOARD_SIZE + column;
      edges.push([firstCell, firstCell + BOARD_SIZE]);
    }
  }

  return edges;
}

// A bitset says which boards satisfy one clue, so "how many boards fit these clues"
// is an AND of a few bitsets and a bit count.
class ClueIndex {
  constructor(boards, edges) {
    this.wordCount = Math.ceil(boards.length / 32);
    this.cellBitsets = this.createBitsets(CELL_COUNT * 2);
    this.edgeBitsets = this.createBitsets(edges.length * 2);

    boards.forEach((board, boardIndex) => {
      for (let cell = 0; cell < CELL_COUNT; cell++) {
        this.setBit(this.cellBitsets[cell * 2 + board[cell]], boardIndex);
      }
      edges.forEach(([firstCell, secondCell], edgeIndex) => {
        const isSame = board[firstCell] === board[secondCell] ? 1 : 0;
        this.setBit(this.edgeBitsets[edgeIndex * 2 + isSame], boardIndex);
      });
    });
  }

  createBitsets(count) {
    return Array.from({ length: count }, () => new Uint32Array(this.wordCount));
  }

  setBit(bitset, boardIndex) {
    bitset[boardIndex >> 5] |= 1 << (boardIndex & 31);
  }

  // Number of boards that satisfy every clue, counting stops at the limit.
  countMatchingBoards(clueBitsets, limit) {
    let count = 0;

    for (let word = 0; word < this.wordCount; word++) {
      let combined = 0xffffffff;
      for (const clueBitset of clueBitsets) {
        combined &= clueBitset[word];
      }
      count += countSetBits(combined >>> 0);

      if (count >= limit) {
        return count;
      }
    }

    return count;
  }
}

function countSetBits(value) {
  let remaining = value;
  let count = 0;

  while (remaining !== 0) {
    remaining &= remaining - 1;
    count++;
  }

  return count;
}

// Small deterministic random generator, so the output is the same on every run.
function createRandomGenerator(seed) {
  let state = seed >>> 0;

  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

function shuffle(items, nextRandom) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(nextRandom() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function createPuzzle(board, boardIndex, difficultySeed, targetClueCount, clueIndex, edges) {
  const nextRandom = createRandomGenerator(boardIndex * 7919 + difficultySeed);
  const givenCells = new Set(Array.from({ length: CELL_COUNT }, (_, cell) => cell));
  const hintEdges = new Set(edges.keys());

  const clueBitsetsOf = () => [
    ...[...givenCells].map((cell) => clueIndex.cellBitsets[cell * 2 + board[cell]]),
    ...[...hintEdges].map((edge) => {
      const [firstCell, secondCell] = edges[edge];
      const isSame = board[firstCell] === board[secondCell] ? 1 : 0;
      return clueIndex.edgeBitsets[edge * 2 + isSame];
    }),
  ];

  const removableClues = shuffle(
    [
      ...[...givenCells].map((cell) => ({ kind: 'cell', id: cell })),
      ...[...hintEdges].map((edge) => ({ kind: 'edge', id: edge })),
    ],
    nextRandom,
  );

  for (const clue of removableClues) {
    const clueSet = clue.kind === 'cell' ? givenCells : hintEdges;
    const hasReachedTarget = countUsefulClues(givenCells, hintEdges, edges) <= targetClueCount;

    if (hasReachedTarget) {
      break;
    }

    clueSet.delete(clue.id);
    const isStillUnique = clueIndex.countMatchingBoards(clueBitsetsOf(), 2) === 1;

    if (!isStillUnique) {
      clueSet.add(clue.id);
    }
  }

  return encodePuzzle(givenCells, removeHintsBetweenGivenCells(givenCells, hintEdges, edges));
}

function isHintBetweenGivenCells(givenCells, edge, edges) {
  const [firstCell, secondCell] = edges[edge];
  return givenCells.has(firstCell) && givenCells.has(secondCell);
}

function removeHintsBetweenGivenCells(givenCells, hintEdges, edges) {
  return [...hintEdges].filter((edge) => !isHintBetweenGivenCells(givenCells, edge, edges));
}

function countUsefulClues(givenCells, hintEdges, edges) {
  return givenCells.size + removeHintsBetweenGivenCells(givenCells, hintEdges, edges).length;
}

function encodePuzzle(givenCells, hintEdges) {
  const sortedCells = [...givenCells].sort((first, second) => first - second);
  const sortedEdges = [...hintEdges].sort((first, second) => first - second);
  return `${sortedCells.join(',')}|${sortedEdges.join(',')}`;
}

function main() {
  const boards = createAllBoards(createValidRows());
  console.log(`Valid boards: ${boards.length}`);

  const edges = listEdges();
  const clueIndex = new ClueIndex(boards, edges);
  mkdirSync(OUTPUT_DIRECTORY, { recursive: true });

  writeFileSync(new URL('boards.json', OUTPUT_DIRECTORY), JSON.stringify(boards.map((board) => board.join(''))));

  let difficultySeed = 1;
  for (const [difficulty, targetClueCount] of Object.entries(TARGET_CLUE_COUNT_PER_DIFFICULTY)) {
    const puzzles = boards.map((board, boardIndex) =>
      createPuzzle(board, boardIndex, difficultySeed, targetClueCount, clueIndex, edges),
    );
    writeFileSync(new URL(`${difficulty}.json`, OUTPUT_DIRECTORY), JSON.stringify(puzzles));
    console.log(`${difficulty}: ${puzzles.length} puzzles`);
    difficultySeed++;
  }
}

main();

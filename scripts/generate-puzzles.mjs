// Generates every valid board and, for each board, one puzzle per difficulty.
// Run with: node scripts/generate-puzzles.mjs
// Output (src/data/): boards.json plus easy.json, medium.json and hard.json.
//
// Board: 6x6 cells, 0 = cat, 1 = dog, stored as a 36-character string, row by row.
// Valid board: every row and column has three cats and three dogs, and no three identical
// symbols are next to each other in a row or a column.
//
// Puzzle: a list of given cells and edge hints that leave exactly one valid board.
// The puzzle of board N sits on line N + 1 of each difficulty file, as "cells|edges".
// A cell is its index (row * 6 + column). An edge hint is the index of the edge between two
// neighbouring cells; its type (same or different) is read from the board itself:
//   0..29   horizontal edge between (row, column) and (row, column + 1): row * 5 + column
//   30..59  vertical edge between (row, column) and (row + 1, column): 30 + row * 6 + column
//
// Example: board 1 and its easy puzzle (pictures in the example/ folder).
//
//   boards.json, line 2:  "110100110100001011110100001011001011"
//   split into rows of 6: 110100 / 110100 / 001011 / 110100 / 001011 / 001011
//                         (0 = cat 🐱, 1 = dog 🐶)
//
//   easy.json, line 2:    "1,4,19,21,22,33,35|11,13,14,19,29,32,33,43,52,53,58"
//   given cells (before the "|"):
//     1  -> row 0, column 1 -> board symbol 1 -> 🐶 shown from the start
//     4  -> row 0, column 4 -> board symbol 0 -> 🐱
//     19 -> row 3, column 1 -> 🐶 ... and so on for 21, 22, 33 and 35
//   edge hints (after the "|"), e.g.:
//     14 -> horizontal edge, row 14 / 5 = 2, column 14 % 5 = 4: cells (2,4) and (2,5).
//           Both hold 1 in the board, so the hint is "same" (=).
//     52 -> vertical edge, cell 52 - 30 = 22 = (3,4) and the cell below it (4,4).
//           The board holds 0 and 1 there, so the hint is "different" (x).
//   The game fills in only the given cells and shows the hints; the player finds the rest.
//
// Every puzzle can be solved from its clues by the steps the hint button explains (see
// deduction-solver.mjs), so a hint never has to fall back to "needs a longer chain of
// reasoning". Easy puzzles need nothing but the simple rules, with no trying out of symbols.

import { mkdirSync, writeFileSync } from "node:fs";
import { ClueIndex } from "./clue-index.mjs";
import {
  countCellsLeftBySimpleRules,
  findSolvingLevel,
  isSolvableAtLevel,
  SOLVING_LEVELS,
} from "./deduction-solver.mjs";
import { formatAsJsonWithOneElementPerLine } from "./format-json.mjs";

const BOARD_SIZE = 6;
const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;
const SYMBOLS_PER_LINE = BOARD_SIZE / 2;
const MAX_ADJACENT_IDENTICAL = 2;
const OUTPUT_DIRECTORY = new URL("../src/data/", import.meta.url);

// Easy keeps the most clues, hard removes clues until none can go.
// A target of 0 means "remove as many clues as possible".
// Easy puzzles that need more clues than the target to be solvable by the simple rules
// get the extra clues added.
const TARGET_CLUE_COUNT_PER_DIFFICULTY = { easy: 18, medium: 13, hard: 0 };

// The hardest reasoning a puzzle of the difficulty may need, as the hint button explains it.
const REQUIRED_SOLVING_LEVEL_PER_DIFFICULTY = {
  easy: SOLVING_LEVELS.simpleRules,
  medium: SOLVING_LEVELS.lookahead,
  hard: SOLVING_LEVELS.lookahead,
};

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
    const hasTooManyOfOneSymbol =
      dogCount > SYMBOLS_PER_LINE || catCount > SYMBOLS_PER_LINE;

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
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

// The clues of a puzzle: the given cells and the edges that carry a hint.
function createAllClues(edges) {
  return {
    givenCells: new Set(Array.from({ length: CELL_COUNT }, (_, cell) => cell)),
    hintEdges: new Set(edges.keys()),
  };
}

function copyClues(clues) {
  return {
    givenCells: new Set(clues.givenCells),
    hintEdges: new Set(clues.hintEdges),
  };
}

function listClues(clues) {
  return [
    ...[...clues.givenCells].map((cell) => ({ kind: "cell", id: cell })),
    ...[...clues.hintEdges].map((edge) => ({ kind: "edge", id: edge })),
  ];
}

function getClueSet(clues, clue) {
  return clue.kind === "cell" ? clues.givenCells : clues.hintEdges;
}

function createClueBitsets(board, clues, clueIndex, edges) {
  return [
    ...[...clues.givenCells].map(
      (cell) => clueIndex.cellBitsets[cell * 2 + board[cell]],
    ),
    ...[...clues.hintEdges].map((edge) => {
      const [firstCell, secondCell] = edges[edge];
      const isSame = board[firstCell] === board[secondCell] ? 1 : 0;
      return clueIndex.edgeBitsets[edge * 2 + isSame];
    }),
  ];
}

function hasExactlyOneSolution(board, clues, clueIndex, edges) {
  const clueBitsets = createClueBitsets(board, clues, clueIndex, edges);
  return clueIndex.countMatchingBoards(clueBitsets, 2) === 1;
}

function isSolvableAtRequiredLevel(board, clues, requiredSolvingLevel, edges) {
  const solvingLevel = findSolvingLevel(
    board,
    clues.givenCells,
    clues.hintEdges,
    edges,
  );
  return isSolvableAtLevel(solvingLevel, requiredSolvingLevel);
}

// Takes clues away in a random order and puts a clue back when the puzzle stops being
// acceptable without it, until the target clue count is reached.
function removeClues(seed, targetClueCount, edges, isPuzzleAcceptable) {
  const nextRandom = createRandomGenerator(seed);
  const clues = createAllClues(edges);

  for (const clue of shuffle(listClues(clues), nextRandom)) {
    const clueSet = getClueSet(clues, clue);
    const hasReachedTarget =
      countUsefulClues(clues.givenCells, clues.hintEdges, edges) <=
      targetClueCount;

    if (hasReachedTarget) {
      break;
    }

    clueSet.delete(clue.id);

    if (!isPuzzleAcceptable(clues)) {
      clueSet.add(clue.id);
    }
  }

  return clues;
}

// Every clue that the puzzle does not have yet and that tells something new:
// a hint between two given cells would tell nothing.
function listMissingClues(clues, edges) {
  const missingCells = Array.from({ length: CELL_COUNT }, (_, cell) => cell)
    .filter((cell) => !clues.givenCells.has(cell))
    .map((cell) => ({ kind: "cell", id: cell }));
  const missingEdges = [...edges.keys()]
    .filter((edge) => !clues.hintEdges.has(edge))
    .filter((edge) => !isHintBetweenGivenCells(clues.givenCells, edge, edges))
    .map((edge) => ({ kind: "edge", id: edge }));

  return [...missingCells, ...missingEdges];
}

function addClue(clues, clue) {
  getClueSet(clues, clue).add(clue.id);
}

function countCellsLeftBySimpleRulesWithClue(board, clues, clue, edges) {
  const cluesWithClue = copyClues(clues);
  addClue(cluesWithClue, clue);

  return countCellsLeftBySimpleRules(
    board,
    cluesWithClue.givenCells,
    cluesWithClue.hintEdges,
    edges,
  );
}

// The first of the candidates that leaves the fewest cells to the player.
function findClueHelpingSimpleRulesMost(board, clues, candidateClues, edges) {
  let bestClue = candidateClues[0];
  let fewestCellsLeft = Infinity;

  for (const candidateClue of candidateClues) {
    const cellsLeft = countCellsLeftBySimpleRulesWithClue(
      board,
      clues,
      candidateClue,
      edges,
    );

    if (cellsLeft < fewestCellsLeft) {
      bestClue = candidateClue;
      fewestCellsLeft = cellsLeft;
    }
  }

  return bestClue;
}

// Adds the clue that helps the simple rules most, until they solve the whole puzzle.
// The candidates are shuffled, so the clue that wins a tie is the same on every run.
function addCluesUntilSolvableBySimpleRules(board, puzzleClues, seed, edges) {
  const nextRandom = createRandomGenerator(seed);
  const clues = copyClues(puzzleClues);

  const areCellsLeft = () =>
    countCellsLeftBySimpleRules(
      board,
      clues.givenCells,
      clues.hintEdges,
      edges,
    ) > 0;

  while (areCellsLeft()) {
    const candidateClues = shuffle(listMissingClues(clues, edges), nextRandom);
    addClue(
      clues,
      findClueHelpingSimpleRulesMost(board, clues, candidateClues, edges),
    );
  }

  return clues;
}

// First removes clues while the solution stays unique. When the hint button cannot
// explain how to solve the result, the puzzle is repaired: easy puzzles get clues added
// until the simple rules suffice, medium and hard puzzles are made again with clues
// kept whenever removing them would leave a puzzle the hint cannot explain.
function createPuzzle(board, boardIndex, difficultySettings, clueIndex, edges) {
  const { difficultySeed, targetClueCount, requiredSolvingLevel } =
    difficultySettings;
  const seed = boardIndex * 7919 + difficultySeed;
  const isExplainable = (clues) =>
    isSolvableAtRequiredLevel(board, clues, requiredSolvingLevel, edges);

  const uniqueClues = removeClues(seed, targetClueCount, edges, (clues) =>
    hasExactlyOneSolution(board, clues, clueIndex, edges),
  );

  if (isExplainable(uniqueClues)) {
    return { clues: uniqueClues, wasRepaired: false };
  }

  const needsSimpleRulesOnly =
    requiredSolvingLevel === SOLVING_LEVELS.simpleRules;
  const repairedClues = needsSimpleRulesOnly
    ? addCluesUntilSolvableBySimpleRules(board, uniqueClues, seed, edges)
    : removeClues(seed, targetClueCount, edges, isExplainable);

  return { clues: repairedClues, wasRepaired: true };
}

function isHintBetweenGivenCells(givenCells, edge, edges) {
  const [firstCell, secondCell] = edges[edge];
  return givenCells.has(firstCell) && givenCells.has(secondCell);
}

function removeHintsBetweenGivenCells(givenCells, hintEdges, edges) {
  return [...hintEdges].filter(
    (edge) => !isHintBetweenGivenCells(givenCells, edge, edges),
  );
}

function countUsefulClues(givenCells, hintEdges, edges) {
  return (
    givenCells.size +
    removeHintsBetweenGivenCells(givenCells, hintEdges, edges).length
  );
}

function encodePuzzle(clues, edges) {
  const hintEdges = removeHintsBetweenGivenCells(
    clues.givenCells,
    clues.hintEdges,
    edges,
  );
  const sortedCells = [...clues.givenCells].sort(
    (first, second) => first - second,
  );
  const sortedEdges = [...hintEdges].sort((first, second) => first - second);
  return `${sortedCells.join(",")}|${sortedEdges.join(",")}`;
}

function main() {
  const boards = createAllBoards(createValidRows());
  console.log(`Valid boards: ${boards.length}`);

  const edges = listEdges();
  const clueIndex = new ClueIndex(boards, edges);
  mkdirSync(OUTPUT_DIRECTORY, { recursive: true });

  writeFileSync(
    new URL("boards.json", OUTPUT_DIRECTORY),
    formatAsJsonWithOneElementPerLine(boards.map((board) => board.join(""))),
  );

  let difficultySeed = 1;
  for (const difficulty of Object.keys(TARGET_CLUE_COUNT_PER_DIFFICULTY)) {
    const difficultySettings = {
      difficultySeed,
      targetClueCount: TARGET_CLUE_COUNT_PER_DIFFICULTY[difficulty],
      requiredSolvingLevel: REQUIRED_SOLVING_LEVEL_PER_DIFFICULTY[difficulty],
    };
    const createdPuzzles = boards.map((board, boardIndex) =>
      createPuzzle(board, boardIndex, difficultySettings, clueIndex, edges),
    );
    const puzzles = createdPuzzles.map(({ clues }) =>
      encodePuzzle(clues, edges),
    );

    writeFileSync(
      new URL(`${difficulty}.json`, OUTPUT_DIRECTORY),
      formatAsJsonWithOneElementPerLine(puzzles),
    );
    logCreatedPuzzles(difficulty, createdPuzzles, difficultySettings);
    difficultySeed++;
  }
}

function logCreatedPuzzles(difficulty, createdPuzzles, difficultySettings) {
  const repairedCount = createdPuzzles.filter(
    ({ wasRepaired }) => wasRepaired,
  ).length;
  console.log(
    `${difficulty}: ${createdPuzzles.length} puzzles, ${repairedCount} repaired ` +
      `to be solvable at the "${difficultySettings.requiredSolvingLevel}" level`,
  );
}

main();

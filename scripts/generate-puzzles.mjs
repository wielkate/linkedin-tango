// Generates every valid board in three difficulties
// Run with: node scripts/generate-puzzles.mjs
// Output (src/data/): boards.json plus easy.json, medium.json and hard.json.
//
// Board: 6x6 cells, 0 = cat, 1 = dog, stored as a 36-character string, row by row.
// Valid board: every row and column has three cats and three dogs, and no three identical
// symbols are next to each other in a row or a column.
//
// The puzzle of board N sits on line N + 1 of each difficulty file, as "cells|edges".
// A cell is its index (row * 6 + column). An edge hint is the index of the edge between two
// neighboring cells; same/different is read from the board itself:
//   0..29   horizontal edge between (row, column) and (row, column + 1): row * 5 + column
//   30..59  vertical edge between (row, column) and (row + 1, column): 30 + row * 6 + column
//
//   See example/
//   boards.json, line 2:  "110100 110100 001011 110100 001011 001011"
//   easy.json, line 2:    "1,4,19,21,22,33,35 | 11,13,14,19,29,32,33,43,52,53,58"
//   given cells (before the "|"):
//     1  -> row 0, column 1 -> board symbol 1 -> 🐶 shown from the start
//     4  -> row 0, column 4 -> board symbol 0 -> 🐱
//     19 -> row 3, column 1 -> 🐶 ... and so on for 21, 22, 33 and 35
//   edge hints (after the "|"), e.g.:
//     14 -> horizontal edge, row 14 / 5 = 2, column 14 % 5 = 4: cells (2,4) and (2,5).
//           Both hold 1 in the board, so the hint is "same" (=).
//     52 -> vertical edge, cell 52 - 30 = 22 = (3,4) and the cell below it (4,4).
//           The board holds 0 and 1 there, so the hint is "different" (x).

import { mkdirSync, writeFileSync } from "node:fs";
import { ClueIndex } from "./clue-index.mjs";
import {
  countCellsLeftBySimpleRules,
  findSolvingLevel,
  isSolvableAtLevel,
  SOLVING_LEVELS,
} from "./deduction-solver.mjs";
import {
  BOARD_SIZE,
  CELL_COUNT,
  SYMBOLS_PER_LINE,
} from "../src/game/board-constants.ts";

const OUTPUT_DIRECTORY = new URL("../src/data/", import.meta.url);

// Clues to keep (0 = as few as possible) and the hardest reasoning the hint may need.
const DIFFICULTIES = {
  easy: { targetClueCount: 18, requiredLevel: SOLVING_LEVELS.simpleRules },
  medium: { targetClueCount: 13, requiredLevel: SOLVING_LEVELS.lookahead },
  hard: { targetClueCount: 0, requiredLevel: SOLVING_LEVELS.lookahead },
};

const CELLS = [...Array(CELL_COUNT).keys()]; // [0, 1... 35]

// Pairs of neighbouring cells: horizontal edges first, then vertical ones.
// Horizontal: [0,1] [1,2] [2,3] [3,4] [4,5] ...
// Vertical: [0,6] [1,7] [2,8] ... [5,11] ...
const EDGES = [
  ...CELLS.filter((cell) => cell % BOARD_SIZE < BOARD_SIZE - 1).map((cell) => [
    cell,
    cell + 1,
  ]),
  ...CELLS.filter((cell) => cell < CELL_COUNT - BOARD_SIZE).map((cell) => [
    cell,
    cell + BOARD_SIZE,
  ]),
];

// Valid when no symbol appears more than 3 times and none appears 3 times in a row.
// For a complete line this means exactly three of each.
function isLineValid(line) {
  const dogsCount = line.filter((value) => value === 1).length;
  const hasStreak = line.some(
    (value, i) => i >= 2 && value === line[i - 1] && value === line[i - 2],
  );
  return (
    dogsCount <= SYMBOLS_PER_LINE &&
    line.length - dogsCount <= SYMBOLS_PER_LINE &&
    !hasStreak
  );
}

function createAllBoards() {
  const validRows = Array.from({ length: 2 ** BOARD_SIZE }, (_, bits) =>
    Array.from({ length: BOARD_SIZE }, (_, column) => (bits >> column) & 1),
  ).filter(isLineValid);

  const boards = [];
  const addRows = (rows) => {
    if (rows.length === BOARD_SIZE) {
      boards.push(rows.flat());
      return;
    }
    for (const row of validRows) {
      const next = [...rows, row];
      if (
        CELLS.slice(0, BOARD_SIZE).every((column) =>
          isLineValid(next.map((r) => r[column])),
        )
      ) {
        addRows(next);
      }
    }
  };
  addRows([]);

  return boards;
}

// Small deterministic random generator, so the output is the same on every run.
function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

function shuffle(items, random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// A clue is { set: "givenCells" | "hintEdges", id }.
function listClues(clues) {
  return Object.entries(clues).flatMap(([set, ids]) =>
    [...ids].map((id) => ({ set, id })),
  );
}

function withClue(clues, { set, id }) {
  return { ...clues, [set]: new Set([...clues[set], id]) };
}

// A hint between two given cells would tell nothing.
const isUselessEdge = (givenCells, edge) =>
  EDGES[edge].every((cell) => givenCells.has(cell));

function listUsefulEdges({ givenCells, hintEdges }) {
  return [...hintEdges].filter((edge) => !isUselessEdge(givenCells, edge));
}

function countUsefulClues(clues) {
  return clues.givenCells.size + listUsefulEdges(clues).length;
}

function hasExactlyOneSolution(board, clues, clueIndex) {
  const cellBitsets = [...clues.givenCells].map(
    (cell) => clueIndex.cellBitsets[cell * 2 + board[cell]],
  );
  const edgeBitsets = [...clues.hintEdges].map((edge) => {
    const [first, second] = EDGES[edge];
    return clueIndex.edgeBitsets[
      edge * 2 + Number(board[first] === board[second])
    ];
  });
  return (
    clueIndex.countMatchingBoards([...cellBitsets, ...edgeBitsets], 2) === 1
  );
}

// Starts with every clue, takes them away in random order and puts one back when the
// puzzle stops being acceptable without it, until the target clue count is reached.
function removeClues(seed, targetClueCount, isAcceptable) {
  const random = createRandom(seed);
  const clues = {
    givenCells: new Set(CELLS),
    hintEdges: new Set(EDGES.keys()),
  };

  for (const { set, id } of shuffle(listClues(clues), random)) {
    if (countUsefulClues(clues) <= targetClueCount) {
      break;
    }

    clues[set].delete(id);
    if (!isAcceptable(clues)) {
      clues[set].add(id);
    }
  }

  return clues;
}

// Adds the clue that leaves the fewest cells to the simple rules, until they solve it all.
// Candidates are shuffled, so the clue that wins a tie is the same on every run.
function addCluesUntilSolvableBySimpleRules(board, startClues, seed) {
  const random = createRandom(seed);
  const countCellsLeft = ({ givenCells, hintEdges }) =>
    countCellsLeftBySimpleRules(board, givenCells, hintEdges, EDGES);
  let clues = startClues;

  while (countCellsLeft(clues) > 0) {
    const missingCells = CELLS.filter(
      (cell) => !clues.givenCells.has(cell),
    ).map((id) => ({ set: "givenCells", id }));
    const missingEdges = [...EDGES.keys()]
      .filter((edge) => !clues.hintEdges.has(edge))
      .filter((edge) => !isUselessEdge(clues.givenCells, edge))
      .map((id) => ({ set: "hintEdges", id }));

    let best = { cellsLeft: Infinity };
    for (const clue of shuffle([...missingCells, ...missingEdges], random)) {
      const cellsLeft = countCellsLeft(withClue(clues, clue));
      if (cellsLeft < best.cellsLeft) {
        best = { clue, cellsLeft };
      }
    }
    clues = withClue(clues, best.clue);
  }

  return clues;
}

// Removes clues while the solution stays unique. If the hint button cannot explain the
// result, the puzzle is repaired: easy gets clues added, medium and hard are made again
// keeping every clue whose removal would make the puzzle unexplainable.
function createPuzzle(board, boardIndex, difficultyIndex, settings, clueIndex) {
  const { targetClueCount, requiredLevel } = settings;
  const seed = boardIndex * 7919 + difficultyIndex + 1;
  const isExplainable = ({ givenCells, hintEdges }) =>
    isSolvableAtLevel(
      findSolvingLevel(board, givenCells, hintEdges, EDGES),
      requiredLevel,
    );

  const uniqueClues = removeClues(seed, targetClueCount, (clues) =>
    hasExactlyOneSolution(board, clues, clueIndex),
  );
  if (isExplainable(uniqueClues)) {
    return { clues: uniqueClues, wasRepaired: false };
  }

  const clues =
    requiredLevel === SOLVING_LEVELS.simpleRules
      ? addCluesUntilSolvableBySimpleRules(board, uniqueClues, seed)
      : removeClues(seed, targetClueCount, isExplainable);
  return { clues, wasRepaired: true };
}

function encodePuzzle(clues) {
  const byNumber = (a, b) => a - b;
  const cells = [...clues.givenCells].sort(byNumber);
  const edges = listUsefulEdges(clues).sort(byNumber);
  return `${cells.join(",")}|${edges.join(",")}`;
}

function writeJson(name, data) {
  writeFileSync(new URL(name, OUTPUT_DIRECTORY), `${JSON.stringify(data)}\n`);
}

function main() {
  const boards = createAllBoards();
  console.log(`Valid boards: ${boards.length}`);

  const clueIndex = new ClueIndex(boards, EDGES);
  mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
  writeJson(
    "boards.json",
    boards.map((board) => board.join("")),
  );

  Object.entries(DIFFICULTIES).forEach(
    ([difficulty, settings], difficultyIndex) => {
      const created = boards.map((board, boardIndex) =>
        createPuzzle(board, boardIndex, difficultyIndex, settings, clueIndex),
      );
      writeJson(
        `${difficulty}.json`,
        created.map(({ clues }) => encodePuzzle(clues)),
      );

      const repaired = created.filter(({ wasRepaired }) => wasRepaired).length;
      console.log(
        `${difficulty}: ${created.length} puzzles, ${repaired} repaired ` +
          `to be solvable at the "${settings.requiredLevel}" level`,
      );
    },
  );
}

main();

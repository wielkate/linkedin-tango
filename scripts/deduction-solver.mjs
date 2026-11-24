// Solves a puzzle the way the hint button explains it.
//
// It repeats the two kinds of steps of src/hints/ (keep both in step with them):
//   1. Simple rules: an edge hint with one cell known, a pair of identical symbols
//      with an empty cell next to it, sandwich, and a line that already holds three of one symbol.
//   2. Lookahead: assume a symbol in an empty cell, let the simple rules fill in
//      whatever they force, and if a rule breaks, the cell holds the other symbol.
//
// A hint that finds neither step falls back to "this one needs a longer chain of
// reasoning", which explains nothing. The solving level tells how far a puzzle gets.

import {
  BOARD_SIZE,
  CELL_COUNT,
  FORBIDDEN_STREAK_LENGTH,
  SYMBOLS_PER_LINE,
} from "../src/game/board-constants.ts";
import { ALL_SYMBOLS, CAT, DOG } from "../src/game/symbols.ts";

const EMPTY = -1;

// How far the hint can follow a puzzle from the given cells to the full solution.
export const SOLVING_LEVELS = Object.freeze({
  simpleRules: "simple-rules",
  lookahead: "lookahead",
  stuck: "stuck",
});
const LEVEL_ORDER = Object.values(SOLVING_LEVELS);

const LINES = createAllLines();
const WINDOWS = LINES.flatMap(createWindows);

function createAllLines() {
  const lines = [];

  for (let index = 0; index < BOARD_SIZE; index++) {
    const row = [];
    const column = [];

    for (let position = 0; position < BOARD_SIZE; position++) {
      row.push(index * BOARD_SIZE + position);
      column.push(position * BOARD_SIZE + index);
    }

    lines.push(row, column);
  }

  return lines;
}

function createWindows(line) {
  const windows = [];

  for (let start = 0; start + FORBIDDEN_STREAK_LENGTH <= line.length; start++) {
    windows.push(line.slice(start, start + FORBIDDEN_STREAK_LENGTH));
  }

  return windows;
}

function getOppositeSymbol(symbol) {
  return symbol === CAT ? DOG : CAT;
}

export function isSolvableAtLevel(currentLevel, requiredLevel) {
  return (
    LEVEL_ORDER.indexOf(currentLevel) <= LEVEL_ORDER.indexOf(requiredLevel)
  );
}

export function findSolvingLevel(solutionBoard, givenCells, hintEdges, edges) {
  const cells = createCellsWithGivenSymbols(solutionBoard, givenCells);
  const edgeHints = createEdgeHints(solutionBoard, hintEdges, edges);

  assertNoContradiction(runSimpleRulesUntilStable(cells, edgeHints));

  if (isEveryCellFilled(cells)) {
    return SOLVING_LEVELS.simpleRules;
  }

  const canLookaheadFinish = solveWithLookahead(cells, edgeHints);
  return canLookaheadFinish ? SOLVING_LEVELS.lookahead : SOLVING_LEVELS.stuck;
}

// 0 means solved puzzle.
export function countCellsLeftBySimpleRules(
  solutionBoard,
  givenCells,
  hintEdges,
  edges,
) {
  const cells = createCellsWithGivenSymbols(solutionBoard, givenCells);
  const edgeHints = createEdgeHints(solutionBoard, hintEdges, edges);

  assertNoContradiction(runSimpleRulesUntilStable(cells, edgeHints));
  return cells.filter((symbol) => symbol === EMPTY).length;
}

function createCellsWithGivenSymbols(solutionBoard, givenCells) {
  const cells = new Int8Array(CELL_COUNT).fill(EMPTY);

  for (const cell of givenCells) {
    cells[cell] = solutionBoard[cell];
  }

  return cells;
}

function createEdgeHints(solutionBoard, hintEdges, edges) {
  return [...hintEdges].map((edge) => {
    const [a, b] = edges[edge];
    const same = solutionBoard[a] === solutionBoard[b];
    return { a, b, same };
  });
}

// The clues come from a real solution, so a broken rule means a bug.
function assertNoContradiction(didReachContradiction) {
  if (didReachContradiction) {
    throw new Error(
      "The simple rules contradict a puzzle made from a solution.",
    );
  }
}

function isEveryCellFilled(cells) {
  return cells.every((symbol) => symbol !== EMPTY);
}

// Applies lookahead, then the simple rules it unlocked, until the board is full or
// lookahead finds nothing more. Returns whether the board ended up full.
function solveWithLookahead(cells, edgeHints) {
  let filledCellCount = 1;

  while (filledCellCount > 0 && !isEveryCellFilled(cells)) {
    filledCellCount = fillCellsByLookahead(cells, edgeHints);
    assertNoContradiction(runSimpleRulesUntilStable(cells, edgeHints));
  }

  return isEveryCellFilled(cells);
}

function fillCellsByLookahead(cells, edgeHints) {
  let filledCellCount = 0;

  for (let cell = 0; cell < CELL_COUNT; cell++) {
    if (cells[cell] !== EMPTY) {
      continue;
    }

    const rejectedSymbol = ALL_SYMBOLS.find((symbol) =>
      doesAssumptionLeadToContradiction(cells, edgeHints, cell, symbol),
    );

    if (rejectedSymbol !== undefined) {
      cells[cell] = getOppositeSymbol(rejectedSymbol);
      filledCellCount++;
    }
  }

  return filledCellCount;
}

function doesAssumptionLeadToContradiction(
  cells,
  edgeHints,
  cell,
  assumedSymbol,
) {
  const trialCells = cells.slice();
  trialCells[cell] = assumedSymbol;
  return runSimpleRulesUntilStable(trialCells, edgeHints);
}

// Fills in whatever the simple rules force, again and again, until nothing more is
// forced. Returns true when a rule breaks on the way instead.
function runSimpleRulesUntilStable(cells, edgeHints) {
  while (true) {
    if (isAnyRuleBroken(cells, edgeHints)) {
      return true;
    }

    const deductions = findSimpleDeductions(cells, edgeHints);

    if (areDeductionsConflicting(deductions)) {
      return true;
    }

    if (deductions.length === 0) {
      return false;
    }

    for (const { cell, symbol } of deductions) {
      cells[cell] = symbol;
    }
  }
}

function isAnyRuleBroken(cells, edgeHints) {
  return (
    LINES.some((line) => hasTooManyOfOneSymbol(cells, line)) ||
    WINDOWS.some((window) => areFilledAndIdentical(cells, window)) ||
    edgeHints.some((edgeHint) => isEdgeHintBroken(cells, edgeHint))
  );
}

function hasTooManyOfOneSymbol(cells, line) {
  return ALL_SYMBOLS.some(
    (symbol) => count(cells, line, symbol) > SYMBOLS_PER_LINE,
  );
}

function count(cells, line, symbol) {
  return line.filter((cell) => cells[cell] === symbol).length;
}

function areFilledAndIdentical(cells, window) {
  const [a, b, c] = window;
  return cells[a] !== EMPTY && cells[a] === cells[b] && cells[b] === cells[c];
}

function isEdgeHintBroken(cells, edgeHint) {
  const { a, b, same } = edgeHint;
  return (
    cells[a] !== EMPTY && cells[b] !== EMPTY && (cells[a] === cells[b]) !== same
  );
}

// Every empty cell that one simple rule settles, as { cell, symbol }.
function findSimpleDeductions(cells, edgeHints) {
  return [
    ...edgeHints.flatMap((edgeHint) => deduceFromEdgeHint(cells, edgeHint)),
    ...WINDOWS.flatMap((window) => deduceFromPair(cells, window)),
    ...WINDOWS.flatMap((window) => deduceFromSandwich(cells, window)),
    ...LINES.flatMap((line) => deduceFromCompleteSymbols(cells, line)),
  ];
}

function deduceFromEdgeHint(cells, edgeHint) {
  const { a, b, same } = edgeHint;
  const isOnlyFirstFilled = cells[a] !== EMPTY && cells[b] === EMPTY;
  const isOnlySecondFilled = cells[a] === EMPTY && cells[b] !== EMPTY;

  if (isOnlyFirstFilled) {
    return createEdgeHintDeduction(b, cells[a], same);
  }

  if (isOnlySecondFilled) {
    return createEdgeHintDeduction(a, cells[b], same);
  }

  return [];
}

function createEdgeHintDeduction(emptyCell, partnerSymbol, same) {
  const symbol = same ? partnerSymbol : getOppositeSymbol(partnerSymbol);
  return [{ cell: emptyCell, symbol }];
}

function deduceFromPair(cells, window) {
  const [a, b, c] = window;
  const isPairAtStart =
    cells[a] !== EMPTY && cells[a] === cells[b] && cells[c] === EMPTY;
  const isPairAtEnd =
    cells[c] !== EMPTY && cells[c] === cells[b] && cells[a] === EMPTY;

  if (isPairAtStart) {
    return [{ cell: c, symbol: getOppositeSymbol(cells[a]) }];
  }

  if (isPairAtEnd) {
    return [{ cell: a, symbol: getOppositeSymbol(cells[c]) }];
  }

  return [];
}

function deduceFromSandwich(cells, window) {
  const [a, b, c] = window;
  const areEndsIdentical = cells[a] !== EMPTY && cells[a] === cells[c];
  const isMiddleEmpty = cells[b] === EMPTY;

  if (areEndsIdentical && isMiddleEmpty) {
    return [{ cell: b, symbol: getOppositeSymbol(cells[a]) }];
  }

  return [];
}

function deduceFromCompleteSymbols(cells, line) {
  const emptyCells = line.filter((cell) => cells[cell] === EMPTY);

  return ALL_SYMBOLS.filter(
    (symbol) => count(cells, line, symbol) === SYMBOLS_PER_LINE,
  ).flatMap((completeSymbol) =>
    emptyCells.map((cell) => ({
      cell,
      symbol: getOppositeSymbol(completeSymbol),
    })),
  );
}

function areDeductionsConflicting(deductions) {
  const symbolsByCell = new Map();

  for (const { cell, symbol } of deductions) {
    const earlierSymbol = symbolsByCell.get(cell);

    if (earlierSymbol !== undefined && earlierSymbol !== symbol) {
      return true;
    }

    symbolsByCell.set(cell, symbol);
  }

  return false;
}

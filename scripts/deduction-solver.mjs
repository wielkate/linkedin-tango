// Solves a puzzle the way the hint button explains it, so the generator can tell
// which puzzles the hint can explain all the way to the end.
//
// It repeats the two kinds of steps of src/hints/ (keep both in step with them):
//   1. Simple rules: an edge hint with one cell known, a pair of identical symbols
//      with an empty cell next to it, an empty cell between two identical symbols,
//      and a line that already holds three of one symbol.
//   2. Lookahead: assume a symbol in an empty cell, let the simple rules fill in
//      whatever they force, and if a rule breaks, the cell holds the other symbol.
//
// A hint that finds neither step falls back to "this one needs a longer chain of
// reasoning", which explains nothing. The solving level tells how far a puzzle gets.
//
// The steps only ever add knowledge, so the order they are applied in does not change
// the result. Solving from the given cells alone is therefore enough to know whether
// the hint can explain a move from every position the player can reach.

const BOARD_SIZE = 6;
const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;
const SYMBOLS_PER_LINE = BOARD_SIZE / 2;
const FORBIDDEN_STREAK_LENGTH = 3;
const EMPTY = -1;
const CAT = 0;
const DOG = 1;
const ALL_SYMBOLS = [CAT, DOG];

// How far the hint can follow a puzzle from the given cells to the full solution.
export const SOLVING_LEVELS = Object.freeze({
  simpleRules: "simple-rules",
  lookahead: "lookahead",
  stuck: "stuck",
});

const SOLVING_LEVEL_ORDER = [
  SOLVING_LEVELS.simpleRules,
  SOLVING_LEVELS.lookahead,
  SOLVING_LEVELS.stuck,
];

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
  const streaks = [];

  for (let start = 0; start + FORBIDDEN_STREAK_LENGTH <= line.length; start++) {
    streaks.push(line.slice(start, start + FORBIDDEN_STREAK_LENGTH));
  }

  return streaks;
}

function getOppositeSymbol(symbol) {
  return symbol === CAT ? DOG : CAT;
}

// Is the level reached no harder than the level the difficulty asks for?
export function isSolvableAtLevel(solvingLevel, requiredSolvingLevel) {
  return (
    SOLVING_LEVEL_ORDER.indexOf(solvingLevel) <=
    SOLVING_LEVEL_ORDER.indexOf(requiredSolvingLevel)
  );
}

// Solves the puzzle made of the given cells and edge hints on the solution board.
// The board holds 0 (cat) or 1 (dog) per cell, edges are the list of cell pairs
// that the edge hint indexes point into.
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

// How many cells the simple rules alone leave empty. 0 means they solve the puzzle.
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
    const [firstCell, secondCell] = edges[edge];
    const hasSameSymbols =
      solutionBoard[firstCell] === solutionBoard[secondCell];
    return { firstCell, secondCell, hasSameSymbols };
  });
}

// The clues come from a real solution, so no rule can break while solving them.
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
  const hasLineWithTooManyOfOneSymbol = LINES.some((line) =>
    hasTooManyOfOneSymbol(cells, line),
  );
  const hasTooLongStreak = WINDOWS.some((streakCells) =>
    areFilledAndIdentical(cells, streakCells),
  );
  const hasBrokenEdgeHint = edgeHints.some((edgeHint) =>
    isEdgeHintBroken(cells, edgeHint),
  );

  return hasLineWithTooManyOfOneSymbol || hasTooLongStreak || hasBrokenEdgeHint;
}

function hasTooManyOfOneSymbol(cells, line) {
  return ALL_SYMBOLS.some(
    (symbol) => countSymbolInLine(cells, line, symbol) > SYMBOLS_PER_LINE,
  );
}

function countSymbolInLine(cells, line, symbol) {
  return line.filter((cell) => cells[cell] === symbol).length;
}

function areFilledAndIdentical(cells, streakCells) {
  const firstSymbol = cells[streakCells[0]];
  const isFirstCellFilled = firstSymbol !== EMPTY;
  const haveSameSymbol = streakCells.every(
    (cell) => cells[cell] === firstSymbol,
  );
  return isFirstCellFilled && haveSameSymbol;
}

function isEdgeHintBroken(cells, edgeHint) {
  const firstSymbol = cells[edgeHint.firstCell];
  const secondSymbol = cells[edgeHint.secondCell];
  const areBothCellsFilled = firstSymbol !== EMPTY && secondSymbol !== EMPTY;
  const haveSameSymbol = firstSymbol === secondSymbol;

  return areBothCellsFilled && haveSameSymbol !== edgeHint.hasSameSymbols;
}

// Every empty cell that one simple rule settles, as { cell, symbol }.
function findSimpleDeductions(cells, edgeHints) {
  return [
    ...edgeHints.flatMap((edgeHint) => deduceFromEdgeHint(cells, edgeHint)),
    ...WINDOWS.flatMap((streakCells) =>
      deduceFromNeighbouringPair(cells, streakCells),
    ),
    ...WINDOWS.flatMap((streakCells) => deduceFromSandwich(cells, streakCells)),
    ...LINES.flatMap((line) => deduceFromCompleteSymbols(cells, line)),
  ];
}

// The other cell of an edge hint is filled, so this cell follows from "=" or "×".
function deduceFromEdgeHint(cells, edgeHint) {
  const { firstCell, secondCell, hasSameSymbols } = edgeHint;
  const isOnlyFirstFilled =
    cells[firstCell] !== EMPTY && cells[secondCell] === EMPTY;
  const isOnlySecondFilled =
    cells[firstCell] === EMPTY && cells[secondCell] !== EMPTY;

  if (isOnlyFirstFilled) {
    return [
      createEdgeHintDeduction(secondCell, cells[firstCell], hasSameSymbols),
    ];
  }

  if (isOnlySecondFilled) {
    return [
      createEdgeHintDeduction(firstCell, cells[secondCell], hasSameSymbols),
    ];
  }

  return [];
}

function createEdgeHintDeduction(emptyCell, partnerSymbol, hasSameSymbols) {
  const symbol = hasSameSymbols
    ? partnerSymbol
    : getOppositeSymbol(partnerSymbol);
  return { cell: emptyCell, symbol };
}

// Two identical symbols side by side: the cell next to the pair is the other symbol.
function deduceFromNeighbouringPair(cells, streakCells) {
  const [firstCell, middleCell, lastCell] = streakCells;
  const firstSymbol = cells[firstCell];
  const middleSymbol = cells[middleCell];
  const lastSymbol = cells[lastCell];
  const isPairAtStart =
    firstSymbol !== EMPTY &&
    firstSymbol === middleSymbol &&
    lastSymbol === EMPTY;
  const isPairAtEnd =
    lastSymbol !== EMPTY &&
    lastSymbol === middleSymbol &&
    firstSymbol === EMPTY;

  if (isPairAtStart) {
    return [{ cell: lastCell, symbol: getOppositeSymbol(firstSymbol) }];
  }

  if (isPairAtEnd) {
    return [{ cell: firstCell, symbol: getOppositeSymbol(lastSymbol) }];
  }

  return [];
}

// An empty cell between two identical symbols is the other symbol.
function deduceFromSandwich(cells, streakCells) {
  const [firstCell, middleCell, lastCell] = streakCells;
  const areEndsIdentical =
    cells[firstCell] !== EMPTY && cells[firstCell] === cells[lastCell];
  const isMiddleEmpty = cells[middleCell] === EMPTY;

  if (areEndsIdentical && isMiddleEmpty) {
    return [{ cell: middleCell, symbol: getOppositeSymbol(cells[firstCell]) }];
  }

  return [];
}

// A line that already holds all three of one symbol can only take the other symbol.
function deduceFromCompleteSymbols(cells, line) {
  const emptyCells = line.filter((cell) => cells[cell] === EMPTY);

  return ALL_SYMBOLS.filter(
    (symbol) => countSymbolInLine(cells, line, symbol) === SYMBOLS_PER_LINE,
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

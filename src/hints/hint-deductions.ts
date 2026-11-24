import type { Board } from "../game/board";
import {
  FORBIDDEN_STREAK_LENGTH,
  SYMBOLS_PER_LINE,
} from "../game/board-constants";
import type { CellPosition } from "../game/cell-position";
import type { EdgeHint } from "../game/edge-hint";
import { getAllLines, getLineWindows, type Line } from "../game/line";
import {
  ALL_SYMBOLS,
  getOppositeSymbol,
  type PlayerSymbol,
} from "../game/symbols";
import type { Deduction } from "./deduction";

// Every empty cell that one simple rule settles, easiest rules first.
// A cell can appear more than once when several rules agree on it (or, on a broken board, disagree).
export function findSimpleDeductions(
  board: Board,
  edgeHints: EdgeHint[],
): Deduction[] {
  const lines = getAllLines();

  return [
    ...edgeHints.flatMap((edgeHint) => deduceFromEdgeHint(board, edgeHint)),
    ...lines.flatMap((line) => findNeighbouringPairDeductions(board, line)),
    ...lines.flatMap((line) => findSandwichDeductions(board, line)),
    ...lines.flatMap((line) => findCompleteLineDeductions(board, line)),
  ];
}

function deduceFromEdgeHint(board: Board, edgeHint: EdgeHint): Deduction[] {
  const firstValue = board.getValue(edgeHint.first);
  const secondValue = board.getValue(edgeHint.second);
  const isOnlyFirstFilled = firstValue !== null && secondValue === null;
  const isOnlySecondFilled = firstValue === null && secondValue !== null;

  if (isOnlyFirstFilled) {
    return [
      createEdgeHintDeduction(
        edgeHint,
        edgeHint.second,
        edgeHint.first,
        firstValue,
      ),
    ];
  }

  if (isOnlySecondFilled) {
    return [
      createEdgeHintDeduction(
        edgeHint,
        edgeHint.first,
        edgeHint.second,
        secondValue,
      ),
    ];
  }

  return [];
}

function createEdgeHintDeduction(
  edgeHint: EdgeHint,
  emptyPosition: CellPosition,
  partner: CellPosition,
  partnerSymbol: PlayerSymbol,
): Deduction {
  const symbol =
    edgeHint.type === "same" ? partnerSymbol : getOppositeSymbol(partnerSymbol);
  return {
    position: emptyPosition,
    symbol,
    kind: { type: "edge-hint", hintType: edgeHint.type, partner },
  };
}

// Two identical symbols side by side
function findNeighbouringPairDeductions(board: Board, line: Line): Deduction[] {
  return getLineWindows(line, FORBIDDEN_STREAK_LENGTH).flatMap(
    ([firstPosition, middlePosition, lastPosition]) => {
      const firstValue = board.getValue(firstPosition);
      const middleValue = board.getValue(middlePosition);
      const lastValue = board.getValue(lastPosition);
      const isPairAtStart =
        firstValue !== null && firstValue === middleValue && lastValue === null;
      const isPairAtEnd =
        lastValue !== null && lastValue === middleValue && firstValue === null;

      if (isPairAtStart) {
        return [
          createPairDeduction(
            lastPosition,
            [firstPosition, middlePosition],
            firstValue,
          ),
        ];
      }

      if (isPairAtEnd) {
        return [
          createPairDeduction(
            firstPosition,
            [middlePosition, lastPosition],
            lastValue,
          ),
        ];
      }

      return [];
    },
  );
}

function createPairDeduction(
  emptyPosition: CellPosition,
  pair: CellPosition[],
  pairSymbol: PlayerSymbol,
): Deduction {
  return {
    position: emptyPosition,
    symbol: getOppositeSymbol(pairSymbol),
    kind: { type: "neighbouring-pair", pair },
  };
}

// Sandwich
function findSandwichDeductions(board: Board, line: Line): Deduction[] {
  return getLineWindows(line, FORBIDDEN_STREAK_LENGTH).flatMap(
    ([firstPosition, middlePosition, lastPosition]) => {
      const firstValue = board.getValue(firstPosition);
      const lastValue = board.getValue(lastPosition);
      const areEndsIdentical = firstValue !== null && firstValue === lastValue;

      if (!areEndsIdentical || !board.isEmpty(middlePosition)) {
        return [];
      }

      return [
        {
          position: middlePosition,
          symbol: getOppositeSymbol(firstValue),
          kind: {
            type: "sandwiched",
            line,
            ends: [firstPosition, lastPosition],
            endSymbol: firstValue,
          },
        },
      ];
    },
  );
}

// A line that already holds all three of one symbol can only take the other symbol.
function findCompleteLineDeductions(board: Board, line: Line): Deduction[] {
  return ALL_SYMBOLS.flatMap((completeSymbol) => {
    const completedPositions = line.positions.filter(
      (position) => board.getValue(position) === completeSymbol,
    );
    const isSymbolComplete = completedPositions.length === SYMBOLS_PER_LINE;

    if (!isSymbolComplete) {
      return [];
    }

    return line.positions
      .filter((position) => board.isEmpty(position))
      .map((position) => ({
        position,
        symbol: getOppositeSymbol(completeSymbol),
        kind: { type: "line-complete", completedPositions },
      }));
  });
}

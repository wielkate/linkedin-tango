import type { CellPosition } from "../game/cell-position";
import { describeLine } from "../game/line";
import { SYMBOL_EMOJIS } from "../game/symbols";
import type { Deduction } from "./deduction";

export interface DeductionExplanation {
  explanation: string;
  relatedPositions: CellPosition[];
}

export function explainDeduction(deduction: Deduction): DeductionExplanation {
  const answerEmoji = SYMBOL_EMOJIS[deduction.symbol];
  const kind = deduction.kind;

  switch (kind.type) {
    case "edge-hint": {
      const explanation =
        kind.hintType === "same"
          ? `Equal cells hold the same symbol, so this one is ${answerEmoji} too.`
          : `Crossed cells hold different symbols, so this one must be ${answerEmoji}.`;
      return { explanation, relatedPositions: [kind.partner] };
    }

    case "neighbouring-pair":
      return {
        explanation: `Three identical symbols may not touch, so this cell must be ${answerEmoji}.`,
        relatedPositions: kind.pair,
      };

    case "sandwiched": {
      const endEmoji = SYMBOL_EMOJIS[kind.endSymbol];
      return {
        explanation:
          `This cell sits between two ${endEmoji} in ${describeLine(kind.line)}. ` +
          `A third ${endEmoji} here would make three identical symbols in a row, so it must be ${answerEmoji}.`,
        relatedPositions: kind.ends,
      };
    }

    case "line-complete":
      return {
        explanation: `Every row and column holds exactly three of each symbol, leaving ${answerEmoji} in the empty cell.`,
        relatedPositions: kind.completedPositions,
      };

    case "contradiction":
      return {
        explanation:
          `No simple rule fits here, so try it out! With a ${SYMBOL_EMOJIS[kind.rejectedSymbol]} in this cell, the rules force one cell after another until a row or column breaks a rule. ` +
          `So this cell must be ${answerEmoji}.`,
        relatedPositions: [],
      };

    case "solution-only":
      return {
        explanation: `This one needs a longer chain of reasoning than the hint can show. The solution has a ${answerEmoji} here.`,
        relatedPositions: [],
      };
  }
}

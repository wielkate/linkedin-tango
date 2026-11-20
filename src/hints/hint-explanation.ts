import { SYMBOL_EMOJIS, type CellPosition, type Line, type PlayerSymbol } from '../game/board';
import type { Deduction } from './hint-deductions';

// The sentence shown next to the board: which rule fixes the cell, in plain words.
export function createExplanationMessage(deduction: Deduction): string {
  const answerEmoji = SYMBOL_EMOJIS[deduction.symbol];
  const { reason } = deduction;

  switch (reason.kind) {
    case 'edge-hint':
      return createEdgeHintMessage(deduction.symbol, reason.hintType, reason.partner);
    case 'neighbouring-pair':
      return `Three identical symbols may not touch, so this cell must be ${answerEmoji}.`;
    case 'sandwiched':
      return `This cell sits between two ${SYMBOL_EMOJIS[reason.endSymbol]} in ${describeLine(reason.line)}. `
        + `A third ${SYMBOL_EMOJIS[reason.endSymbol]} here would make three identical symbols in a row, so it must be ${answerEmoji}.`;
    case 'line-complete':
      return `Every row and column holds exactly three of each symbol leaving ${answerEmoji} in the empty cell.`;
    case 'contradiction':
      return `No simple rule fits here, so try it out! With a ${SYMBOL_EMOJIS[reason.rejectedSymbol]} in this cell, the rules force one cell after another until a row or column breaks a rule. `
        + `So this cell must be ${answerEmoji}.`;
    case 'solution-only':
      return `This one needs a longer chain of reasoning than the hint can show. The solution has a ${answerEmoji} here.`;
  }
}

function createEdgeHintMessage(
  symbol: PlayerSymbol,
  hintType: 'same' | 'different',
  partner: CellPosition,
): string {
  const answerEmoji = SYMBOL_EMOJIS[symbol];
  describeCell(partner);
  if (hintType === 'same') {
    return `Equal cells hold the same symbol, so this one is ${answerEmoji} too.`;
  }

  return `Crossed cells hold different symbols, so this one must be ${answerEmoji}.`;
}

// The cells that the explanation talks about, so the board can point at them.
export function findRelatedPositions(deduction: Deduction): CellPosition[] {
  const { reason } = deduction;

  switch (reason.kind) {
    case 'edge-hint':
      return [reason.partner];
    case 'neighbouring-pair':
      return reason.pair;
    case 'sandwiched':
      return reason.ends;
    case 'line-complete':
      return reason.completedPositions;
    case 'contradiction':
    case 'solution-only':
      return [];
  }
}

function describeCell(position: CellPosition): string {
  return `row ${position.row + 1}, column ${position.column + 1}`;
}

function describeLine(line: Line): string {
  return `${line.direction} ${line.index + 1}`;
}

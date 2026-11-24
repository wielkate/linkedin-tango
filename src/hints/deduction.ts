import type { CellPosition } from "../game/cell-position";
import type { HintType } from "../game/edge-hint";
import type { Line } from "../game/line";
import type { PlayerSymbol } from "../game/symbols";

// Why a cell has to hold a certain symbol. Each kind is one rule the player can apply by hand.
export type DeductionKind =
  | { type: "edge-hint"; hintType: HintType; partner: CellPosition }
  | { type: "neighbouring-pair"; pair: CellPosition[] }
  | {
      type: "sandwiched";
      line: Line;
      ends: CellPosition[];
      endSymbol: PlayerSymbol;
    }
  | { type: "line-complete"; completedPositions: CellPosition[] }
  // Assuming the other symbol makes the simple rules force one cell after another until a rule breaks.
  | { type: "contradiction"; rejectedSymbol: PlayerSymbol }
  // No rule the hint can show settles the cell; only the stored solution knows the answer.
  | { type: "solution-only" };

// A cell that has to hold a certain symbol, and the rule that says so.
export interface Deduction {
  position: CellPosition;
  symbol: PlayerSymbol;
  kind: DeductionKind;
}

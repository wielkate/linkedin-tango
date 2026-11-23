import type { Board } from "./board";
import { toCellKey, type CellKey, type CellPosition } from "./cell-position";
import { ChangeHistory } from "./history";
import { createLockedCellKeys, createStartBoard, type Puzzle } from "./puzzle";
import { findCellsBreakingRules, isSolved } from "./rules";
import { fillBoardWithSolution } from "./solution";
import { getNextCellValue } from "./symbols";
import { findHint, type Hint } from "../hints/hint";

// One puzzle being played: the board the player fills in, which cells are locked,
// the changes that can be undone and the hint shown last. It knows nothing about the page.
export class PuzzleGame {
  private readonly board: Board;
  private readonly lockedCellKeys: Set<CellKey>;
  private readonly changeHistory = new ChangeHistory();
  // Hint whose explanation; any other action clears it.
  private activeHint: Hint | null = null;

  constructor(readonly puzzle: Puzzle) {
    this.board = createStartBoard(puzzle);
    this.lockedCellKeys = createLockedCellKeys(puzzle);
  }

  getBoard(): Board {
    return this.board;
  }

  getLockedCellKeys(): Set<CellKey> {
    return this.lockedCellKeys;
  }

  getActiveHint(): Hint | null {
    return this.activeHint;
  }

  findCellsBreakingRules(): Set<CellKey> {
    return findCellsBreakingRules(this.board, this.puzzle.edgeHints);
  }

  isSolved(): boolean {
    return isSolved(this.board, this.puzzle.edgeHints);
  }

  canUndo(): boolean {
    return !this.changeHistory.isEmpty();
  }

  // Cycles the cell: empty -> cat -> dog -> empty. Locked cells do not change.
  clickCell(position: CellPosition): void {
    const isLocked = this.lockedCellKeys.has(toCellKey(position));

    if (isLocked) {
      return;
    }

    this.activeHint = null;
    const previousValue = this.board.getValue(position);
    this.changeHistory.record({ position, previousValue });
    this.board.setValue(position, getNextCellValue(previousValue));
  }

  undo(): void {
    const lastChange = this.changeHistory.takeLast();

    if (lastChange === undefined) {
      return;
    }

    this.activeHint = null;
    this.board.setValue(lastChange.position, lastChange.previousValue);
  }

  // Fills in one cell with the right symbol, locks it and keeps the explanation to show.
  revealHint(): void {
    const hint = findHint(this.board, this.puzzle);

    if (hint === null) {
      return;
    }

    this.activeHint = hint;
    this.board.setValue(hint.position, hint.correctValue);
    this.lockedCellKeys.add(toCellKey(hint.position));
    // The cell is locked now, so undo must not put the old symbol back into it.
    this.changeHistory.forgetChangesAt(hint.position);
  }

  solve(): void {
    this.activeHint = null;
    fillBoardWithSolution(this.board, this.puzzle.solution);
    this.changeHistory.clear();
  }
}

import type { CellPosition } from "./cell-position";
import type { CellValue } from "./symbols";

function areSamePosition(first: CellPosition, second: CellPosition): boolean {
  return first.row === second.row && first.column === second.column;
}

export interface CellChange {
  position: CellPosition;
  previousValue: CellValue;
}

// Remembers every cell change so the player can take them back one by one.
export class ChangeHistory {
  private readonly changes: CellChange[] = [];

  record(change: CellChange): void {
    this.changes.push(change);
  }

  takeLast(): CellChange | undefined {
    return this.changes.pop();
  }

  // Drops every change made to one cell, for a cell that can no longer be changed.
  forgetChangesAt(position: CellPosition): void {
    const keptChanges = this.changes.filter(
      (change) => !areSamePosition(change.position, position),
    );
    this.changes.length = 0;
    this.changes.push(...keptChanges);
  }

  isEmpty(): boolean {
    return this.changes.length === 0;
  }

  clear(): void {
    this.changes.length = 0;
  }
}

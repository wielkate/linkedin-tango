import { toCellKey, type CellPosition } from "./cell-position";
import type { CellValue } from "./symbols";

export interface CellChange {
  position: CellPosition;
  previousValue: CellValue;
}

// Remembers every cell change so the player can take them back one by one.
export class ChangeHistory {
  private changes: CellChange[] = [];

  record(change: CellChange): void {
    this.changes.push(change);
  }

  takeLast(): CellChange | undefined {
    return this.changes.pop();
  }

  // Drops every change made to one cell, for a cell that can no longer be changed.
  forgetChangesAt(position: CellPosition): void {
    this.changes = this.changes.filter(
      (change) => toCellKey(change.position) !== toCellKey(position),
    );
  }

  isEmpty(): boolean {
    return this.changes.length === 0;
  }

  clear(): void {
    this.changes = [];
  }
}

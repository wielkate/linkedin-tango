import type { CellPosition } from './cell-position';
import type { CellValue } from './symbols';

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

  isEmpty(): boolean {
    return this.changes.length === 0;
  }

  clear(): void {
    this.changes.length = 0;
  }
}

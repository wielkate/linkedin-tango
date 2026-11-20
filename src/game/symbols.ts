export const CAT = 0;
export const DOG = 1;
export const SYMBOL_EMOJIS = ['🐱', '🐶'] as const;

export type PlayerSymbol = typeof CAT | typeof DOG;
export type CellValue = PlayerSymbol | null;

export const ALL_SYMBOLS: PlayerSymbol[] = [CAT, DOG];

// Clicking a cell cycles through these values: empty -> cat -> dog -> empty.
const CLICK_CYCLE: CellValue[] = [null, CAT, DOG];

export function getOppositeSymbol(symbol: PlayerSymbol): PlayerSymbol {
  return symbol === CAT ? DOG : CAT;
}

export function getNextCellValue(currentValue: CellValue): CellValue {
  const currentIndex = CLICK_CYCLE.indexOf(currentValue);
  const nextIndex = (currentIndex + 1) % CLICK_CYCLE.length;
  return CLICK_CYCLE[nextIndex];
}

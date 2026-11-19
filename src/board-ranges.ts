import { BOARD_COUNT } from './puzzle';

export const BOARDS_PER_THOUSAND = 1000;
export const BOARDS_PER_HUNDRED = 100;

export interface BoardRange {
  firstBoardId: number;
  lastBoardId: number;
}

// Splits the boards firstBoardId..lastBoardId into consecutive ranges of rangeSize boards.
// The last range is shorter when the boards do not divide evenly.
export function splitIntoRanges(firstBoardId: number, lastBoardId: number, rangeSize: number): BoardRange[] {
  const ranges: BoardRange[] = [];

  for (let rangeStart = firstBoardId; rangeStart <= lastBoardId; rangeStart += rangeSize) {
    ranges.push({ firstBoardId: rangeStart, lastBoardId: Math.min(rangeStart + rangeSize - 1, lastBoardId) });
  }

  return ranges;
}

export function getAllThousands(): BoardRange[] {
  return splitIntoRanges(1, BOARD_COUNT, BOARDS_PER_THOUSAND);
}

export function getHundredsOfThousand(thousand: BoardRange): BoardRange[] {
  return splitIntoRanges(thousand.firstBoardId, thousand.lastBoardId, BOARDS_PER_HUNDRED);
}

export function findRangeContaining(ranges: BoardRange[], boardId: number): BoardRange {
  const containingRange = ranges.find((range) => boardId >= range.firstBoardId && boardId <= range.lastBoardId);
  return containingRange ?? ranges[0];
}

export function countSolvedBoardsInRange(solvedBoardIds: Set<number>, range: BoardRange): number {
  let solvedCount = 0;

  for (const boardId of solvedBoardIds) {
    if (boardId >= range.firstBoardId && boardId <= range.lastBoardId) {
      solvedCount++;
    }
  }

  return solvedCount;
}

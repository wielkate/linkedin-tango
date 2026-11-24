export const BOARDS_PER_THOUSAND = 1000;
export const BOARDS_PER_HUNDRED = 100;

export interface BoardRange {
  firstBoardId: number;
  lastBoardId: number;
}

export function getAllThousands(boardCount: number): BoardRange[] {
  return splitIntoRanges(1, boardCount, BOARDS_PER_THOUSAND);
}

export function getHundredsOfThousand(thousand: BoardRange): BoardRange[] {
  return splitIntoRanges(
    thousand.firstBoardId,
    thousand.lastBoardId,
    BOARDS_PER_HUNDRED,
  );
}

export function findRangeContaining(
  ranges: BoardRange[],
  boardId: number,
): BoardRange {
  return ranges.find((range) => isBoardInRange(range, boardId)) ?? ranges[0];
}

export function countSolvedBoardsInRange(
  solvedBoardIds: Set<number>,
  range: BoardRange,
): number {
  return [...solvedBoardIds].filter((boardId) => isBoardInRange(range, boardId))
    .length;
}

function isBoardInRange(range: BoardRange, boardId: number): boolean {
  return boardId >= range.firstBoardId && boardId <= range.lastBoardId;
}

export function splitIntoRanges(
  firstBoardId: number,
  lastBoardId: number,
  rangeSize: number,
): BoardRange[] {
  const rangeCount = Math.ceil((lastBoardId - firstBoardId + 1) / rangeSize);

  return Array.from({ length: rangeCount }, (_, rangeIndex) => {
    const rangeStart = firstBoardId + rangeIndex * rangeSize;
    return {
      firstBoardId: rangeStart,
      lastBoardId: Math.min(rangeStart + rangeSize - 1, lastBoardId),
    };
  });
}

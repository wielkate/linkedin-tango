import { describe, expect, it } from "vitest";
import {
  countSolvedBoardsInRange,
  findRangeContaining,
  getAllThousands,
  getHundredsOfThousand,
} from "./board-ranges";

const BOARD_COUNT = 11222;

describe("getAllThousands", () => {
  it("splits the boards into thousands with a shorter last range", () => {
    const thousands = getAllThousands(BOARD_COUNT);
    expect(thousands).toHaveLength(12);
    expect(thousands[0]).toEqual({ firstBoardId: 1, lastBoardId: 1000 });
    expect(thousands[1]).toEqual({ firstBoardId: 1001, lastBoardId: 2000 });
    expect(thousands[11]).toEqual({ firstBoardId: 11001, lastBoardId: 11222 });
  });

  it("gives one full range when the boards divide evenly", () => {
    expect(getAllThousands(1000)).toEqual([
      { firstBoardId: 1, lastBoardId: 1000 },
    ]);
  });

  it("gives no range when there are no boards", () => {
    expect(getAllThousands(0)).toEqual([]);
  });
});

describe("getHundredsOfThousand", () => {
  it("splits a thousand into ten hundreds", () => {
    const hundreds = getHundredsOfThousand({
      firstBoardId: 1001,
      lastBoardId: 2000,
    });
    expect(hundreds).toHaveLength(10);
    expect(hundreds[0]).toEqual({ firstBoardId: 1001, lastBoardId: 1100 });
    expect(hundreds[9]).toEqual({ firstBoardId: 1901, lastBoardId: 2000 });
  });

  it("shortens the last hundred of the last thousand", () => {
    const hundreds = getHundredsOfThousand({
      firstBoardId: 11001,
      lastBoardId: 11222,
    });
    expect(hundreds).toHaveLength(3);
    expect(hundreds[2]).toEqual({ firstBoardId: 11201, lastBoardId: 11222 });
  });
});

describe("findRangeContaining", () => {
  const thousands = getAllThousands(BOARD_COUNT);

  it("finds the range holding the board, including both edges", () => {
    expect(findRangeContaining(thousands, 1)).toBe(thousands[0]);
    expect(findRangeContaining(thousands, 1000)).toBe(thousands[0]);
    expect(findRangeContaining(thousands, 1001)).toBe(thousands[1]);
    expect(findRangeContaining(thousands, BOARD_COUNT)).toBe(thousands[11]);
  });

  it("falls back to the first range for a board outside every range", () => {
    expect(findRangeContaining(thousands, 99999)).toBe(thousands[0]);
  });
});

describe("countSolvedBoardsInRange", () => {
  const range = { firstBoardId: 101, lastBoardId: 200 };

  it("counts only the solved boards inside the range", () => {
    const solvedBoardIds = new Set([100, 101, 150, 200, 201]);
    expect(countSolvedBoardsInRange(solvedBoardIds, range)).toBe(3);
  });

  it("is zero when nothing is solved", () => {
    expect(countSolvedBoardsInRange(new Set(), range)).toBe(0);
  });
});

describe("board ranges edge cases", () => {
  it("handles a single board and a board count just over a thousand", () => {
    expect(getAllThousands(1)).toEqual([{ firstBoardId: 1, lastBoardId: 1 }]);
    expect(getAllThousands(1001)[1]).toEqual({
      firstBoardId: 1001,
      lastBoardId: 1001,
    });
  });

  it("splits a one-board thousand into one one-board hundred", () => {
    expect(
      getHundredsOfThousand({ firstBoardId: 1001, lastBoardId: 1001 }),
    ).toEqual([{ firstBoardId: 1001, lastBoardId: 1001 }]);
  });

  it("covers every board exactly once in the hundreds", () => {
    const boardIds = getAllThousands(BOARD_COUNT)
      .flatMap(getHundredsOfThousand)
      .flatMap(({ firstBoardId, lastBoardId }) =>
        Array.from(
          { length: lastBoardId - firstBoardId + 1 },
          (_, offset) => firstBoardId + offset,
        ),
      );
    expect(boardIds).toHaveLength(BOARD_COUNT);
    expect(new Set(boardIds).size).toBe(BOARD_COUNT);
  });

  it("does not count a board id below the first range", () => {
    expect(
      countSolvedBoardsInRange(new Set([0, -5]), {
        firstBoardId: 1,
        lastBoardId: 100,
      }),
    ).toBe(0);
  });
});

import { describe, expect, it } from "vitest";
import { formatBoardAddress, parseBoardAddress } from "./board-address";

const BOARD_COUNT = 11222;

describe("formatBoardAddress", () => {
  it("writes the difficulty and the board id after a #", () => {
    expect(formatBoardAddress({ difficulty: "hard", boardId: 123 })).toBe(
      "#hard/123",
    );
  });
});

describe("parseBoardAddress", () => {
  it("reads an address with or without the leading #", () => {
    const expected = { difficulty: "medium", boardId: 7 };
    expect(parseBoardAddress("#medium/7", BOARD_COUNT)).toEqual(expected);
    expect(parseBoardAddress("medium/7", BOARD_COUNT)).toEqual(expected);
  });

  it("round-trips with formatBoardAddress", () => {
    const address = { difficulty: "easy", boardId: BOARD_COUNT } as const;
    expect(parseBoardAddress(formatBoardAddress(address), BOARD_COUNT)).toEqual(
      address,
    );
  });

  it("accepts the first and the last board", () => {
    expect(parseBoardAddress("#easy/1", BOARD_COUNT)).not.toBeNull();
    expect(
      parseBoardAddress(`#easy/${BOARD_COUNT}`, BOARD_COUNT),
    ).not.toBeNull();
  });

  it("ignores board ids outside the range", () => {
    expect(parseBoardAddress("#easy/0", BOARD_COUNT)).toBeNull();
    expect(
      parseBoardAddress(`#easy/${BOARD_COUNT + 1}`, BOARD_COUNT),
    ).toBeNull();
  });

  it("ignores unknown difficulties", () => {
    expect(parseBoardAddress("#impossible/5", BOARD_COUNT)).toBeNull();
  });

  it("ignores text that is not an address", () => {
    expect(parseBoardAddress("", BOARD_COUNT)).toBeNull();
    expect(parseBoardAddress("#easy", BOARD_COUNT)).toBeNull();
    expect(parseBoardAddress("#easy/abc", BOARD_COUNT)).toBeNull();
    expect(parseBoardAddress("#easy/-3", BOARD_COUNT)).toBeNull();
  });
});

describe("parseBoardAddress edge cases", () => {
  it("rejects a difficulty written in capital letters", () => {
    expect(parseBoardAddress("#Easy/5", BOARD_COUNT)).toBeNull();
  });

  it("rejects surrounding spaces, extra segments and a trailing slash", () => {
    expect(parseBoardAddress(" #easy/5", BOARD_COUNT)).toBeNull();
    expect(parseBoardAddress("#easy/5 ", BOARD_COUNT)).toBeNull();
    expect(parseBoardAddress("#easy/5/6", BOARD_COUNT)).toBeNull();
    expect(parseBoardAddress("#easy/5/", BOARD_COUNT)).toBeNull();
  });

  it("rejects decimal and exponent board numbers", () => {
    expect(parseBoardAddress("#easy/1.5", BOARD_COUNT)).toBeNull();
    expect(parseBoardAddress("#easy/1e3", BOARD_COUNT)).toBeNull();
  });

  it("reads a board number written with leading zeros", () => {
    expect(parseBoardAddress("#easy/007", BOARD_COUNT)).toEqual({
      difficulty: "easy",
      boardId: 7,
    });
  });

  it("rejects every address when there are no boards", () => {
    expect(parseBoardAddress("#easy/1", 0)).toBeNull();
  });

  it("rejects a board number too large to be exact", () => {
    expect(
      parseBoardAddress(`#easy/${"9".repeat(30)}`, BOARD_COUNT),
    ).toBeNull();
  });
});

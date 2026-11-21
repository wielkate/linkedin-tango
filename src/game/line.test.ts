import { describe, expect, it } from "vitest";
import { BOARD_SIZE } from "./board-constants";
import { describeLine, getAllLines, getLineWindows } from "./line";

describe("getAllLines", () => {
  it("has every row and every column", () => {
    const lines = getAllLines();
    const rows = lines.filter((line) => line.direction === "row");
    const columns = lines.filter((line) => line.direction === "column");
    expect(rows).toHaveLength(BOARD_SIZE);
    expect(columns).toHaveLength(BOARD_SIZE);
  });

  it("gives every line a full set of cells", () => {
    for (const line of getAllLines()) {
      expect(line.positions).toHaveLength(BOARD_SIZE);
    }
  });

  it("builds a row from cells that share the row", () => {
    const row = getAllLines().find(
      (line) => line.direction === "row" && line.index === 3,
    );
    expect(row?.positions.every((position) => position.row === 3)).toBe(true);
    expect(row?.positions.map((position) => position.column)).toEqual([
      0, 1, 2, 3, 4, 5,
    ]);
  });

  it("builds a column from cells that share the column", () => {
    const column = getAllLines().find(
      (line) => line.direction === "column" && line.index === 4,
    );
    expect(column?.positions.every((position) => position.column === 4)).toBe(
      true,
    );
    expect(column?.positions.map((position) => position.row)).toEqual([
      0, 1, 2, 3, 4, 5,
    ]);
  });
});

describe("getLineWindows", () => {
  const [firstLine] = getAllLines();

  it("slides over the line one cell at a time", () => {
    const windows = getLineWindows(firstLine, 3);
    expect(windows).toHaveLength(BOARD_SIZE - 2);
    expect(windows[0].map((position) => position.column)).toEqual([0, 1, 2]);
    expect(windows[3].map((position) => position.column)).toEqual([3, 4, 5]);
  });

  it("gives one window when it is as long as the line", () => {
    expect(getLineWindows(firstLine, BOARD_SIZE)).toHaveLength(1);
  });

  it("gives no window when it is longer than the line", () => {
    expect(getLineWindows(firstLine, BOARD_SIZE + 1)).toHaveLength(0);
  });
});

describe("describeLine", () => {
  it("counts from 1 as the player counts", () => {
    const [firstRow, firstColumn] = getAllLines();
    expect(describeLine(firstRow)).toBe("row 1");
    expect(describeLine(firstColumn)).toBe("column 1");
  });
});

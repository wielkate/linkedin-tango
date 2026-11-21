import { describe, expect, it } from "vitest";
import { ChangeHistory, type CellChange } from "./history";
import { CAT } from "./symbols";

const firstChange: CellChange = {
  position: { row: 0, column: 0 },
  previousValue: null,
};
const secondChange: CellChange = {
  position: { row: 1, column: 2 },
  previousValue: CAT,
};

describe("ChangeHistory", () => {
  it("starts empty", () => {
    const history = new ChangeHistory();
    expect(history.isEmpty()).toBe(true);
    expect(history.takeLast()).toBeUndefined();
  });

  it("gives back the changes newest first", () => {
    const history = new ChangeHistory();
    history.record(firstChange);
    history.record(secondChange);

    expect(history.isEmpty()).toBe(false);
    expect(history.takeLast()).toBe(secondChange);
    expect(history.takeLast()).toBe(firstChange);
    expect(history.isEmpty()).toBe(true);
  });

  it("forgets everything when cleared", () => {
    const history = new ChangeHistory();
    history.record(firstChange);
    history.clear();

    expect(history.isEmpty()).toBe(true);
    expect(history.takeLast()).toBeUndefined();
  });
});

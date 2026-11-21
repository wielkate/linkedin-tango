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

describe("ChangeHistory.forgetChangesAt", () => {
  it("drops every change of one cell and keeps the others in order", () => {
    const history = new ChangeHistory();
    const otherChange: CellChange = {
      position: { row: 3, column: 3 },
      previousValue: null,
    };
    history.record(firstChange);
    history.record(otherChange);
    history.record({ ...firstChange, previousValue: CAT });

    history.forgetChangesAt(firstChange.position);

    expect(history.takeLast()).toBe(otherChange);
    expect(history.isEmpty()).toBe(true);
  });

  it("does nothing for a cell without changes", () => {
    const history = new ChangeHistory();
    history.record(firstChange);
    history.forgetChangesAt({ row: 5, column: 5 });
    expect(history.takeLast()).toBe(firstChange);
  });

  it("does not mix up a cell with its mirror", () => {
    const history = new ChangeHistory();
    history.record(secondChange);
    history.forgetChangesAt({ row: 2, column: 1 });
    expect(history.isEmpty()).toBe(false);
  });
});

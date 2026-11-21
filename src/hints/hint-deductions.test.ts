import { describe, expect, it } from "vitest";
import { EdgeHint } from "../game/edge-hint";
import { CAT, DOG } from "../game/symbols";
import { createBoardWithTopRows } from "../test-support/create-board";
import { findSimpleDeductions } from "./hint-deductions";

function findDeductionAt(
  deductions: ReturnType<typeof findSimpleDeductions>,
  row: number,
  column: number,
) {
  return deductions.find(
    ({ position }) => position.row === row && position.column === column,
  );
}

describe("findSimpleDeductions", () => {
  it("finds nothing on an empty board", () => {
    expect(findSimpleDeductions(createBoardWithTopRows([]), [])).toEqual([]);
  });

  describe("edge hints", () => {
    const sameHint = new EdgeHint(
      { row: 0, column: 0 },
      { row: 0, column: 1 },
      "same",
    );
    const differentHint = new EdgeHint(
      { row: 0, column: 0 },
      { row: 0, column: 1 },
      "different",
    );

    it("copies the known cell over a same hint", () => {
      const deductions = findSimpleDeductions(createBoardWithTopRows(["C"]), [
        sameHint,
      ]);
      expect(findDeductionAt(deductions, 0, 1)).toMatchObject({
        symbol: CAT,
        kind: { type: "edge-hint", hintType: "same" },
      });
    });

    it("flips the known cell over a different hint", () => {
      const deductions = findSimpleDeductions(createBoardWithTopRows(["C"]), [
        differentHint,
      ]);
      expect(findDeductionAt(deductions, 0, 1)).toMatchObject({
        symbol: DOG,
        kind: { type: "edge-hint", hintType: "different" },
      });
    });

    it("also works when only the second cell is known", () => {
      const deductions = findSimpleDeductions(createBoardWithTopRows([".D"]), [
        differentHint,
      ]);
      expect(findDeductionAt(deductions, 0, 0)).toMatchObject({
        symbol: CAT,
        kind: { type: "edge-hint", partner: { row: 0, column: 1 } },
      });
    });

    it("says nothing while both cells are empty or both are filled", () => {
      const findEdgeHintDeductions = (rowTexts: string[]) =>
        findSimpleDeductions(createBoardWithTopRows(rowTexts), [
          sameHint,
        ]).filter(({ kind }) => kind.type === "edge-hint");

      expect(findEdgeHintDeductions([])).toEqual([]);
      expect(findEdgeHintDeductions(["CC"])).toEqual([]);
    });
  });

  describe("neighbouring pair", () => {
    it("puts the other symbol after a pair", () => {
      const deductions = findSimpleDeductions(
        createBoardWithTopRows(["CC...."]),
        [],
      );
      expect(findDeductionAt(deductions, 0, 2)).toMatchObject({
        symbol: DOG,
        kind: { type: "neighbouring-pair" },
      });
    });

    it("puts the other symbol before a pair", () => {
      const deductions = findSimpleDeductions(
        createBoardWithTopRows(["..DD.."]),
        [],
      );
      expect(findDeductionAt(deductions, 0, 1)).toMatchObject({
        symbol: CAT,
        kind: { type: "neighbouring-pair" },
      });
    });

    it("works down a column too", () => {
      const deductions = findSimpleDeductions(
        createBoardWithTopRows(["D", "D"]),
        [],
      );
      expect(findDeductionAt(deductions, 2, 0)).toMatchObject({
        symbol: CAT,
        kind: { type: "neighbouring-pair" },
      });
    });
  });

  describe("sandwich", () => {
    it("puts the other symbol between two identical symbols", () => {
      const deductions = findSimpleDeductions(
        createBoardWithTopRows(["C.C..."]),
        [],
      );
      expect(findDeductionAt(deductions, 0, 1)).toMatchObject({
        symbol: DOG,
        kind: { type: "sandwiched", endSymbol: CAT },
      });
    });

    it("ignores a sandwich whose ends differ", () => {
      const deductions = findSimpleDeductions(
        createBoardWithTopRows(["C.D..."]),
        [],
      );
      expect(findDeductionAt(deductions, 0, 1)).toBeUndefined();
    });
  });

  describe("complete line", () => {
    it("fills the rest of a line that holds three of one symbol", () => {
      const deductions = findSimpleDeductions(
        createBoardWithTopRows(["C.C.C."]),
        [],
      );
      const completeLineDeductions = deductions.filter(
        ({ kind }) => kind.type === "line-complete",
      );
      expect(
        completeLineDeductions.map(({ position }) => position.column),
      ).toEqual([1, 3, 5]);
      expect(completeLineDeductions.every(({ symbol }) => symbol === DOG)).toBe(
        true,
      );
    });

    it("waits while a symbol is not yet complete", () => {
      const deductions = findSimpleDeductions(
        createBoardWithTopRows(["C.D.C."]),
        [],
      );
      expect(deductions.some(({ kind }) => kind.type === "line-complete")).toBe(
        false,
      );
    });
  });

  it("lists the easier rules first", () => {
    const deductions = findSimpleDeductions(
      createBoardWithTopRows(["CC.C.."]),
      [new EdgeHint({ row: 5, column: 0 }, { row: 5, column: 1 }, "same")],
    );
    const kindOrder = deductions.map(({ kind }) => kind.type);
    expect(kindOrder.indexOf("neighbouring-pair")).toBeLessThan(
      kindOrder.indexOf("sandwiched"),
    );
  });
});

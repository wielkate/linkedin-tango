import { describe, expect, it } from "vitest";
import { getAllLines } from "../game/line";
import { CAT, DOG } from "../game/symbols";
import type { Deduction } from "./deduction";
import { explainDeduction } from "./hint-explanation";

const position = { row: 0, column: 2 };
const partner = { row: 0, column: 1 };

describe("explainDeduction", () => {
  it("explains a same hint and points at the partner cell", () => {
    const deduction: Deduction = {
      position,
      symbol: CAT,
      kind: { type: "edge-hint", hintType: "same", partner },
    };
    const { explanation, relatedPositions } = explainDeduction(deduction);
    expect(explanation).toContain("same symbol");
    expect(explanation).toContain("🐱");
    expect(relatedPositions).toEqual([partner]);
  });

  it("explains a different hint with the answer symbol", () => {
    const deduction: Deduction = {
      position,
      symbol: DOG,
      kind: { type: "edge-hint", hintType: "different", partner },
    };
    const { explanation } = explainDeduction(deduction);
    expect(explanation).toContain("different symbols");
    expect(explanation).toContain("🐶");
  });

  it("points at the pair for a neighbouring pair", () => {
    const pair = [
      { row: 0, column: 0 },
      { row: 0, column: 1 },
    ];
    const { explanation, relatedPositions } = explainDeduction({
      position,
      symbol: DOG,
      kind: { type: "neighbouring-pair", pair },
    });
    expect(explanation).toContain("🐶");
    expect(relatedPositions).toEqual(pair);
  });

  it("names the line and the end symbols for a sandwich", () => {
    const firstRow = getAllLines()[0];
    const ends = [
      { row: 0, column: 0 },
      { row: 0, column: 2 },
    ];
    const { explanation, relatedPositions } = explainDeduction({
      position: { row: 0, column: 1 },
      symbol: DOG,
      kind: { type: "sandwiched", line: firstRow, ends, endSymbol: CAT },
    });
    expect(explanation).toContain("row 1");
    expect(explanation).toContain("🐱");
    expect(explanation).toContain("must be 🐶");
    expect(relatedPositions).toEqual(ends);
  });

  it("points at the completed cells for a complete line", () => {
    const completedPositions = [
      { row: 0, column: 0 },
      { row: 0, column: 2 },
      { row: 0, column: 4 },
    ];
    const { explanation, relatedPositions } = explainDeduction({
      position,
      symbol: DOG,
      kind: { type: "line-complete", completedPositions },
    });
    expect(explanation).toContain("three of each symbol");
    expect(relatedPositions).toEqual(completedPositions);
  });

  it("names the rejected symbol for a contradiction", () => {
    const { explanation, relatedPositions } = explainDeduction({
      position,
      symbol: DOG,
      kind: { type: "contradiction", rejectedSymbol: CAT },
    });
    expect(explanation).toContain("With a 🐱 in this cell");
    expect(explanation).toContain("must be 🐶");
    expect(relatedPositions).toEqual([]);
  });

  it("admits it cannot show the reasoning for a solution-only hint", () => {
    const { explanation, relatedPositions } = explainDeduction({
      position,
      symbol: CAT,
      kind: { type: "solution-only" },
    });
    expect(explanation).toContain("longer chain of reasoning");
    expect(explanation).toContain("🐱");
    expect(relatedPositions).toEqual([]);
  });
});

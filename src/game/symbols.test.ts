import { describe, expect, it } from "vitest";
import { CAT, DOG, getNextCellValue, getOppositeSymbol } from "./symbols";

describe("getOppositeSymbol", () => {
  it("returns the dog for the cat and the cat for the dog", () => {
    expect(getOppositeSymbol(CAT)).toBe(DOG);
    expect(getOppositeSymbol(DOG)).toBe(CAT);
  });
});

describe("getNextCellValue", () => {
  it("cycles empty, cat, dog, empty", () => {
    expect(getNextCellValue(null)).toBe(CAT);
    expect(getNextCellValue(CAT)).toBe(DOG);
    expect(getNextCellValue(DOG)).toBeNull();
  });
});

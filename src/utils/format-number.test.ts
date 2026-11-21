import { describe, expect, it } from "vitest";
import { formatNumberWithSpaces } from "./format-number";

const NON_BREAKING_SPACE = " ";

describe("formatNumberWithSpaces", () => {
  it("leaves numbers below one thousand unchanged", () => {
    expect(formatNumberWithSpaces(0)).toBe("0");
    expect(formatNumberWithSpaces(999)).toBe("999");
  });

  it("separates thousands with a non-breaking space", () => {
    expect(formatNumberWithSpaces(1000)).toBe(`1${NON_BREAKING_SPACE}000`);
    expect(formatNumberWithSpaces(11222)).toBe(`11${NON_BREAKING_SPACE}222`);
  });

  it("separates every group of three digits", () => {
    expect(formatNumberWithSpaces(1234567)).toBe(
      `1${NON_BREAKING_SPACE}234${NON_BREAKING_SPACE}567`,
    );
  });
});

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

describe("formatNumberWithSpaces edge cases", () => {
  it("handles the boundaries between group sizes", () => {
    expect(formatNumberWithSpaces(99999)).toBe(`99${NON_BREAKING_SPACE}999`);
    expect(formatNumberWithSpaces(100000)).toBe(`100${NON_BREAKING_SPACE}000`);
  });

  it("does not put a space after a minus sign", () => {
    expect(formatNumberWithSpaces(-1000)).toBe(`-1${NON_BREAKING_SPACE}000`);
    expect(formatNumberWithSpaces(-999)).toBe("-999");
  });
});

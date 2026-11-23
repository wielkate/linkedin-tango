import { describe, expect, it } from "vitest";
import { pickWeightedItem } from "./weighted-choice";

const VISITS = [
  { name: "often", weight: 4 },
  { name: "rarely", weight: 1 },
];

describe("pickWeightedItem", () => {
  it("picks the first item for the lowest random number", () => {
    expect(pickWeightedItem(() => 0, VISITS, (v) => v.weight).name).toBe(
      "often",
    );
  });

  it("picks the last item for the highest random number", () => {
    expect(pickWeightedItem(() => 0.999, VISITS, (v) => v.weight).name).toBe(
      "rarely",
    );
  });

  it("gives each item a share of the random numbers that matches its weight", () => {
    const picks = Array.from({ length: 100 }, (_, index) =>
      pickWeightedItem(() => index / 100, VISITS, (v) => v.weight),
    );
    const rarelyCount = picks.filter((visit) => visit.name === "rarely").length;

    expect(rarelyCount).toBe(20);
  });
});

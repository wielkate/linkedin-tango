import { describe, expect, it } from "vitest";
import { planPawPrintTrail } from "./paw-print-trail-plan";
import type { RandomNumberGenerator } from "./pet-peek-plan";

const VIEWPORT = { widthPixels: 1440, heightPixels: 900 };

function createSeededRandom(seed: number): RandomNumberGenerator {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function planManyTrails() {
  const random = createSeededRandom(11);
  return Array.from({ length: 200 }, () => planPawPrintTrail(random, VIEWPORT));
}

describe("planPawPrintTrail", () => {
  it("walks at least a few steps across the screen", () => {
    for (const trail of planManyTrails()) {
      expect(trail.prints.length).toBeGreaterThanOrEqual(8);
      expect(trail.prints.length).toBeLessThanOrEqual(30);
    }
  });

  it("brings the prints of cats and of dogs", () => {
    const species = new Set(planManyTrails().map((trail) => trail.species));

    expect([...species].sort()).toEqual(["cat", "dog"]);
  });

  it("shows the prints one after another", () => {
    for (const trail of planManyTrails()) {
      const delays = trail.prints.map((print) => print.appearAfterMilliseconds);

      expect(delays).toEqual([...delays].sort((first, second) => first - second));
      expect(new Set(delays).size).toBe(delays.length);
    }
  });

  it("ends when the last print has faded away", () => {
    for (const trail of planManyTrails()) {
      const lastDelay = trail.prints[trail.prints.length - 1].appearAfterMilliseconds;

      expect(trail.totalMilliseconds).toBe(lastDelay + trail.printLifetimeMilliseconds);
    }
  });

  it("puts left and right prints in turn on both sides of the walking line", () => {
    const trail = planPawPrintTrail(() => 0, VIEWPORT);
    const [firstPrint, secondPrint, thirdPrint] = trail.prints;
    const walksRightAlongTheTop = firstPrint.rotationDegrees === 90;

    expect(walksRightAlongTheTop).toBe(true);
    expect(firstPrint.yPixels).toBeLessThan(secondPrint.yPixels);
    expect(thirdPrint.yPixels).toBe(firstPrint.yPixels);
  });

  it("turns the toes towards the way the animal walks", () => {
    const trail = planPawPrintTrail(() => 0, VIEWPORT);
    const nextToLastPrint = trail.prints[trail.prints.length - 2];
    const lastPrint = trail.prints[trail.prints.length - 1];

    expect(lastPrint.xPixels).toBeGreaterThan(nextToLastPrint.xPixels);
    expect(lastPrint.rotationDegrees).toBeCloseTo(trail.prints[0].rotationDegrees);
  });

  it("starts outside the screen, so the animal walks in from the side", () => {
    const trail = planPawPrintTrail(() => 0, VIEWPORT);

    expect(trail.prints[0].xPixels).toBeLessThan(0);
  });
});

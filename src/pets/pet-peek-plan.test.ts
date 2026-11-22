import { describe, expect, it } from "vitest";
import { PET_BREEDS } from "./pet-breeds";
import {
  SCREEN_EDGES,
  planPeek,
  type RandomNumberGenerator,
} from "./pet-peek-plan";

const DESKTOP_VIEWPORT = { widthPixels: 1440, heightPixels: 900 };
const PHONE_VIEWPORT = { widthPixels: 360, heightPixels: 640 };

function createSeededRandom(seed: number): RandomNumberGenerator {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function planManyPeeks(viewport: typeof DESKTOP_VIEWPORT) {
  const random = createSeededRandom(7);
  return Array.from({ length: 500 }, () =>
    planPeek(random, viewport, PET_BREEDS),
  );
}

describe("planPeek", () => {
  it("visits every edge of the screen", () => {
    const edges = new Set(planManyPeeks(DESKTOP_VIEWPORT).map((plan) => plan.edge));

    expect([...edges].sort()).toEqual([...SCREEN_EDGES].sort());
  });

  it("brings both heads and reaching paws", () => {
    const appearances = new Set(
      planManyPeeks(DESKTOP_VIEWPORT).map((plan) => plan.appearance),
    );

    expect([...appearances].sort()).toEqual(["head", "paw"]);
  });

  it("brings both cats and dogs", () => {
    const species = new Set(
      planManyPeeks(DESKTOP_VIEWPORT).map((plan) => plan.breed.species),
    );

    expect([...species].sort()).toEqual(["cat", "dog"]);
  });

  it("uses many different sizes", () => {
    const sizes = new Set(
      planManyPeeks(DESKTOP_VIEWPORT).map((plan) => plan.sizePixels),
    );

    expect(sizes.size).toBeGreaterThan(50);
  });

  it("keeps the size between 90 and 260 pixels on a big screen", () => {
    for (const plan of planManyPeeks(DESKTOP_VIEWPORT)) {
      expect(plan.sizePixels).toBeGreaterThanOrEqual(90);
      expect(plan.sizePixels).toBeLessThanOrEqual(260);
    }
  });

  it("keeps animals under half of the smaller side of a phone screen", () => {
    for (const plan of planManyPeeks(PHONE_VIEWPORT)) {
      expect(plan.sizePixels).toBeLessThanOrEqual(PHONE_VIEWPORT.widthPixels * 0.45);
    }
  });

  it("keeps the animal fully inside the edge", () => {
    for (const plan of planManyPeeks(DESKTOP_VIEWPORT)) {
      expect(plan.edgePositionFraction).toBeGreaterThanOrEqual(0);
      expect(plan.edgePositionFraction).toBeLessThan(1);
    }
  });

  it("shows enough of a head to see the eyes, and never all of it", () => {
    const headPlans = planManyPeeks(DESKTOP_VIEWPORT).filter(
      (plan) => plan.appearance === "head",
    );

    for (const plan of headPlans) {
      expect(plan.shownFraction).toBeGreaterThanOrEqual(0.58);
      expect(plan.shownFraction).toBeLessThanOrEqual(0.92);
    }
  });

  it("looks at three to five places that the pupils can reach", () => {
    for (const plan of planManyPeeks(DESKTOP_VIEWPORT)) {
      expect(plan.lookTargets.length).toBeGreaterThanOrEqual(3);
      expect(plan.lookTargets.length).toBeLessThanOrEqual(5);

      for (const lookTarget of plan.lookTargets) {
        expect(Math.abs(lookTarget.horizontal)).toBeLessThanOrEqual(1);
        expect(Math.abs(lookTarget.vertical)).toBeLessThanOrEqual(0.8);
        expect(lookTarget.pauseMilliseconds).toBeGreaterThanOrEqual(600);
        expect(lookTarget.pauseMilliseconds).toBeLessThanOrEqual(1400);
      }
    }
  });

  it("plans the same visit for the same random numbers", () => {
    const firstPlan = planPeek(createSeededRandom(3), DESKTOP_VIEWPORT, PET_BREEDS);
    const secondPlan = planPeek(createSeededRandom(3), DESKTOP_VIEWPORT, PET_BREEDS);

    expect(firstPlan).toEqual(secondPlan);
  });
});

import { describe, expect, it } from "vitest";
import { PET_BREEDS } from "./pet-breeds";
import {
  SCREEN_EDGES,
  calculateFreeSpaceByEdge,
  planPeek,
  type FreeSpaceByEdge,
  type PeekPlan,
  type RandomNumberGenerator,
} from "./pet-peek-plan";

const DESKTOP_VIEWPORT = { widthPixels: 1440, heightPixels: 900 };
const PHONE_VIEWPORT = { widthPixels: 360, heightPixels: 640 };
const ROOM_ON_EVERY_EDGE: FreeSpaceByEdge = {
  top: 600,
  right: 600,
  bottom: 600,
  left: 600,
};

function createSeededRandom(seed: number): RandomNumberGenerator {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function planManyPeeks(
  viewport: typeof DESKTOP_VIEWPORT,
  freeSpaceByEdge: FreeSpaceByEdge = ROOM_ON_EVERY_EDGE,
): PeekPlan[] {
  const random = createSeededRandom(7);
  const plans = Array.from({ length: 500 }, () =>
    planPeek(random, viewport, PET_BREEDS, freeSpaceByEdge),
  );

  return plans.filter((plan): plan is PeekPlan => plan !== null);
}

describe("planPeek", () => {
  it("visits every edge of the screen when there is room on all of them", () => {
    const edges = new Set(
      planManyPeeks(DESKTOP_VIEWPORT).map((plan) => plan.edge),
    );

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

  it("keeps the size between 110 and 480 pixels on a big screen", () => {
    for (const plan of planManyPeeks(DESKTOP_VIEWPORT)) {
      expect(plan.sizePixels).toBeGreaterThanOrEqual(110);
      expect(plan.sizePixels).toBeLessThanOrEqual(480);
    }
  });

  it("keeps animals under 55% of the smaller side of a phone screen", () => {
    for (const plan of planManyPeeks(PHONE_VIEWPORT)) {
      expect(plan.sizePixels).toBeLessThanOrEqual(
        PHONE_VIEWPORT.widthPixels * 0.55,
      );
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
    const firstPlan = planPeek(
      createSeededRandom(3),
      DESKTOP_VIEWPORT,
      PET_BREEDS,
      ROOM_ON_EVERY_EDGE,
    );
    const secondPlan = planPeek(
      createSeededRandom(3),
      DESKTOP_VIEWPORT,
      PET_BREEDS,
      ROOM_ON_EVERY_EDGE,
    );

    expect(firstPlan).toEqual(secondPlan);
  });
});

describe("planPeek with a board in the way", () => {
  const BOARD_FILLS_THE_WIDTH: FreeSpaceByEdge = {
    top: 200,
    right: 10,
    bottom: 200,
    left: 10,
  };

  it("never uses an edge that has no room for an animal", () => {
    const edges = new Set(
      planManyPeeks(PHONE_VIEWPORT, BOARD_FILLS_THE_WIDTH).map(
        (plan) => plan.edge,
      ),
    );

    expect([...edges].sort()).toEqual(["bottom", "top"]);
  });

  it("comes only from the top and the bottom on a phone, even with room at the sides", () => {
    const edges = new Set(
      planManyPeeks(PHONE_VIEWPORT, ROOM_ON_EVERY_EDGE).map(
        (plan) => plan.edge,
      ),
    );

    expect([...edges].sort()).toEqual(["bottom", "top"]);
  });

  it("keeps the part of the animal that shows inside the free space", () => {
    const freeSpaceByEdge: FreeSpaceByEdge = {
      top: 150,
      right: 90,
      bottom: 220,
      left: 300,
    };

    for (const plan of planManyPeeks(DESKTOP_VIEWPORT, freeSpaceByEdge)) {
      const shownPixels = plan.sizePixels * plan.shownFraction;

      expect(shownPixels).toBeLessThanOrEqual(freeSpaceByEdge[plan.edge]);
    }
  });

  it("plans no visit when the board leaves no room on any edge", () => {
    const noRoom: FreeSpaceByEdge = { top: 0, right: 0, bottom: 0, left: 0 };

    const plan = planPeek(
      createSeededRandom(1),
      PHONE_VIEWPORT,
      PET_BREEDS,
      noRoom,
    );

    expect(plan).toBeNull();
  });
});

describe("calculateFreeSpaceByEdge", () => {
  const viewport = { widthPixels: 1000, heightPixels: 800 };

  it("measures the room between each edge of the screen and the board", () => {
    const boardBounds = {
      leftPixels: 250,
      topPixels: 100,
      rightPixels: 750,
      bottomPixels: 600,
    };

    expect(calculateFreeSpaceByEdge(viewport, boardBounds)).toEqual({
      top: 100,
      right: 250,
      bottom: 200,
      left: 250,
    });
  });

  it("never reports less than no room, when the board reaches past an edge", () => {
    const boardBounds = {
      leftPixels: -5,
      topPixels: -40,
      rightPixels: 1010,
      bottomPixels: 900,
    };

    expect(calculateFreeSpaceByEdge(viewport, boardBounds)).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });
});

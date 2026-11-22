import type { PetBreed } from "./pet-breed";

// Returns a number from 0 up to, but not including, 1, like Math.random.
export type RandomNumberGenerator = () => number;

export type ScreenEdge = "top" | "right" | "bottom" | "left";

// A "head" peeks over the edge with two paws on it. A "paw" only reaches in and waves.
export type PetAppearance = "head" | "paw";

export interface Viewport {
  widthPixels: number;
  heightPixels: number;
}

// Where the pupils go: -1 is as far left (or up) as they can, 1 as far right (or down).
export interface LookTarget {
  horizontal: number;
  vertical: number;
  pauseMilliseconds: number;
}

export interface PeekPlan {
  breed: PetBreed;
  appearance: PetAppearance;
  edge: ScreenEdge;
  sizePixels: number;
  // Where along the edge the animal sits: 0 is the start of the edge, 1 is the end.
  edgePositionFraction: number;
  // How much of the picture shows above the edge, from 0 to 1.
  shownFraction: number;
  lookTargets: LookTarget[];
}

export const SCREEN_EDGES: ScreenEdge[] = ["top", "right", "bottom", "left"];

// The edge a picture rests on is the bottom of the picture, so each edge turns the picture this far.
export const ROTATION_DEGREES_BY_EDGE: Record<ScreenEdge, number> = {
  bottom: 0,
  left: 90,
  top: 180,
  right: 270,
};

const MIN_SIZE_PIXELS = 90;
const MAX_SIZE_PIXELS = 260;
const LARGEST_SHARE_OF_SMALLER_SIDE = 0.45;
const PAW_ONLY_CHANCE = 0.25;
const SHOWN_FRACTION_RANGE_BY_APPEARANCE: Record<
  PetAppearance,
  [number, number]
> = {
  head: [0.58, 0.92],
  paw: [0.72, 0.95],
};
const MIN_LOOK_TARGET_COUNT = 3;
const MAX_LOOK_TARGET_COUNT = 5;
const MAX_VERTICAL_LOOK = 0.8;
const MIN_PAUSE_MILLISECONDS = 600;
const MAX_PAUSE_MILLISECONDS = 1400;

export function pickBetween(
  random: RandomNumberGenerator,
  minimum: number,
  maximum: number,
): number {
  return minimum + random() * (maximum - minimum);
}

export function pickItem<Item>(
  random: RandomNumberGenerator,
  items: readonly Item[],
): Item {
  return items[Math.floor(random() * items.length)];
}

// Decides everything about one visit: who comes, from which edge, how big and where they look.
export function planPeek(
  random: RandomNumberGenerator,
  viewport: Viewport,
  breeds: readonly PetBreed[],
): PeekPlan {
  const appearance: PetAppearance =
    random() < PAW_ONLY_CHANCE ? "paw" : "head";
  const [minimumShown, maximumShown] =
    SHOWN_FRACTION_RANGE_BY_APPEARANCE[appearance];

  return {
    breed: pickItem(random, breeds),
    appearance,
    edge: pickItem(random, SCREEN_EDGES),
    sizePixels: pickSizePixels(random, viewport),
    edgePositionFraction: random(),
    shownFraction: pickBetween(random, minimumShown, maximumShown),
    lookTargets: planLookTargets(random),
  };
}

// A small phone gets smaller animals, so one never covers most of the screen.
function pickSizePixels(
  random: RandomNumberGenerator,
  viewport: Viewport,
): number {
  const smallerSidePixels = Math.min(
    viewport.widthPixels,
    viewport.heightPixels,
  );
  const largestSizePixels = Math.min(
    MAX_SIZE_PIXELS,
    smallerSidePixels * LARGEST_SHARE_OF_SMALLER_SIDE,
  );
  const smallestSizePixels = Math.min(MIN_SIZE_PIXELS, largestSizePixels);

  return Math.round(
    pickBetween(random, smallestSizePixels, largestSizePixels),
  );
}

function planLookTargets(random: RandomNumberGenerator): LookTarget[] {
  const countRange = MAX_LOOK_TARGET_COUNT - MIN_LOOK_TARGET_COUNT + 1;
  const count = MIN_LOOK_TARGET_COUNT + Math.floor(random() * countRange);

  return Array.from({ length: count }, () => ({
    horizontal: pickBetween(random, -1, 1),
    vertical: pickBetween(random, -MAX_VERTICAL_LOOK, MAX_VERTICAL_LOOK),
    pauseMilliseconds: Math.round(
      pickBetween(random, MIN_PAUSE_MILLISECONDS, MAX_PAUSE_MILLISECONDS),
    ),
  }));
}

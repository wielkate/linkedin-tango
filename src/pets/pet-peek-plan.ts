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

// On a phone the animals come only from the top and the bottom: a head at the side of a narrow
// screen would sit over the board. Same width as the phone layout in style.css.
const PHONE_MAX_WIDTH_PIXELS = 540;
const PHONE_SCREEN_EDGES: ScreenEdge[] = ["top", "bottom"];

// The edge a picture rests on is the bottom of the picture, so each edge turns the picture this far.
export const ROTATION_DEGREES_BY_EDGE: Record<ScreenEdge, number> = {
  bottom: 0,
  left: 90,
  top: 180,
  right: 270,
};

const MIN_SIZE_PIXELS = 110;
const MAX_SIZE_PIXELS = 480;
const LARGEST_SHARE_OF_SMALLER_SIDE = 0.55;
// The animal slides in a little further than its resting place before it settles.
const ARRIVAL_OVERSHOOT_FACTOR = 1.1;
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

// How much room the board leaves between itself and each edge of the screen, in pixels.
// An animal on an edge must fit in that room, or the board would hide it.
export type FreeSpaceByEdge = Record<ScreenEdge, number>;

// Where the board is on the screen.
export interface BoardBounds {
  leftPixels: number;
  topPixels: number;
  rightPixels: number;
  bottomPixels: number;
}

export function calculateFreeSpaceByEdge(
  viewport: Viewport,
  boardBounds: BoardBounds,
): FreeSpaceByEdge {
  return {
    top: Math.max(0, boardBounds.topPixels),
    right: Math.max(0, viewport.widthPixels - boardBounds.rightPixels),
    bottom: Math.max(0, viewport.heightPixels - boardBounds.bottomPixels),
    left: Math.max(0, boardBounds.leftPixels),
  };
}

// Decides everything about one visit: who comes, from which edge, how big and where they look.
// An edge is used only when the animal fits between that edge and the board. On a phone only the
// top and the bottom are used, even when the board leaves room at the sides.
// Returns null when no edge has enough room.
export function planPeek(
  random: RandomNumberGenerator,
  viewport: Viewport,
  breeds: readonly PetBreed[],
  freeSpaceByEdge: FreeSpaceByEdge,
): PeekPlan | null {
  const appearance: PetAppearance = random() < PAW_ONLY_CHANCE ? "paw" : "head";
  const [minimumShown, maximumShown] =
    SHOWN_FRACTION_RANGE_BY_APPEARANCE[appearance];
  const shownFraction = pickBetween(random, minimumShown, maximumShown);
  const roomyEdges = listEdgesAnimalsMayUse(viewport).filter(
    (edge) =>
      calculateLargestSizePixels(
        viewport,
        freeSpaceByEdge[edge],
        shownFraction,
      ) >= MIN_SIZE_PIXELS,
  );

  if (roomyEdges.length === 0) {
    return null;
  }

  const edge = pickItem(random, roomyEdges);
  const largestSizePixels = calculateLargestSizePixels(
    viewport,
    freeSpaceByEdge[edge],
    shownFraction,
  );

  return {
    breed: pickItem(random, breeds),
    appearance,
    edge,
    sizePixels: Math.round(
      pickBetween(random, MIN_SIZE_PIXELS, largestSizePixels),
    ),
    edgePositionFraction: random(),
    shownFraction,
    lookTargets: planLookTargets(random),
  };
}

function listEdgesAnimalsMayUse(viewport: Viewport): ScreenEdge[] {
  const isPhone = viewport.widthPixels <= PHONE_MAX_WIDTH_PIXELS;

  return isPhone ? PHONE_SCREEN_EDGES : SCREEN_EDGES;
}

// A small phone gets smaller animals, so one never covers most of the screen,
// and the part that shows must fit in the free space between the edge and the board.
function calculateLargestSizePixels(
  viewport: Viewport,
  freeSpacePixels: number,
  shownFraction: number,
): number {
  const smallerSidePixels = Math.min(
    viewport.widthPixels,
    viewport.heightPixels,
  );
  const largestSizeThatFitsPixels =
    freeSpacePixels / (shownFraction * ARRIVAL_OVERSHOOT_FACTOR);

  return Math.min(
    MAX_SIZE_PIXELS,
    smallerSidePixels * LARGEST_SHARE_OF_SMALLER_SIDE,
    largestSizeThatFitsPixels,
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

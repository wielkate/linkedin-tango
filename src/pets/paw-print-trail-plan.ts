import type { PetSpecies } from "./pet-breed";
import {
  pickBetween,
  type RandomNumberGenerator,
  type Viewport,
} from "./pet-peek-plan";

interface Point {
  xPixels: number;
  yPixels: number;
}

export interface PawPrint {
  // The centre of the print.
  xPixels: number;
  yPixels: number;
  // 0 points the toes up. The toes point where the animal walks.
  rotationDegrees: number;
  appearAfterMilliseconds: number;
}

export interface PawPrintTrail {
  species: PetSpecies;
  sizePixels: number;
  prints: PawPrint[];
  // How long each print stays before it has faded away.
  printLifetimeMilliseconds: number;
  // From the start of the walk until the last print has faded away.
  totalMilliseconds: number;
}

export const PRINT_LIFETIME_MILLISECONDS = 4000;

const MIN_SIZE_PIXELS = 24;
const MAX_SIZE_PIXELS = 46;
// The distance between two prints of the same side, as a multiple of the print size.
const STRIDE_IN_PRINT_SIZES = 1.9;
// How far the left and right prints sit from the walking line, as a multiple of the print size.
const SIDE_OFFSET_IN_PRINT_SIZES = 0.45;
const MAX_PRINT_COUNT = 30;
const MILLISECONDS_BETWEEN_PRINTS = 400;
const CROSSING_MARGIN_SHARE = 0.1;

// Plans a walk across the screen: prints in a line, left and right in turn, one after another.
export function planPawPrintTrail(
  random: RandomNumberGenerator,
  viewport: Viewport,
): PawPrintTrail {
  const species: PetSpecies = random() < 0.5 ? "cat" : "dog";
  const sizePixels = Math.round(
    pickBetween(random, MIN_SIZE_PIXELS, MAX_SIZE_PIXELS),
  );
  const { start, target } = planCrossing(random, viewport, sizePixels);
  const prints = planPrints(start, target, sizePixels);

  return {
    species,
    sizePixels,
    prints,
    printLifetimeMilliseconds: PRINT_LIFETIME_MILLISECONDS,
    totalMilliseconds: calculateTotalMilliseconds(prints.length),
  };
}

function calculateTotalMilliseconds(printCount: number): number {
  const lastPrintAppearsAfter = (printCount - 1) * MILLISECONDS_BETWEEN_PRINTS;

  return lastPrintAppearsAfter + PRINT_LIFETIME_MILLISECONDS;
}

// The walk starts just outside one side of the screen and ends just outside the opposite side.
function planCrossing(
  random: RandomNumberGenerator,
  viewport: Viewport,
  sizePixels: number,
): { start: Point; target: Point } {
  const crossesHorizontally = random() < 0.5;
  const startsAtFirstSide = random() < 0.5;
  const lengthAlong = crossesHorizontally
    ? viewport.widthPixels
    : viewport.heightPixels;
  const lengthAcross = crossesHorizontally
    ? viewport.heightPixels
    : viewport.widthPixels;
  const startAlong = startsAtFirstSide ? -sizePixels : lengthAlong + sizePixels;
  const targetAlong = startsAtFirstSide ? lengthAlong + sizePixels : -sizePixels;
  const startAcross = pickPositionAcross(random, lengthAcross);
  const targetAcross = pickPositionAcross(random, lengthAcross);

  return {
    start: toPoint(crossesHorizontally, startAlong, startAcross),
    target: toPoint(crossesHorizontally, targetAlong, targetAcross),
  };
}

// Keeps the walk away from the very corners of the screen.
function pickPositionAcross(
  random: RandomNumberGenerator,
  lengthAcross: number,
): number {
  return pickBetween(
    random,
    lengthAcross * CROSSING_MARGIN_SHARE,
    lengthAcross * (1 - CROSSING_MARGIN_SHARE),
  );
}

function toPoint(
  crossesHorizontally: boolean,
  along: number,
  across: number,
): Point {
  return crossesHorizontally
    ? { xPixels: along, yPixels: across }
    : { xPixels: across, yPixels: along };
}

function planPrints(
  start: Point,
  target: Point,
  sizePixels: number,
): PawPrint[] {
  const deltaX = target.xPixels - start.xPixels;
  const deltaY = target.yPixels - start.yPixels;
  const walkLengthPixels = Math.hypot(deltaX, deltaY);
  const directionX = deltaX / walkLengthPixels;
  const directionY = deltaY / walkLengthPixels;
  const walkAngleDegrees = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
  const stridePixels = sizePixels * STRIDE_IN_PRINT_SIZES;
  const printCount = Math.min(
    MAX_PRINT_COUNT,
    Math.floor(walkLengthPixels / stridePixels),
  );

  return Array.from({ length: printCount }, (_, index) => {
    const isLeftSide = index % 2 === 0;
    const sideOffsetPixels =
      (isLeftSide ? -1 : 1) * sizePixels * SIDE_OFFSET_IN_PRINT_SIZES;
    const distanceAlongWalk = index * stridePixels;

    return {
      // The sideways direction is the walking direction turned a quarter turn.
      xPixels:
        start.xPixels + directionX * distanceAlongWalk - directionY * sideOffsetPixels,
      yPixels:
        start.yPixels + directionY * distanceAlongWalk + directionX * sideOffsetPixels,
      rotationDegrees: walkAngleDegrees + 90,
      appearAfterMilliseconds: index * MILLISECONDS_BETWEEN_PRINTS,
    };
  });
}

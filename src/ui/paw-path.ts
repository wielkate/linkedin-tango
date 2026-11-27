export interface Point {
  x: number;
  y: number;
}

export interface PawPathInput {
  // Where the paw starts, in screen pixels.
  start: Point;
  targetCenter: Point;
  targetRadiusPixels: number;
  pawSizePixels: number;
}

export interface PawPath {
  // Where the middle of the paw stops: just outside the target, on the line from the start.
  stopCenter: Point;
  // The start, measured from the stop. The animation begins there.
  startOffset: Point;
  // Turns a paw whose toes point up so that the toes point at the target.
  rotationDegrees: number;
}

const GAP_BEFORE_TARGET_PIXELS = 4;

// The paw walks in a straight line and stops with its toes next to the target, not on top of it,
// so the target stays visible.
export function calculatePawPath(input: PawPathInput): PawPath {
  const { start, targetCenter, targetRadiusPixels, pawSizePixels } = input;
  const directionX = targetCenter.x - start.x;
  const directionY = targetCenter.y - start.y;
  const distanceToTarget = Math.hypot(directionX, directionY);

  if (distanceToTarget === 0) {
    return {
      stopCenter: start,
      startOffset: { x: 0, y: 0 },
      rotationDegrees: 0,
    };
  }

  const unitX = directionX / distanceToTarget;
  const unitY = directionY / distanceToTarget;
  const stopDistanceFromTarget =
    targetRadiusPixels + GAP_BEFORE_TARGET_PIXELS + pawSizePixels / 2;
  const stopCenter = {
    x: targetCenter.x - unitX * stopDistanceFromTarget,
    y: targetCenter.y - unitY * stopDistanceFromTarget,
  };

  return {
    stopCenter,
    startOffset: { x: start.x - stopCenter.x, y: start.y - stopCenter.y },
    rotationDegrees: (Math.atan2(unitX, -unitY) * 180) / Math.PI,
  };
}

export interface Point {
  x: number;
  y: number;
}

export interface ArmPlacementInput {
  // The middle of the button the paw has to cover.
  buttonCenter: Point;
  viewportWidthPixels: number;
  armWidthPixels: number;
  // How far behind the tip of the toes the middle of the paw is.
  tipToPawCenterPixels: number;
}

export interface ArmPlacement {
  // The arm is drawn upright, with the toes at the top middle of its box. The page turns it to
  // point left, around that top middle point, so it reaches in from the right edge of the screen.
  boxLeftPixels: number;
  boxTopPixels: number;
  boxHeightPixels: number;
  // How far the arm is pulled back along its length so that no part of it shows on screen.
  hiddenDistancePixels: number;
}

const HIDDEN_MARGIN_PIXELS = 8;

// Puts the middle of the paw on the button and the rest of the arm beyond the right edge.
export function calculateArmPlacement(input: ArmPlacementInput): ArmPlacement {
  const { buttonCenter, viewportWidthPixels, armWidthPixels } = input;
  const toesX = buttonCenter.x - input.tipToPawCenterPixels;
  const distanceFromToesToRightEdge = viewportWidthPixels - toesX;

  return {
    boxLeftPixels: toesX - armWidthPixels / 2,
    boxTopPixels: buttonCenter.y,
    boxHeightPixels: distanceFromToesToRightEdge + armWidthPixels,
    hiddenDistancePixels: distanceFromToesToRightEdge + HIDDEN_MARGIN_PIXELS,
  };
}

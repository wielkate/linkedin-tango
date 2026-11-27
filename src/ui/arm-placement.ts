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
  // The arm is drawn upright, with the toes at the top middle of its box. The page turns it
  // upside down around that top middle point, so it hangs from the top edge of the screen with
  // the toes pointing down at the button.
  boxLeftPixels: number;
  boxTopPixels: number;
  boxHeightPixels: number;
  // How far the arm is pulled back along its length so that no part of it shows on screen.
  hiddenDistancePixels: number;
}

const HIDDEN_MARGIN_PIXELS = 8;

// Puts the middle of the paw on the button and the rest of the arm above the top edge.
export function calculateArmPlacement(input: ArmPlacementInput): ArmPlacement {
  const { buttonCenter, viewportWidthPixels, armWidthPixels } = input;
  const toesY = buttonCenter.y + input.tipToPawCenterPixels;
  const centeredLeftPixels = buttonCenter.x - armWidthPixels / 2;
  const rightmostLeftPixels = viewportWidthPixels - armWidthPixels;

  return {
    // A button near the edge of the screen must not push the arm out of view.
    boxLeftPixels: Math.max(
      0,
      Math.min(centeredLeftPixels, rightmostLeftPixels),
    ),
    boxTopPixels: toesY,
    boxHeightPixels: toesY + armWidthPixels,
    hiddenDistancePixels: toesY + HIDDEN_MARGIN_PIXELS,
  };
}

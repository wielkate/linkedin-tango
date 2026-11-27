import { describe, expect, it } from "vitest";
import { calculateArmPlacement } from "./arm-placement";

function placementFor(buttonCenterX: number) {
  return calculateArmPlacement({
    buttonCenter: { x: buttonCenterX, y: 40 },
    viewportWidthPixels: 400,
    armWidthPixels: 100,
    tipToPawCenterPixels: 60,
  });
}

describe("calculateArmPlacement", () => {
  it("puts the toes behind the button, so the middle of the paw covers it", () => {
    const placement = placementFor(360);

    // The toes are at x = 300; the box is 100 wide with the toes at its top middle.
    expect(placement.boxLeftPixels).toBe(250);
  });

  it("starts the arm at the height of the button", () => {
    expect(placementFor(360).boxTopPixels).toBe(40);
  });

  it("makes the arm reach past the right edge of the screen", () => {
    const placement = placementFor(360);

    // 100 from the toes to the edge, plus one arm width of spare length.
    expect(placement.boxHeightPixels).toBe(200);
  });

  it("pulls the arm back far enough to hide the toes beyond the right edge", () => {
    const placement = placementFor(360);

    expect(placement.hiddenDistancePixels).toBe(108);
  });
});

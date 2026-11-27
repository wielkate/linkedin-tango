import { describe, expect, it } from "vitest";
import { calculateArmPlacement } from "./arm-placement";

function placementFor(buttonCenterY: number, buttonCenterX = 300) {
  return calculateArmPlacement({
    buttonCenter: { x: buttonCenterX, y: buttonCenterY },
    viewportWidthPixels: 400,
    armWidthPixels: 100,
    tipToPawCenterPixels: 60,
  });
}

describe("calculateArmPlacement", () => {
  it("centres the arm on the button", () => {
    expect(placementFor(40).boxLeftPixels).toBe(250);
  });

  it("keeps the arm inside the screen when the button is near the right edge", () => {
    expect(placementFor(40, 390).boxLeftPixels).toBe(300);
  });

  it("keeps the arm inside the screen when the button is near the left edge", () => {
    expect(placementFor(40, 10).boxLeftPixels).toBe(0);
  });

  it("puts the toes below the button, so the middle of the paw covers it", () => {
    expect(placementFor(40).boxTopPixels).toBe(100);
  });

  it("makes the arm reach past the top edge of the screen", () => {
    // 100 from the toes up to the edge, plus one arm width of spare length.
    expect(placementFor(40).boxHeightPixels).toBe(200);
  });

  it("pulls the arm back far enough to hide the toes above the top edge", () => {
    expect(placementFor(40).hiddenDistancePixels).toBe(108);
  });
});

import { describe, expect, it } from "vitest";
import { calculatePawPath } from "./paw-path";

const TARGET_CENTER = { x: 100, y: 0 };

function pathFrom(start: { x: number; y: number }) {
  return calculatePawPath({
    start,
    targetCenter: TARGET_CENTER,
    targetRadiusPixels: 10,
    pawSizePixels: 40,
  });
}

describe("calculatePawPath", () => {
  it("stops next to the target, not on top of it", () => {
    const path = pathFrom({ x: -100, y: 0 });

    // 10 (target radius) + 4 (gap) + 20 (half the paw) before the target centre.
    expect(path.stopCenter).toEqual({ x: 66, y: 0 });
  });

  it("starts the walk at the given start point", () => {
    const path = pathFrom({ x: -100, y: 0 });

    expect(path.startOffset).toEqual({ x: -166, y: 0 });
  });

  it("points the toes right for a paw coming from the left", () => {
    expect(pathFrom({ x: -100, y: 0 }).rotationDegrees).toBeCloseTo(90);
  });

  it("points the toes up for a paw coming from below", () => {
    expect(pathFrom({ x: 100, y: 200 }).rotationDegrees).toBeCloseTo(0);
  });

  it("points the toes down for a paw coming from above", () => {
    expect(Math.abs(pathFrom({ x: 100, y: -200 }).rotationDegrees)).toBeCloseTo(
      180,
    );
  });

  it("does not move when the start is the target", () => {
    const path = pathFrom(TARGET_CENTER);

    expect(path.startOffset).toEqual({ x: 0, y: 0 });
  });
});

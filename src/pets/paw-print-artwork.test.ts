import { describe, expect, it } from "vitest";
import { drawPawPrint } from "./paw-print-artwork";

describe("drawPawPrint", () => {
  it("draws a cat print with a pad and four toes", () => {
    const svg = drawPawPrint("cat");

    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg.match(/<ellipse/g)).toHaveLength(5);
  });

  it("draws a dog print with a pad, four toes and two claw dents", () => {
    const svg = drawPawPrint("dog");

    expect(svg.match(/<ellipse/g)).toHaveLength(6);
    expect(svg).toContain("<path");
  });

  it("takes its colour from the page", () => {
    expect(drawPawPrint("cat")).toContain('fill="currentColor"');
  });
});

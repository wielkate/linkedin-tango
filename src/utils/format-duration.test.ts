import { describe, expect, it } from "vitest";
import { formatDuration } from "./format-duration";

describe("formatDuration", () => {
  it("shows only seconds below one minute", () => {
    expect(formatDuration(0)).toBe("0 sec");
    expect(formatDuration(45)).toBe("45 sec");
    expect(formatDuration(59)).toBe("59 sec");
  });

  it("shows minutes and seconds from one minute on", () => {
    expect(formatDuration(60)).toBe("1 min 0 sec");
    expect(formatDuration(83)).toBe("1 min 23 sec");
  });

  it("keeps counting minutes past one hour", () => {
    expect(formatDuration(3600)).toBe("60 min 0 sec");
    expect(formatDuration(3725)).toBe("62 min 5 sec");
  });
});

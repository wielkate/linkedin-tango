import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Stopwatch } from "./stopwatch";

const realDateNow = Date.now;
let currentMilliseconds: number;

function passSeconds(seconds: number): void {
  currentMilliseconds += seconds * 1000;
}

beforeEach(() => {
  currentMilliseconds = 1_000_000;
  Date.now = () => currentMilliseconds;
});

afterEach(() => {
  Date.now = realDateNow;
});

describe("Stopwatch", () => {
  it("starts running at zero", () => {
    const stopwatch = new Stopwatch();
    expect(stopwatch.isRunning()).toBe(true);
    expect(stopwatch.getElapsedSeconds()).toBe(0);
  });

  it("counts whole seconds while running", () => {
    const stopwatch = new Stopwatch();
    passSeconds(5);
    currentMilliseconds += 900;
    expect(stopwatch.getElapsedSeconds()).toBe(5);
  });

  it("stands still while paused and carries on after resume", () => {
    const stopwatch = new Stopwatch();
    passSeconds(10);
    stopwatch.pause();
    passSeconds(60);

    expect(stopwatch.isPaused()).toBe(true);
    expect(stopwatch.isRunning()).toBe(false);
    expect(stopwatch.getElapsedSeconds()).toBe(10);

    stopwatch.resume();
    passSeconds(3);
    expect(stopwatch.getElapsedSeconds()).toBe(13);
  });

  it("does not count time twice when paused twice", () => {
    const stopwatch = new Stopwatch();
    passSeconds(4);
    stopwatch.pause();
    passSeconds(10);
    stopwatch.pause();
    expect(stopwatch.getElapsedSeconds()).toBe(4);
  });

  it("freezes for good when stopped", () => {
    const stopwatch = new Stopwatch();
    passSeconds(7);
    stopwatch.stop();
    passSeconds(30);
    stopwatch.resume();
    passSeconds(30);

    expect(stopwatch.isStopped()).toBe(true);
    expect(stopwatch.isPaused()).toBe(false);
    expect(stopwatch.isRunning()).toBe(false);
    expect(stopwatch.getElapsedSeconds()).toBe(7);
  });

  it("shows an earlier time, frozen, with freezeAt", () => {
    const stopwatch = new Stopwatch();
    stopwatch.freezeAt(95);
    passSeconds(20);

    expect(stopwatch.isStopped()).toBe(true);
    expect(stopwatch.getElapsedSeconds()).toBe(95);
  });

  it("starts again from zero after restart", () => {
    const stopwatch = new Stopwatch();
    passSeconds(50);
    stopwatch.stop();

    stopwatch.restart();
    expect(stopwatch.isRunning()).toBe(true);
    expect(stopwatch.isStopped()).toBe(false);
    expect(stopwatch.getElapsedSeconds()).toBe(0);

    passSeconds(2);
    expect(stopwatch.getElapsedSeconds()).toBe(2);
  });
});

describe("Stopwatch edge cases", () => {
  it("cannot be resumed after freezeAt", () => {
    const stopwatch = new Stopwatch();
    stopwatch.freezeAt(12);
    stopwatch.resume();
    passSeconds(30);
    expect(stopwatch.isRunning()).toBe(false);
    expect(stopwatch.getElapsedSeconds()).toBe(12);
  });

  it("shows zero for freezeAt(0)", () => {
    const stopwatch = new Stopwatch();
    stopwatch.freezeAt(0);
    expect(stopwatch.isStopped()).toBe(true);
    expect(stopwatch.getElapsedSeconds()).toBe(0);
  });

  it("can pause and resume many times without losing time", () => {
    const stopwatch = new Stopwatch();

    for (let round = 0; round < 5; round++) {
      passSeconds(2);
      stopwatch.pause();
      passSeconds(100);
      stopwatch.resume();
    }

    passSeconds(1);
    expect(stopwatch.getElapsedSeconds()).toBe(11);
  });

  it("ignores resume while already running", () => {
    const stopwatch = new Stopwatch();
    passSeconds(5);
    stopwatch.resume();
    passSeconds(5);
    expect(stopwatch.getElapsedSeconds()).toBe(10);
  });

  it("stays stopped when paused after stop", () => {
    const stopwatch = new Stopwatch();
    stopwatch.stop();
    stopwatch.pause();
    expect(stopwatch.isStopped()).toBe(true);
    expect(stopwatch.isPaused()).toBe(false);
  });

  it("rounds down partial seconds", () => {
    const stopwatch = new Stopwatch();
    currentMilliseconds += 1999;
    expect(stopwatch.getElapsedSeconds()).toBe(1);
  });
});

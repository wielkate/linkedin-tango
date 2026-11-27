import { describe, expect, it } from "vitest";
import {
  BlockedLocalStorage,
  FakeLocalStorage,
} from "../test-support/fake-local-storage";
import { claimStartPawPlay } from "./start-paw-session";

describe("claimStartPawPlay", () => {
  it("lets the animation play the first time in a session", () => {
    expect(claimStartPawPlay(new FakeLocalStorage())).toBe(true);
  });

  it("does not let it play again in the same session", () => {
    const storage = new FakeLocalStorage();
    claimStartPawPlay(storage);

    expect(claimStartPawPlay(storage)).toBe(false);
  });

  it("lets it play again in a new session", () => {
    claimStartPawPlay(new FakeLocalStorage());

    expect(claimStartPawPlay(new FakeLocalStorage())).toBe(true);
  });

  it("plays when the browser blocks storage", () => {
    expect(claimStartPawPlay(new BlockedLocalStorage())).toBe(true);
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import {
  BlockedLocalStorage,
  FakeLocalStorage,
  installLocalStorage,
} from "../test-support/fake-local-storage";
import { SolvedBoards } from "./solved-boards";

const STORAGE_KEY = "tango-solve-seconds";

let storage: FakeLocalStorage;

beforeEach(() => {
  storage = new FakeLocalStorage();
  installLocalStorage(storage);
});

describe("SolvedBoards", () => {
  it("starts with no solved boards", () => {
    const solvedBoards = SolvedBoards.loadFromStorage();
    expect(solvedBoards.getBoardIds("easy").size).toBe(0);
    expect(solvedBoards.getSolveSeconds("easy", 1)).toBeNull();
  });

  it("remembers a solved board per difficulty", () => {
    const solvedBoards = SolvedBoards.loadFromStorage();
    solvedBoards.markSolved("hard", 42, 90);

    expect(solvedBoards.getBoardIds("hard")).toEqual(new Set([42]));
    expect(solvedBoards.getBoardIds("easy").size).toBe(0);
    expect(solvedBoards.getSolveSeconds("hard", 42)).toBe(90);
  });

  it("keeps only the best time", () => {
    const solvedBoards = SolvedBoards.loadFromStorage();
    solvedBoards.markSolved("easy", 5, 100);
    solvedBoards.markSolved("easy", 5, 120);
    expect(solvedBoards.getSolveSeconds("easy", 5)).toBe(100);

    solvedBoards.markSolved("easy", 5, 80);
    expect(solvedBoards.getSolveSeconds("easy", 5)).toBe(80);
  });

  it("survives a reload through storage", () => {
    SolvedBoards.loadFromStorage().markSolved("medium", 7, 33);

    const reloaded = SolvedBoards.loadFromStorage();
    expect(reloaded.getSolveSeconds("medium", 7)).toBe(33);
    expect(reloaded.getBoardIds("medium")).toEqual(new Set([7]));
  });

  it("does not write to storage when the time is not an improvement", () => {
    const solvedBoards = SolvedBoards.loadFromStorage();
    solvedBoards.markSolved("easy", 1, 50);
    const savedText = storage.getItem(STORAGE_KEY);

    storage.setItem(STORAGE_KEY, "changed");
    solvedBoards.markSolved("easy", 1, 60);
    expect(storage.getItem(STORAGE_KEY)).toBe("changed");
    expect(savedText).not.toBe("changed");
  });

  it("treats unreadable saved progress as no progress", () => {
    storage.setItem(STORAGE_KEY, "{not json");
    const solvedBoards = SolvedBoards.loadFromStorage();
    expect(solvedBoards.getBoardIds("easy").size).toBe(0);
  });

  it("keeps working when storage is blocked", () => {
    installLocalStorage(new BlockedLocalStorage());
    const solvedBoards = SolvedBoards.loadFromStorage();

    expect(() => solvedBoards.markSolved("easy", 3, 10)).not.toThrow();
    expect(solvedBoards.getSolveSeconds("easy", 3)).toBe(10);
  });
});

describe("SolvedBoards edge cases", () => {
  it("treats a saved null or a non-object as no progress", () => {
    for (const savedText of ["null", "42", '"text"', "[]"]) {
      storage.setItem(STORAGE_KEY, savedText);
      expect(SolvedBoards.loadFromStorage().getBoardIds("easy").size).toBe(0);
    }
  });

  it("ignores saved difficulties it does not know", () => {
    storage.setItem(STORAGE_KEY, JSON.stringify({ impossible: { 1: 5 } }));
    const solvedBoards = SolvedBoards.loadFromStorage();
    expect(solvedBoards.getBoardIds("easy").size).toBe(0);
  });

  it("loads a difficulty even when another one is missing", () => {
    storage.setItem(STORAGE_KEY, JSON.stringify({ hard: { 9: 12 } }));
    const solvedBoards = SolvedBoards.loadFromStorage();
    expect(solvedBoards.getSolveSeconds("hard", 9)).toBe(12);
    expect(solvedBoards.getBoardIds("medium").size).toBe(0);
  });

  it("keeps a zero-second time as the best time", () => {
    const solvedBoards = SolvedBoards.loadFromStorage();
    solvedBoards.markSolved("easy", 2, 0);
    expect(solvedBoards.getSolveSeconds("easy", 2)).toBe(0);
    expect(solvedBoards.getBoardIds("easy")).toEqual(new Set([2]));
  });

  it("does not accept an equal time as a new best", () => {
    const solvedBoards = SolvedBoards.loadFromStorage();
    solvedBoards.markSolved("easy", 4, 30);
    storage.setItem(STORAGE_KEY, "untouched");
    solvedBoards.markSolved("easy", 4, 30);
    expect(storage.getItem(STORAGE_KEY)).toBe("untouched");
  });

  it("returns a copy of the solved ids, so callers cannot change the progress", () => {
    const solvedBoards = SolvedBoards.loadFromStorage();
    solvedBoards.markSolved("easy", 6, 10);
    solvedBoards.getBoardIds("easy").delete(6);
    expect(solvedBoards.getBoardIds("easy")).toEqual(new Set([6]));
  });
});

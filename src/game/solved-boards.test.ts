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

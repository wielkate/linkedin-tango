import { describe, expect, it } from "vitest";
import { Board } from "../game/board";
import { DIFFICULTIES } from "../game/difficulty";
import type { Puzzle } from "../game/puzzle";
import { createStartBoard } from "../game/puzzle";
import { PuzzleLibrary } from "../game/puzzle-library";
import { fillBoardWithSolution } from "../game/solution";
import { CAT, DOG } from "../game/symbols";
import { createBoardWithTopRows } from "../test-support/create-board";
import { findHint } from "./hint";

// A puzzle without any clue, so only what the player has filled in can explain a hint.
const clueFreePuzzle: Puzzle = {
  id: 1,
  solution: {
    rowTexts: ["001011", "110100", "010110", "101001", "011001", "100110"],
  },
  givenCells: [],
  edgeHints: [],
};

describe("findHint", () => {
  it("has no hint when every cell already matches the solution", () => {
    const board = Board.createEmpty();
    fillBoardWithSolution(board, clueFreePuzzle.solution);
    expect(findHint(board, clueFreePuzzle)).toBeNull();
  });

  it("explains a cell with a simple rule when one applies", () => {
    const hint = findHint(createBoardWithTopRows(["CC"]), clueFreePuzzle);
    expect(hint?.position).toEqual({ row: 0, column: 2 });
    expect(hint?.correctValue).toBe(DOG);
    expect(hint?.explanation).toContain("Three identical symbols");
    expect(hint?.relatedPositions).toHaveLength(2);
  });

  it("falls back to the solution when no rule can explain a cell", () => {
    const hint = findHint(Board.createEmpty(), clueFreePuzzle);
    expect(hint?.position).toEqual({ row: 0, column: 0 });
    expect(hint?.correctValue).toBe(CAT);
    expect(hint?.explanation).toContain("longer chain of reasoning");
  });

  it("fixes a wrongly filled cell first and says so", () => {
    const hint = findHint(createBoardWithTopRows(["DC"]), clueFreePuzzle);
    expect(hint?.position).toEqual({ row: 0, column: 0 });
    expect(hint?.correctValue).toBe(CAT);
    expect(hint?.explanation.startsWith("Your 🐶 did not belong here.")).toBe(
      true,
    );
  });

  it("does not trust a wrong cell when explaining another one", () => {
    const hint = findHint(createBoardWithTopRows(["CCC"]), clueFreePuzzle);
    expect(hint?.position).toEqual({ row: 0, column: 2 });
    expect(hint?.correctValue).toBe(DOG);
    expect(hint?.explanation).toContain("Your 🐱 did not belong here.");
  });

  it("uses a try-it-out explanation when simple rules are not enough", () => {
    const library = new PuzzleLibrary();
    const explanations: string[] = [];

    for (const difficulty of DIFFICULTIES) {
      for (let boardId = 1; boardId <= 60; boardId++) {
        const puzzle = library.getPuzzle(difficulty, boardId);
        const hint = findHint(createStartBoard(puzzle), puzzle);
        explanations.push(hint?.explanation ?? "");
      }
    }

    expect(
      explanations.some((explanation) => explanation.includes("try it out")),
    ).toBe(true);
  });
});

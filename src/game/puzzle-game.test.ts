import { beforeEach, describe, expect, it } from "vitest";
import { toCellKey } from "./cell-position";
import { PuzzleGame } from "./puzzle-game";
import { PuzzleLibrary } from "./puzzle-library";
import { findPositionsDifferingFromSolution } from "./solution";
import { CAT, DOG, type CellValue } from "./symbols";

const library = new PuzzleLibrary();

let game: PuzzleGame;

// The first cell of the board that the player may change.
function findFreePosition(playedGame: PuzzleGame) {
  const lockedCellKeys = playedGame.getLockedCellKeys();
  const position = findPositionsDifferingFromSolution(
    playedGame.getBoard(),
    playedGame.puzzle.solution,
  ).find((candidate) => !lockedCellKeys.has(toCellKey(candidate)));

  if (position === undefined) {
    throw new Error("The puzzle has no free cell.");
  }

  return position;
}

beforeEach(() => {
  game = new PuzzleGame(library.getPuzzle("easy", 1));
});

describe("PuzzleGame", () => {
  it("starts with the given cells locked and nothing to undo", () => {
    const { givenCells } = game.puzzle;
    expect(game.getLockedCellKeys()).toEqual(
      new Set(givenCells.map(toCellKey)),
    );
    expect(game.canUndo()).toBe(false);
    expect(game.isSolved()).toBe(false);
    expect(game.getActiveHint()).toBeNull();
  });

  it("cycles a free cell empty, cat, dog, empty when clicked", () => {
    const position = findFreePosition(game);
    const clickedValues: CellValue[] = [];

    for (let click = 0; click < 3; click++) {
      game.clickCell(position);
      clickedValues.push(game.getBoard().getValue(position));
    }

    expect(clickedValues).toEqual([CAT, DOG, null]);
  });

  it("ignores clicks on locked cells", () => {
    const [givenCell] = game.puzzle.givenCells;
    game.clickCell(givenCell);
    expect(game.getBoard().getValue(givenCell)).toBe(givenCell.value);
    expect(game.canUndo()).toBe(false);
  });

  it("undoes clicks one by one", () => {
    const position = findFreePosition(game);
    game.clickCell(position);
    game.clickCell(position);
    expect(game.getBoard().getValue(position)).toBe(DOG);

    game.undo();
    expect(game.getBoard().getValue(position)).toBe(CAT);
    game.undo();
    expect(game.getBoard().isEmpty(position)).toBe(true);
    expect(game.canUndo()).toBe(false);
  });

  it("does nothing when there is nothing to undo", () => {
    expect(() => game.undo()).not.toThrow();
  });

  it("solves the puzzle with solve()", () => {
    game.clickCell(findFreePosition(game));
    game.solve();
    expect(game.isSolved()).toBe(true);
    expect(game.findCellsBreakingRules().size).toBe(0);
    expect(game.canUndo()).toBe(false);
  });

  it("is no longer solved when a cell holds the wrong symbol", () => {
    const position = findFreePosition(game);
    const solutionSymbol = Number(
      game.puzzle.solution.rowTexts[position.row][position.column],
    );
    const wrongSymbol = solutionSymbol === CAT ? DOG : CAT;

    game.solve();
    game.getBoard().setValue(position, wrongSymbol);
    expect(game.isSolved()).toBe(false);
  });

  describe("revealHint", () => {
    it("fills a cell with its right symbol, locks it and keeps the hint", () => {
      game.revealHint();
      const hint = game.getActiveHint();

      expect(hint).not.toBeNull();
      expect(game.getBoard().getValue(hint!.position)).toBe(hint!.correctValue);
      expect(game.getLockedCellKeys().has(toCellKey(hint!.position))).toBe(
        true,
      );
    });

    it("is cleared by the next click, and by undo", () => {
      game.revealHint();
      game.clickCell(findFreePosition(game));
      expect(game.getActiveHint()).toBeNull();

      game.revealHint();
      game.undo();
      expect(game.getActiveHint()).toBeNull();
    });

    it("does nothing once the board is solved", () => {
      game.solve();
      game.revealHint();
      expect(game.getActiveHint()).toBeNull();
    });
  });
});

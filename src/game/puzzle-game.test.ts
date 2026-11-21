import { beforeEach, describe, expect, it } from "vitest";
import { getAllCellPositions, toCellKey } from "./cell-position";
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

describe("PuzzleGame edge cases", () => {
  it("ignores a click on a cell the hint filled in", () => {
    game.revealHint();
    const hintPosition = game.getActiveHint()!.position;
    const valueBefore = game.getBoard().getValue(hintPosition);

    game.clickCell(hintPosition);
    expect(game.getBoard().getValue(hintPosition)).toBe(valueBefore);
  });

  it("locks a new cell with every hint", () => {
    const lockedBefore = game.getLockedCellKeys().size;
    game.revealHint();
    game.revealHint();
    expect(game.getLockedCellKeys().size).toBe(lockedBefore + 2);
  });

  it("keeps a hint-filled cell filled when undo goes back over a click on it", () => {
    let checkedScenarioCount = 0;

    for (const position of getAllCellPositions()) {
      const playedGame = new PuzzleGame(library.getPuzzle("easy", 1));
      const isLocked = playedGame.getLockedCellKeys().has(toCellKey(position));

      if (isLocked) {
        continue;
      }

      const correctValue = Number(
        playedGame.puzzle.solution.rowTexts[position.row][position.column],
      );
      // Put a wrong symbol on the cell, so the hint can correct that very cell.
      playedGame.clickCell(position);
      if (playedGame.getBoard().getValue(position) === correctValue) {
        playedGame.clickCell(position);
      }

      playedGame.revealHint();
      const hint = playedGame.getActiveHint();
      const isHintOnClickedCell =
        hint?.position.row === position.row &&
        hint.position.column === position.column;

      if (!isHintOnClickedCell) {
        continue;
      }

      checkedScenarioCount++;
      playedGame.undo();
      expect(playedGame.getBoard().getValue(position)).toBe(correctValue);
    }

    expect(checkedScenarioCount).toBeGreaterThan(0);
  });

  it("has nothing left to undo once the hint fixed the only clicked cell", () => {
    for (const position of getAllCellPositions()) {
      const playedGame = new PuzzleGame(library.getPuzzle("easy", 1));

      if (playedGame.getLockedCellKeys().has(toCellKey(position))) {
        continue;
      }

      playedGame.clickCell(position);
      playedGame.revealHint();
      const hint = playedGame.getActiveHint();
      const isHintOnClickedCell =
        hint?.position.row === position.row &&
        hint.position.column === position.column;

      if (isHintOnClickedCell) {
        expect(playedGame.canUndo()).toBe(false);
      }
    }
  });

  it("can be undone to the start without touching the given cells", () => {
    const position = findFreePosition(game);
    game.clickCell(position);
    game.clickCell(position);
    game.undo();
    game.undo();
    game.undo();

    for (const givenCell of game.puzzle.givenCells) {
      expect(game.getBoard().getValue(givenCell)).toBe(givenCell.value);
    }
  });

  it("stays solved after solve() is called twice", () => {
    game.solve();
    game.solve();
    expect(game.isSolved()).toBe(true);
  });

  it("keeps a solved board solved when a locked cell is clicked", () => {
    game.solve();
    game.clickCell(game.puzzle.givenCells[0]);
    expect(game.isSolved()).toBe(true);
  });

  it("can be played to the end by clicking only", () => {
    const solutionRows = game.puzzle.solution.rowTexts;
    const lockedCellKeys = game.getLockedCellKeys();

    for (let row = 0; row < 6; row++) {
      for (let column = 0; column < 6; column++) {
        const position = { row, column };
        const isFree = !lockedCellKeys.has(toCellKey(position));
        const wantedValue = Number(solutionRows[row][column]);

        while (isFree && game.getBoard().getValue(position) !== wantedValue) {
          game.clickCell(position);
        }
      }
    }

    expect(game.isSolved()).toBe(true);
  });
});

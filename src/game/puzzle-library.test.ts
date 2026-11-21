import { describe, expect, it } from "vitest";
import { findHint } from "../hints/hint";
import { Board } from "./board";
import { DIFFICULTIES, type Difficulty } from "./difficulty";
import { getAllLines } from "./line";
import { createStartBoard } from "./puzzle";
import { PuzzleLibrary } from "./puzzle-library";
import { findCellsBreakingRules, isSolved } from "./rules";
import { fillBoardWithSolution, getSolutionSymbol } from "./solution";

const library = new PuzzleLibrary();
const ALL_BOARD_IDS = Array.from(
  { length: library.getBoardCount() },
  (_, index) => index + 1,
);

describe("PuzzleLibrary", () => {
  it("holds every valid board", () => {
    expect(library.getBoardCount()).toBe(11222);
  });

  it("numbers puzzles from 1", () => {
    expect(library.getPuzzle("easy", 1).id).toBe(1);
    expect(library.getPuzzle("hard", 11222).id).toBe(11222);
  });

  it("uses the same solution for every difficulty of a board", () => {
    const [easy, medium, hard] = DIFFICULTIES.map((difficulty) =>
      library.getPuzzle(difficulty, 500),
    );
    expect(medium.solution).toEqual(easy.solution);
    expect(hard.solution).toEqual(easy.solution);
  });

  it("gives easier puzzles more clues than harder ones, on average", () => {
    const sampleBoardIds = ALL_BOARD_IDS.filter(
      (boardId) => boardId % 200 === 0,
    );
    const averageClueCount = (difficulty: Difficulty) => {
      const clueCounts = sampleBoardIds.map((boardId) => {
        const puzzle = library.getPuzzle(difficulty, boardId);
        return puzzle.givenCells.length + puzzle.edgeHints.length;
      });
      return (
        clueCounts.reduce((sum, count) => sum + count, 0) / clueCounts.length
      );
    };

    expect(averageClueCount("easy")).toBeGreaterThan(
      averageClueCount("medium"),
    );
    expect(averageClueCount("medium")).toBeGreaterThan(
      averageClueCount("hard"),
    );
  });

  describe("pickBoardId", () => {
    it("picks a board number inside the range", () => {
      for (let attempt = 0; attempt < 50; attempt++) {
        const boardId = library.pickBoardId(new Set());
        expect(boardId).toBeGreaterThanOrEqual(1);
        expect(boardId).toBeLessThanOrEqual(library.getBoardCount());
      }
    });

    it("skips solved boards while unsolved ones remain", () => {
      const solvedBoardIds = new Set(ALL_BOARD_IDS.filter((id) => id !== 777));
      expect(library.pickBoardId(solvedBoardIds)).toBe(777);
    });

    it("picks any board once every one is solved", () => {
      const boardId = library.pickBoardId(new Set(ALL_BOARD_IDS));
      expect(ALL_BOARD_IDS).toContain(boardId);
    });
  });
});

describe("the stored boards", () => {
  it("are all valid, distinct and hold three of each symbol per line", () => {
    const seenSolutions = new Set<string>();

    for (const boardId of ALL_BOARD_IDS) {
      const { solution } = library.getPuzzle("easy", boardId);
      const board = Board.createEmpty();
      fillBoardWithSolution(board, solution);

      expect(findCellsBreakingRules(board, []).size).toBe(0);
      expect(isSolved(board, [])).toBe(true);
      seenSolutions.add(solution.rowTexts.join(""));
    }

    expect(seenSolutions.size).toBe(ALL_BOARD_IDS.length);
  });

  it("have lines of exactly three cats and three dogs", () => {
    for (const boardId of ALL_BOARD_IDS.filter((id) => id % 50 === 0)) {
      const { solution } = library.getPuzzle("easy", boardId);

      for (const line of getAllLines()) {
        const dogCount = line.positions
          .map((position) => getSolutionSymbol(solution, position))
          .reduce<number>((sum, symbol) => sum + symbol, 0);
        expect(dogCount).toBe(3);
      }
    }
  });
});

describe("the stored puzzles", () => {
  it("agree with their solution in every given cell and every edge hint", () => {
    for (const difficulty of DIFFICULTIES) {
      for (const boardId of ALL_BOARD_IDS.filter((id) => id % 10 === 0)) {
        const puzzle = library.getPuzzle(difficulty, boardId);
        const solvedBoard = Board.createEmpty();
        fillBoardWithSolution(solvedBoard, puzzle.solution);

        for (const givenCell of puzzle.givenCells) {
          expect(givenCell.value).toBe(solvedBoard.getValue(givenCell));
        }

        for (const edgeHint of puzzle.edgeHints) {
          expect(edgeHint.isBrokenOn(solvedBoard)).toBe(false);
        }
      }
    }
  });

  it("can have no edge hints at all", () => {
    const puzzle = library.getPuzzle("hard", 4274);

    expect(puzzle.edgeHints).toEqual([]);
    expect(puzzle.givenCells).toHaveLength(9);
  });

  it("start without rule violations", () => {
    for (const difficulty of DIFFICULTIES) {
      for (const boardId of ALL_BOARD_IDS.filter((id) => id % 25 === 0)) {
        const puzzle = library.getPuzzle(difficulty, boardId);
        const startBoard = createStartBoard(puzzle);
        expect(findCellsBreakingRules(startBoard, puzzle.edgeHints).size).toBe(
          0,
        );
      }
    }
  });

  it("can be solved to the end with hints that always give a reason", () => {
    for (const difficulty of DIFFICULTIES) {
      for (const boardId of ALL_BOARD_IDS.filter((id) => id % 500 === 0)) {
        const puzzle = library.getPuzzle(difficulty, boardId);
        const board = createStartBoard(puzzle);
        let hint = findHint(board, puzzle);

        while (hint !== null) {
          expect(hint.explanation).not.toContain("longer chain of reasoning");
          board.setValue(hint.position, hint.correctValue);
          hint = findHint(board, puzzle);
        }

        expect(isSolved(board, puzzle.edgeHints)).toBe(true);
      }
    }
  });
});

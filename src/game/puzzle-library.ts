import boardsData from "../data/boards.json";
import easyPuzzlesData from "../data/easy.json";
import hardPuzzlesData from "../data/hard.json";
import mediumPuzzlesData from "../data/medium.json";
import { BOARD_SIZE } from "./board-constants";
import type { CellPosition, GivenCell } from "./cell-position";
import type { Difficulty } from "./difficulty";
import { EdgeHint, type HintType } from "./edge-hint";
import type { Puzzle } from "./puzzle";
import type { Solution } from "./solution";

// src/data holds every valid board (boards.json) and one puzzle per board and difficulty
// (easy.json, medium.json, hard.json), all made by scripts/generate-puzzles.mjs.
// A puzzle is stored as "cells|edges"; the script's header explains the numbering.
// Rows and columns are counted from 0, starting at the top-left cell.
// Cell values are 0 for 🐱 and 1 for 🐶.
const HORIZONTAL_EDGE_COUNT = BOARD_SIZE * (BOARD_SIZE - 1);

// Decodes the stored puzzles and picks the next board to play.
export class PuzzleLibrary {
  private readonly puzzlesDataByDifficulty: Record<Difficulty, string[]> = {
    easy: easyPuzzlesData,
    medium: mediumPuzzlesData,
    hard: hardPuzzlesData,
  };

  getBoardCount(): number {
    return boardsData.length;
  }

  getPuzzle(difficulty: Difficulty, boardId: number): Puzzle {
    const boardText = boardsData[boardId - 1];
    const [cellsText, edgesText] =
      this.puzzlesDataByDifficulty[difficulty][boardId - 1].split("|");

    const solution: Solution = { rowTexts: this.splitIntoRows(boardText) };

    return {
      id: boardId,
      solution,
      givenCells: this.parseNumbers(cellsText).map((cellIndex) =>
        this.decodeGivenCell(boardText, cellIndex),
      ),
      edgeHints: this.parseNumbers(edgesText).map((edgeIndex) =>
        this.decodeEdgeHint(boardText, edgeIndex),
      ),
    };
  }

  // A random board the player has not solved on this difficulty yet,
  // or any random board once every one of them is solved.
  pickBoardId(solvedBoardIds: Set<number>): number {
    const allBoardIds = this.listAllBoardIds();
    const unsolvedBoardIds = allBoardIds.filter(
      (boardId) => !solvedBoardIds.has(boardId),
    );
    const candidateBoardIds =
      unsolvedBoardIds.length > 0 ? unsolvedBoardIds : allBoardIds;
    return candidateBoardIds[
      Math.floor(Math.random() * candidateBoardIds.length)
    ];
  }

  private listAllBoardIds(): number[] {
    return Array.from(
      { length: this.getBoardCount() },
      (_, index) => index + 1,
    );
  }

  private parseNumbers(text: string): number[] {
    if (text === "") {
      return [];
    }

    return text.split(",").map(Number);
  }

  private splitIntoRows(boardText: string): string[] {
    const rows: string[] = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
      rows.push(boardText.slice(row * BOARD_SIZE, (row + 1) * BOARD_SIZE));
    }

    return rows;
  }

  private decodeGivenCell(boardText: string, cellIndex: number): GivenCell {
    return {
      ...this.toPosition(cellIndex),
      value: Number(boardText[cellIndex]) as GivenCell["value"],
    };
  }

  private decodeEdgeHint(boardText: string, edgeIndex: number): EdgeHint {
    const [firstCellIndex, secondCellIndex] =
      this.getEdgeCellIndexes(edgeIndex);
    const hasSameSymbols =
      boardText[firstCellIndex] === boardText[secondCellIndex];
    const type: HintType = hasSameSymbols ? "same" : "different";

    return new EdgeHint(
      this.toPosition(firstCellIndex),
      this.toPosition(secondCellIndex),
      type,
    );
  }

  private getEdgeCellIndexes(edgeIndex: number): [number, number] {
    const isHorizontalEdge = edgeIndex < HORIZONTAL_EDGE_COUNT;

    if (isHorizontalEdge) {
      const row = Math.floor(edgeIndex / (BOARD_SIZE - 1));
      const column = edgeIndex % (BOARD_SIZE - 1);
      const firstCellIndex = row * BOARD_SIZE + column;
      return [firstCellIndex, firstCellIndex + 1];
    }

    const firstCellIndex = edgeIndex - HORIZONTAL_EDGE_COUNT;
    return [firstCellIndex, firstCellIndex + BOARD_SIZE];
  }

  private toPosition(cellIndex: number): CellPosition {
    return {
      row: Math.floor(cellIndex / BOARD_SIZE),
      column: cellIndex % BOARD_SIZE,
    };
  }
}

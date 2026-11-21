import { Board } from "../game/board";
import { CAT, DOG, type CellValue } from "../game/symbols";

const VALUES_BY_LETTER: Record<string, CellValue> = {
  C: CAT,
  D: DOG,
  ".": null,
};

// Builds a board from one text per row: "C" is a cat, "D" is a dog and "." is an empty cell.
export function createBoardFromRows(rowTexts: string[]): Board {
  const board = Board.createEmpty();

  rowTexts.forEach((rowText, row) => {
    [...rowText].forEach((letter, column) => {
      board.setValue({ row, column }, VALUES_BY_LETTER[letter]);
    });
  });

  return board;
}

// A board with the given rows at the top and every other cell empty.
export function createBoardWithTopRows(topRowTexts: string[]): Board {
  const emptyRowText = ".".repeat(6);
  const rowTexts = Array.from(
    { length: 6 },
    (_, row) => topRowTexts[row] ?? emptyRowText,
  );
  return createBoardFromRows(rowTexts);
}

import { DIFFICULTIES, type Difficulty } from "./difficulty";

// Which puzzle is open, written in the page address after the #, for example "#hard/123".
export interface BoardAddress {
  difficulty: Difficulty;
  boardId: number;
}

const ADDRESS_PATTERN = /^#?([a-z]+)\/(\d+)$/;

export function formatBoardAddress(address: BoardAddress): string {
  return `#${address.difficulty}/${address.boardId}`;
}

// Returns null when the text is not an address of an existing board,
// so a mistyped or outdated address is ignored instead of breaking the page.
export function parseBoardAddress(
  addressText: string,
  boardCount: number,
): BoardAddress | null {
  const match = ADDRESS_PATTERN.exec(addressText);

  if (match === null) {
    return null;
  }

  const [, difficultyText, boardIdText] = match;
  const difficulty = DIFFICULTIES.find(
    (knownDifficulty) => knownDifficulty === difficultyText,
  );
  const boardId = Number(boardIdText);
  const isBoardIdInRange = boardId >= 1 && boardId <= boardCount;

  if (difficulty === undefined || !isBoardIdInRange) {
    return null;
  }

  return { difficulty, boardId };
}

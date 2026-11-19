import './error-highlight.css';
import {
  BOARD_SIZE,
  SYMBOL_EMOJIS,
  areNeighbouringCells,
  getCellValue,
  toCellKey,
  type Board,
  type CellKey,
  type CellPosition,
  type CellValue,
  type EdgeHint,
  type HintType,
} from './board';

export interface BoardView {
  board: Board;
  lockedCellKeys: Set<CellKey>;
  cellKeysBreakingRules: Set<CellKey>;
  edgeHints: EdgeHint[];
  // The cell the last hint filled in, and the cells its explanation points at.
  hintTargetCellKey: CellKey | null;
  hintRelatedCellKeys: Set<CellKey>;
}

const HINT_TEXT: Record<HintType, string> = {
  same: '=',
  different: '×',
};

export function renderBoard(
  boardElement: HTMLElement,
  view: BoardView,
  onCellClick: (position: CellPosition) => void,
): void {
  boardElement.style.setProperty('--board-size', String(BOARD_SIZE));
  boardElement.replaceChildren();

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let column = 0; column < BOARD_SIZE; column++) {
      boardElement.appendChild(createCellElement({ row, column }, view, onCellClick));
    }
  }

  for (const edgeHint of view.edgeHints) {
    boardElement.appendChild(createEdgeHintElement(edgeHint));
  }
}

function createCellElement(
  position: CellPosition,
  view: BoardView,
  onCellClick: (position: CellPosition) => void,
): HTMLButtonElement {
  const cellKey = toCellKey(position);
  const isLocked = view.lockedCellKeys.has(cellKey);
  const isBreakingRules = view.cellKeysBreakingRules.has(cellKey);

  const cellElement = document.createElement('button');
  cellElement.type = 'button';
  cellElement.className = 'cell';
  cellElement.classList.toggle('locked', isLocked);
  cellElement.classList.toggle('error', isBreakingRules);
  cellElement.classList.toggle('hint-target', cellKey === view.hintTargetCellKey);
  cellElement.classList.toggle('hint-related', view.hintRelatedCellKeys.has(cellKey));
  cellElement.textContent = getEmoji(getCellValue(view.board, position));
  cellElement.addEventListener('click', () => onCellClick(position));

  if (isLocked) {
    cellElement.tabIndex = -1;
  }

  return cellElement;
}

function getEmoji(value: CellValue): string {
  if (value === null) {
    return '';
  }
  return SYMBOL_EMOJIS[value];
}

// A hint is centred on the middle of the edge shared by its two cells:
// halfway between the cells along one axis and at the cells' centre along the other.
// That is never a cell centre and never a corner where four cells meet.
function createEdgeHintElement(edgeHint: EdgeHint): HTMLDivElement {
  assertHintIsOnSharedEdge(edgeHint);

  const hintElement = document.createElement('div');
  hintElement.className = 'edge-hint';
  hintElement.textContent = HINT_TEXT[edgeHint.type];
  hintElement.style.left = calculateCenterOffset(edgeHint.first.column, edgeHint.second.column);
  hintElement.style.top = calculateCenterOffset(edgeHint.first.row, edgeHint.second.row);
  return hintElement;
}

function assertHintIsOnSharedEdge(edgeHint: EdgeHint): void {
  const isBetweenNeighbours = areNeighbouringCells(edgeHint.first, edgeHint.second);

  if (!isBetweenNeighbours) {
    const firstKey = toCellKey(edgeHint.first);
    const secondKey = toCellKey(edgeHint.second);
    throw new Error(`A hint must sit on the edge of two neighbouring cells, but ${firstKey} and ${secondKey} are not neighbours.`);
  }
}

// Distance from the board's top-left padding edge to the centre of the position
// halfway between two cell indexes (equal indexes give the cell's own centre).
function calculateCenterOffset(firstIndex: number, secondIndex: number): string {
  const middleIndex = (firstIndex + secondIndex) / 2;
  return `calc(var(--board-padding) + ${middleIndex} * (var(--cell-size) + var(--cell-gap)) + var(--cell-size) / 2)`;
}

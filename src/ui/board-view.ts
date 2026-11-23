import "./error-highlight.css";
import type { Board } from "../game/board";
import { BOARD_SIZE } from "../game/board-constants";
import {
  getAllCellPositions,
  toCellKey,
  type CellKey,
  type CellPosition,
} from "../game/cell-position";
import type { EdgeHint, HintType } from "../game/edge-hint";
import { SYMBOL_EMOJIS } from "../game/symbols";

export interface BoardViewModel {
  board: Board;
  lockedCellKeys: Set<CellKey>;
  cellKeysBreakingRules: Set<CellKey>;
  edgeHints: EdgeHint[];
  // The cell the last hint filled in, and the cells its explanation points at.
  hintTargetCellKey: CellKey | null;
  hintRelatedCellKeys: Set<CellKey>;
}

const HINT_TEXT: Record<HintType, string> = {
  same: "=",
  different: "×",
};

// Draws the board into the page: the cells, and the "=" and "×" hints on the edges between them.
export class BoardView {
  constructor(
    private readonly boardElement: HTMLElement,
    private readonly onCellClick: (position: CellPosition) => void,
  ) {}

  render(viewModel: BoardViewModel): void {
    this.boardElement.style.setProperty("--board-size", String(BOARD_SIZE));
    this.boardElement.replaceChildren(
      ...getAllCellPositions().map((position) =>
        this.createCellElement(position, viewModel),
      ),
      ...viewModel.edgeHints.map((edgeHint) =>
        this.createEdgeHintElement(edgeHint),
      ),
    );
  }

  setBlurred(isBlurred: boolean): void {
    this.boardElement.classList.toggle("blurred", isBlurred);
  }

  private createCellElement(
    position: CellPosition,
    viewModel: BoardViewModel,
  ): HTMLButtonElement {
    const cellKey = toCellKey(position);
    const isLocked = viewModel.lockedCellKeys.has(cellKey);
    const value = viewModel.board.getValue(position);

    const cellElement = document.createElement("button");
    cellElement.type = "button";
    cellElement.className = "cell";
    cellElement.classList.toggle("locked", isLocked);
    cellElement.classList.toggle(
      "error",
      viewModel.cellKeysBreakingRules.has(cellKey),
    );
    cellElement.classList.toggle(
      "hint-target",
      cellKey === viewModel.hintTargetCellKey,
    );
    cellElement.classList.toggle(
      "hint-related",
      viewModel.hintRelatedCellKeys.has(cellKey),
    );
    cellElement.textContent = value === null ? "" : SYMBOL_EMOJIS[value];
    cellElement.addEventListener("click", () => this.onCellClick(position));

    if (isLocked) {
      cellElement.tabIndex = -1;
    }

    return cellElement;
  }

  // A hint is centred in the middle of the edge shared by its two cells:
  private createEdgeHintElement(edgeHint: EdgeHint): HTMLDivElement {
    const hintElement = document.createElement("div");
    hintElement.className = "edge-hint";
    hintElement.textContent = HINT_TEXT[edgeHint.type];
    hintElement.style.left = this.calculateCenterOffset(
      edgeHint.first.column,
      edgeHint.second.column,
    );
    hintElement.style.top = this.calculateCenterOffset(
      edgeHint.first.row,
      edgeHint.second.row,
    );
    return hintElement;
  }

  // Distance from the board's top-left padding edge to the center of the position
  // halfway between two cell indexes (equal indexes give the cell's own center).
  private calculateCenterOffset(
    firstIndex: number,
    secondIndex: number,
  ): string {
    const middleIndex = (firstIndex + secondIndex) / 2;
    return `calc(var(--board-padding) + ${middleIndex} * (var(--cell-size) + var(--cell-gap)) + var(--cell-size) / 2)`;
  }
}

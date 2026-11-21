import "./error-highlight.css";
import type { Board } from "../game/board";
import { BOARD_SIZE } from "../game/board-constants";
import {
  toCellKey,
  type CellKey,
  type CellPosition,
} from "../game/cell-position";
import type { EdgeHint, HintType } from "../game/edge-hint";
import { SYMBOL_EMOJIS, type CellValue } from "../game/symbols";

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
    this.boardElement.replaceChildren();

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let column = 0; column < BOARD_SIZE; column++) {
        this.boardElement.appendChild(
          this.createCellElement({ row, column }, viewModel),
        );
      }
    }

    for (const edgeHint of viewModel.edgeHints) {
      this.boardElement.appendChild(this.createEdgeHintElement(edgeHint));
    }
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
    const isBreakingRules = viewModel.cellKeysBreakingRules.has(cellKey);

    const cellElement = document.createElement("button");
    cellElement.type = "button";
    cellElement.className = "cell";
    cellElement.classList.toggle("locked", isLocked);
    cellElement.classList.toggle("error", isBreakingRules);
    cellElement.classList.toggle(
      "hint-target",
      cellKey === viewModel.hintTargetCellKey,
    );
    cellElement.classList.toggle(
      "hint-related",
      viewModel.hintRelatedCellKeys.has(cellKey),
    );
    cellElement.textContent = this.getEmoji(viewModel.board.getValue(position));
    cellElement.addEventListener("click", () => this.onCellClick(position));

    if (isLocked) {
      cellElement.tabIndex = -1;
    }

    return cellElement;
  }

  private getEmoji(value: CellValue): string {
    if (value === null) {
      return "";
    }

    return SYMBOL_EMOJIS[value];
  }

  // A hint is centred on the middle of the edge shared by its two cells:
  // halfway between the cells along one axis and at the cells' centre along the other.
  // That is never a cell centre and never a corner where four cells meet.
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

  // Distance from the board's top-left padding edge to the centre of the position
  // halfway between two cell indexes (equal indexes give the cell's own centre).
  private calculateCenterOffset(
    firstIndex: number,
    secondIndex: number,
  ): string {
    const middleIndex = (firstIndex + secondIndex) / 2;
    return `calc(var(--board-padding) + ${middleIndex} * (var(--cell-size) + var(--cell-gap)) + var(--cell-size) / 2)`;
  }
}

import "./board-menu.css";
import {
  countSolvedBoardsInRange,
  findRangeContaining,
  getAllThousands,
  getHundredsOfThousand,
  type BoardRange,
} from "./board-ranges";
import { formatNumberWithSpaces } from "../utils/format-number";

const BOARDS_PER_GROUP = 25;

export interface BoardMenuView {
  difficultyLabel: string;
  solvedBoardIds: Set<number>;
  currentBoardId: number;
}

export interface BoardMenuActions {
  onBoardChosen: (boardId: number) => void;
  onRandomBoardChosen: () => void;
}

// The list of all boards in a drawer on the left. 11 222 rows cannot be scrolled, so the
// boards are grouped in three layers: thousands (1-1 000, ...), the hundreds inside one
// thousand (1-100, ...) and finally the 100 board numbers of one hundred.
// A range tile fills with green in proportion to its solved boards.
// Only the opened layer is drawn, so the menu stays fast.
export class BoardMenu {
  private openedThousand: BoardRange | null = null;
  private openedHundred: BoardRange | null = null;
  private view: BoardMenuView | null = null;

  constructor(
    private readonly drawerElement: HTMLElement,
    private readonly boardCount: number,
    private readonly actions: BoardMenuActions,
  ) {}

  render(view: BoardMenuView): void {
    this.view = view;
    this.drawerElement.replaceChildren(
      this.createSummary(view),
      this.createToolbar(),
      this.createCurrentLayer(view),
    );
  }

  showLayerOfBoard(boardId: number): void {
    this.openedThousand = findRangeContaining(
      getAllThousands(this.boardCount),
      boardId,
    );
    this.openedHundred = findRangeContaining(
      getHundredsOfThousand(this.openedThousand),
      boardId,
    );
  }

  private createCurrentLayer(view: BoardMenuView): HTMLElement {
    if (this.openedThousand === null) {
      return this.createRangeGrid(
        getAllThousands(this.boardCount),
        view,
        (thousand) => {
          this.openedThousand = thousand;
        },
      );
    }

    if (this.openedHundred === null) {
      return this.createHundredsLayer(this.openedThousand, view);
    }

    return this.createBoardsLayer(
      this.openedThousand,
      this.openedHundred,
      view,
    );
  }

  private createSummary(view: BoardMenuView): HTMLElement {
    const summaryElement = document.createElement("div");
    summaryElement.className = "menu-summary";

    const titleElement = document.createElement("h2");
    titleElement.textContent = `${view.difficultyLabel} boards`;

    const countElement = document.createElement("p");
    countElement.textContent = `${formatNumberWithSpaces(view.solvedBoardIds.size)} of ${formatNumberWithSpaces(this.boardCount)} solved`;

    const barElement = document.createElement("progress");
    barElement.max = this.boardCount;
    barElement.value = view.solvedBoardIds.size;

    summaryElement.append(titleElement, countElement, barElement);
    return summaryElement;
  }

  private createToolbar(): HTMLElement {
    const toolbarElement = document.createElement("div");
    toolbarElement.className = "menu-toolbar";

    const randomButton = this.createButton("🎲 Random", () =>
      this.actions.onRandomBoardChosen(),
    );

    const numberInput = document.createElement("input");
    numberInput.type = "number";
    numberInput.min = "1";
    numberInput.max = String(this.boardCount);
    numberInput.placeholder = `Go to # (1–${formatNumberWithSpaces(this.boardCount)})`;
    numberInput.setAttribute("aria-label", "Board number");
    numberInput.addEventListener("keydown", (keyboardEvent) => {
      if (keyboardEvent.key === "Enter") {
        this.chooseBoardFromInput(numberInput);
      }
    });

    toolbarElement.append(randomButton, numberInput);
    return toolbarElement;
  }

  private chooseBoardFromInput(numberInput: HTMLInputElement): void {
    const boardId = Number(numberInput.value);
    const isValidBoardId =
      Number.isInteger(boardId) && boardId >= 1 && boardId <= this.boardCount;

    if (isValidBoardId) {
      this.actions.onBoardChosen(boardId);
      return;
    }

    numberInput.setCustomValidity(
      `Enter a number from 1 to ${formatNumberWithSpaces(this.boardCount)}`,
    );
    numberInput.reportValidity();
    numberInput.setCustomValidity("");
  }

  private createHundredsLayer(
    thousand: BoardRange,
    view: BoardMenuView,
  ): HTMLElement {
    const layerElement = document.createElement("div");
    const backButton = this.createBackButton("← All thousands", () => {
      this.openedThousand = null;
    });
    const hundredsGrid = this.createRangeGrid(
      getHundredsOfThousand(thousand),
      view,
      (hundred) => {
        this.openedHundred = hundred;
      },
    );

    layerElement.append(backButton, hundredsGrid);
    return layerElement;
  }

  private createBoardsLayer(
    thousand: BoardRange,
    hundred: BoardRange,
    view: BoardMenuView,
  ): HTMLElement {
    const layerElement = document.createElement("div");
    const backButton = this.createBackButton(
      `← ${this.formatRange(thousand)}`,
      () => {
        this.openedHundred = null;
      },
    );

    layerElement.append(backButton, this.createBoardGroups(hundred, view));
    return layerElement;
  }

  // A hundred boards are shown as blocks of 5 × 5 tiles with a space between the blocks.
  private createBoardGroups(
    hundred: BoardRange,
    view: BoardMenuView,
  ): HTMLElement {
    const groupsElement = document.createElement("div");
    groupsElement.className = "board-groups";

    for (
      let firstBoardIdOfGroup = hundred.firstBoardId;
      firstBoardIdOfGroup <= hundred.lastBoardId;
      firstBoardIdOfGroup += BOARDS_PER_GROUP
    ) {
      const lastBoardIdOfGroup = Math.min(
        firstBoardIdOfGroup + BOARDS_PER_GROUP - 1,
        hundred.lastBoardId,
      );
      groupsElement.appendChild(
        this.createBoardGroup(view, firstBoardIdOfGroup, lastBoardIdOfGroup),
      );
    }

    return groupsElement;
  }

  private createBoardGroup(
    view: BoardMenuView,
    firstBoardId: number,
    lastBoardId: number,
  ): HTMLElement {
    const groupElement = document.createElement("div");
    groupElement.className = "board-grid";

    for (let boardId = firstBoardId; boardId <= lastBoardId; boardId++) {
      groupElement.appendChild(this.createBoardTile(view, boardId));
    }

    return groupElement;
  }

  private createRangeGrid(
    ranges: BoardRange[],
    view: BoardMenuView,
    onRangeOpened: (range: BoardRange) => void,
  ): HTMLElement {
    const gridElement = document.createElement("div");
    gridElement.className = "range-grid";

    for (const range of ranges) {
      gridElement.appendChild(this.createRangeTile(range, view, onRangeOpened));
    }

    return gridElement;
  }

  private createRangeTile(
    range: BoardRange,
    view: BoardMenuView,
    onRangeOpened: (range: BoardRange) => void,
  ): HTMLButtonElement {
    const boardsInRange = range.lastBoardId - range.firstBoardId + 1;
    const solvedCount = countSolvedBoardsInRange(view.solvedBoardIds, range);

    const tileElement = this.createButton(this.formatRange(range), () => {
      onRangeOpened(range);
      this.renderAgain();
    });
    tileElement.classList.add("range-tile");
    tileElement.style.setProperty(
      "--solved-share",
      `${(solvedCount / boardsInRange) * 100}%`,
    );
    tileElement.title = `${solvedCount} of ${boardsInRange} solved`;
    return tileElement;
  }

  private createBoardTile(
    view: BoardMenuView,
    boardId: number,
  ): HTMLButtonElement {
    const tileElement = this.createButton(formatNumberWithSpaces(boardId), () =>
      this.actions.onBoardChosen(boardId),
    );
    tileElement.classList.add("board-tile");
    tileElement.classList.toggle("solved", view.solvedBoardIds.has(boardId));
    tileElement.classList.toggle("current", boardId === view.currentBoardId);
    return tileElement;
  }

  private createBackButton(
    text: string,
    onBack: () => void,
  ): HTMLButtonElement {
    const backButton = this.createButton(text, () => {
      onBack();
      this.renderAgain();
    });
    backButton.classList.add("back-button");
    return backButton;
  }

  private formatRange(range: BoardRange): string {
    return `${formatNumberWithSpaces(range.firstBoardId)}–${formatNumberWithSpaces(range.lastBoardId)}`;
  }

  private createButton(text: string, onClick: () => void): HTMLButtonElement {
    const buttonElement = document.createElement("button");
    buttonElement.type = "button";
    buttonElement.textContent = text;
    buttonElement.addEventListener("click", onClick);
    return buttonElement;
  }

  private renderAgain(): void {
    if (this.view !== null) {
      this.render(this.view);
    }
  }
}

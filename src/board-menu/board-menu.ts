import "./board-menu.css";
import {
  countSolvedBoardsInRange,
  findRangeContaining,
  getAllThousands,
  getHundredsOfThousand,
  splitIntoRanges,
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

// Boards are grouped in three layers: thousands --> hundreds --> 100 boards
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
    const thousand = this.openedThousand;
    const hundred = this.openedHundred;

    if (thousand === null) {
      return this.createRangeGrid(
        getAllThousands(this.boardCount),
        view,
        (openedThousand) => {
          this.openedThousand = openedThousand;
        },
      );
    }

    if (hundred === null) {
      return this.createLayer(
        this.createBackButton("← All thousands", () => {
          this.openedThousand = null;
        }),
        this.createRangeGrid(
          getHundredsOfThousand(thousand),
          view,
          (openedHundred) => {
            this.openedHundred = openedHundred;
          },
        ),
      );
    }

    return this.createLayer(
      this.createBackButton(`← ${this.formatRange(thousand)}`, () => {
        this.openedHundred = null;
      }),
      this.createBoardGroups(hundred, view),
    );
  }

  private createLayer(
    backButton: HTMLButtonElement,
    content: HTMLElement,
  ): HTMLElement {
    const layerElement = document.createElement("div");
    layerElement.append(backButton, content);
    return layerElement;
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

  // A hundred boards are shown as blocks of 5 × 5 tiles with a space between the blocks.
  private createBoardGroups(
    hundred: BoardRange,
    view: BoardMenuView,
  ): HTMLElement {
    const groupsElement = document.createElement("div");
    groupsElement.className = "board-groups";
    groupsElement.append(
      ...splitIntoRanges(
        hundred.firstBoardId,
        hundred.lastBoardId,
        BOARDS_PER_GROUP,
      ).map((group) => this.createBoardGroup(view, group)),
    );
    return groupsElement;
  }

  private createBoardGroup(
    view: BoardMenuView,
    group: BoardRange,
  ): HTMLElement {
    const groupElement = document.createElement("div");
    groupElement.className = "board-grid";
    groupElement.append(
      ...Array.from(
        { length: group.lastBoardId - group.firstBoardId + 1 },
        (_, offset) => this.createBoardTile(view, group.firstBoardId + offset),
      ),
    );
    return groupElement;
  }

  private createRangeGrid(
    ranges: BoardRange[],
    view: BoardMenuView,
    onRangeOpened: (range: BoardRange) => void,
  ): HTMLElement {
    const gridElement = document.createElement("div");
    gridElement.className = "range-grid";
    gridElement.append(
      ...ranges.map((range) =>
        this.createRangeTile(range, view, onRangeOpened),
      ),
    );
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

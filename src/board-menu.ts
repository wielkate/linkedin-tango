import './board-menu.css';
import { BOARD_COUNT } from './puzzle';

const BOARDS_PER_RANGE = 100;
const RANGE_COUNT = Math.ceil(BOARD_COUNT / BOARDS_PER_RANGE);

export interface BoardMenuView {
  difficultyLabel: string;
  solvedBoardIds: Set<number>;
  currentBoardId: number;
}

export interface BoardMenuActions {
  onBoardChosen: (boardId: number) => void;
  onRandomBoardChosen: () => void;
}

// The list of all boards in a drawer on the left. 11,222 rows cannot be scrolled, so the
// boards are grouped: first a grid of ranges (1-100, 101-200, ...) that shows how much of
// each range is solved, then the 100 boards of the range the player opens.
// Boards are drawn only for the opened range, so the menu stays fast.
export class BoardMenu {
  private openedRangeIndex: number | null = null;
  private view: BoardMenuView | null = null;

  constructor(
    private readonly drawerElement: HTMLElement,
    private readonly actions: BoardMenuActions,
  ) {}

  render(view: BoardMenuView): void {
    this.view = view;
    this.drawerElement.replaceChildren(
      this.createSummary(view),
      this.createToolbar(),
      this.openedRangeIndex === null ? this.createRangeGrid(view) : this.createBoardGrid(view, this.openedRangeIndex),
    );
  }

  showRangeOfBoard(boardId: number): void {
    this.openedRangeIndex = Math.floor((boardId - 1) / BOARDS_PER_RANGE);
  }

  private createSummary(view: BoardMenuView): HTMLElement {
    const summaryElement = document.createElement('div');
    summaryElement.className = 'menu-summary';

    const titleElement = document.createElement('h2');
    titleElement.textContent = `${view.difficultyLabel} boards`;

    const countElement = document.createElement('p');
    countElement.textContent = `${view.solvedBoardIds.size.toLocaleString()} of ${BOARD_COUNT.toLocaleString()} solved`;

    const barElement = document.createElement('progress');
    barElement.max = BOARD_COUNT;
    barElement.value = view.solvedBoardIds.size;

    summaryElement.append(titleElement, countElement, barElement);
    return summaryElement;
  }

  private createToolbar(): HTMLElement {
    const toolbarElement = document.createElement('div');
    toolbarElement.className = 'menu-toolbar';

    const randomButton = this.createButton('🎲 Random', () => this.actions.onRandomBoardChosen());

    const numberInput = document.createElement('input');
    numberInput.type = 'number';
    numberInput.min = '1';
    numberInput.max = String(BOARD_COUNT);
    numberInput.placeholder = `Go to # (1-${BOARD_COUNT})`;
    numberInput.setAttribute('aria-label', 'Board number');
    numberInput.addEventListener('keydown', (keyboardEvent) => {
      if (keyboardEvent.key === 'Enter') {
        this.chooseBoardFromInput(numberInput);
      }
    });

    toolbarElement.append(randomButton, numberInput);
    return toolbarElement;
  }

  private chooseBoardFromInput(numberInput: HTMLInputElement): void {
    const boardId = Number(numberInput.value);
    const isValidBoardId = Number.isInteger(boardId) && boardId >= 1 && boardId <= BOARD_COUNT;

    if (isValidBoardId) {
      this.actions.onBoardChosen(boardId);
    } else {
      numberInput.setCustomValidity('Enter a number from 1 to ' + BOARD_COUNT);
      numberInput.reportValidity();
      numberInput.setCustomValidity('');
    }
  }

  private createRangeGrid(view: BoardMenuView): HTMLElement {
    const solvedCountPerRange = this.countSolvedBoardsPerRange(view.solvedBoardIds);
    const gridElement = document.createElement('div');
    gridElement.className = 'range-grid';

    for (let rangeIndex = 0; rangeIndex < RANGE_COUNT; rangeIndex++) {
      gridElement.appendChild(this.createRangeTile(rangeIndex, solvedCountPerRange[rangeIndex]));
    }

    return gridElement;
  }

  private countSolvedBoardsPerRange(solvedBoardIds: Set<number>): number[] {
    const solvedCountPerRange = Array<number>(RANGE_COUNT).fill(0);

    for (const boardId of solvedBoardIds) {
      solvedCountPerRange[Math.floor((boardId - 1) / BOARDS_PER_RANGE)]++;
    }

    return solvedCountPerRange;
  }

  private createRangeTile(rangeIndex: number, solvedCount: number): HTMLButtonElement {
    const firstBoardId = rangeIndex * BOARDS_PER_RANGE + 1;
    const lastBoardId = Math.min((rangeIndex + 1) * BOARDS_PER_RANGE, BOARD_COUNT);
    const boardsInRange = lastBoardId - firstBoardId + 1;

    const tileElement = this.createButton(`${firstBoardId}–${lastBoardId}`, () => {
      this.openedRangeIndex = rangeIndex;
      this.renderAgain();
    });
    tileElement.classList.add('range-tile');
    tileElement.style.setProperty('--solved-share', `${(solvedCount / boardsInRange) * 100}%`);
    tileElement.title = `${solvedCount} of ${boardsInRange} solved`;
    return tileElement;
  }

  private createBoardGrid(view: BoardMenuView, rangeIndex: number): HTMLElement {
    const containerElement = document.createElement('div');

    const backButton = this.createButton('← All ranges', () => {
      this.openedRangeIndex = null;
      this.renderAgain();
    });
    backButton.classList.add('back-button');

    const gridElement = document.createElement('div');
    gridElement.className = 'board-grid';
    const firstBoardId = rangeIndex * BOARDS_PER_RANGE + 1;
    const lastBoardId = Math.min((rangeIndex + 1) * BOARDS_PER_RANGE, BOARD_COUNT);

    for (let boardId = firstBoardId; boardId <= lastBoardId; boardId++) {
      gridElement.appendChild(this.createBoardTile(view, boardId));
    }

    containerElement.append(backButton, gridElement);
    return containerElement;
  }

  private createBoardTile(view: BoardMenuView, boardId: number): HTMLButtonElement {
    const tileElement = this.createButton(String(boardId), () => this.actions.onBoardChosen(boardId));
    tileElement.classList.add('board-tile');
    tileElement.classList.toggle('solved', view.solvedBoardIds.has(boardId));
    tileElement.classList.toggle('current', boardId === view.currentBoardId);
    return tileElement;
  }

  private createButton(text: string, onClick: () => void): HTMLButtonElement {
    const buttonElement = document.createElement('button');
    buttonElement.type = 'button';
    buttonElement.textContent = text;
    buttonElement.addEventListener('click', onClick);
    return buttonElement;
  }

  private renderAgain(): void {
    if (this.view !== null) {
      this.render(this.view);
    }
  }
}

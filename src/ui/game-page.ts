import { BoardMenu } from "../board-menu/board-menu";
import { MenuDrawer } from "../board-menu/menu-drawer";
import { Confetti } from "../effects/confetti";
import { SuccessSound } from "../effects/success-sound";
import { toCellKey, type CellPosition } from "../game/cell-position";
import {
  DEFAULT_DIFFICULTY,
  DIFFICULTY_LABELS,
  type Difficulty,
} from "../game/difficulty";
import { PuzzleGame } from "../game/puzzle-game";
import type { Puzzle } from "../game/puzzle";
import type { PuzzleLibrary } from "../game/puzzle-library";
import type { SolvedBoards } from "../game/solved-boards";
import type { Hint } from "../hints/hint";
import { HintNoteView } from "../hints/hint-note-view";
import { formatDuration } from "../utils/format-duration";
import { formatNumberWithSpaces } from "../utils/format-number";
import { BoardView } from "./board-view";
import { DifficultyPicker } from "./difficulty-picker";
import { drawAttentionTo } from "./draw-attention";
import { InfoDialog } from "./info-dialog";
import { getRequiredButton, getRequiredElement } from "./required-element";
import { Stopwatch } from "./stopwatch";
import { TimerDisplay } from "./timer-display";

const TIMER_REFRESH_MILLISECONDS = 1000;

// The whole page: it connects the buttons, the board and the menu to the puzzle being played,
// the stopwatch and the progress the player has saved.
export class GamePage {
  private selectedDifficulty: Difficulty = DEFAULT_DIFFICULTY;
  private game: PuzzleGame;
  private wasStopwatchPausedBeforeInfo = false;

  private readonly stopwatch = new Stopwatch();
  private readonly confetti = new Confetti();
  private readonly successSound = new SuccessSound();

  private readonly boardView = new BoardView(
    getRequiredElement("board"),
    (position) => this.handleCellClick(position),
  );
  private readonly difficultyPicker = new DifficultyPicker(
    getRequiredElement("difficulty"),
    (difficulty) => this.startPuzzle(difficulty),
  );
  private readonly hintNoteView = new HintNoteView(
    getRequiredElement("hint-note"),
    getRequiredElement("hint-note-text"),
  );
  private readonly timerDisplay = new TimerDisplay(
    getRequiredElement("timer"),
    this.stopwatch,
  );
  private readonly menuDrawer = new MenuDrawer(
    getRequiredElement("menu-drawer"),
    getRequiredElement("menu-backdrop"),
  );
  private readonly infoDialog = new InfoDialog(
    getRequiredElement("info-dialog") as HTMLDialogElement,
    () => this.handleInfoClosed(),
  );
  private readonly boardMenu: BoardMenu;

  private readonly undoButton = getRequiredButton("undo");
  private readonly resetButton = getRequiredButton("reset");
  private readonly hintButton = getRequiredButton("hint");
  private readonly solveButton = getRequiredButton("solve");
  private readonly pauseButton = getRequiredButton("pause");
  private readonly nextButton = getRequiredButton("next");
  private readonly menuButton = getRequiredButton("menu-button");
  private readonly menuCloseButton = getRequiredButton("menu-close");
  private readonly menuBackdropElement = getRequiredElement("menu-backdrop");
  private readonly infoButton = getRequiredButton("info");
  private readonly titleElement = getRequiredElement("title");
  private readonly statusElement = getRequiredElement("status");

  constructor(
    private readonly puzzleLibrary: PuzzleLibrary,
    private readonly solvedBoards: SolvedBoards,
  ) {
    this.game = new PuzzleGame(this.pickNextPuzzle());
    this.boardMenu = new BoardMenu(
      getRequiredElement("menu-content"),
      puzzleLibrary.getBoardCount(),
      {
        onBoardChosen: (boardId) => this.startPuzzleWithId(boardId),
        onRandomBoardChosen: () => this.startNextPuzzle(),
      },
    );
  }

  start(): void {
    this.listenToEvents();
    window.setInterval(
      () => this.timerDisplay.render(),
      TIMER_REFRESH_MILLISECONDS,
    );
    this.render();
  }

  private listenToEvents(): void {
    this.undoButton.addEventListener("click", () => this.undoLastChange());
    this.resetButton.addEventListener("click", () => this.resetBoard());
    this.hintButton.addEventListener("click", () => this.revealHint());
    this.solveButton.addEventListener("click", () => this.solvePuzzle());
    this.nextButton.addEventListener("click", () => this.startNextPuzzle());
    this.pauseButton.addEventListener("click", () => this.togglePause());
    this.infoButton.addEventListener("click", () => this.openInfo());
    this.menuButton.addEventListener("click", () => this.openMenu());
    this.menuCloseButton.addEventListener("click", () =>
      this.menuDrawer.close(),
    );
    this.menuBackdropElement.addEventListener("click", () =>
      this.menuDrawer.close(),
    );
    document.addEventListener("keydown", (keyboardEvent) => {
      if (keyboardEvent.key === "Escape") {
        this.menuDrawer.close();
      }
    });
  }

  private pickNextPuzzle(): Puzzle {
    const solvedBoardIds = this.solvedBoards.getBoardIds(
      this.selectedDifficulty,
    );
    return this.puzzleLibrary.getPuzzle(
      this.selectedDifficulty,
      this.puzzleLibrary.pickBoardId(solvedBoardIds),
    );
  }

  private startPuzzle(difficulty: Difficulty): void {
    this.selectedDifficulty = difficulty;
    this.startNextPuzzle();
  }

  private startNextPuzzle(): void {
    const solvedBoardIds = this.solvedBoards.getBoardIds(
      this.selectedDifficulty,
    );
    this.startPuzzleWithId(this.puzzleLibrary.pickBoardId(solvedBoardIds));
  }

  private startPuzzleWithId(boardId: number): void {
    this.game = new PuzzleGame(
      this.puzzleLibrary.getPuzzle(this.selectedDifficulty, boardId),
    );
    this.menuDrawer.close();
    this.stopwatch.restart();

    const solveSeconds = this.solvedBoards.getSolveSeconds(
      this.selectedDifficulty,
      boardId,
    );

    if (solveSeconds !== null) {
      this.showPreviouslySolvedBoard(solveSeconds);
    }

    this.render();
  }

  // The board is filled in and the stopwatch frozen at the saved time, without confetti or sound.
  private showPreviouslySolvedBoard(solveSeconds: number): void {
    this.game.solve();
    this.stopwatch.freezeAt(solveSeconds);
  }

  // Reset starts the board over, also when it was already solved, so it can be played again.
  private resetBoard(): void {
    this.game = new PuzzleGame(this.game.puzzle);
    this.stopwatch.restart();
    this.render();
  }

  private undoLastChange(): void {
    this.game.undo();
    this.finishPuzzleIfSolved();
    this.render();
  }

  private handleCellClick(position: CellPosition): void {
    this.game.clickCell(position);
    this.finishPuzzleIfSolved();
    this.render();
  }

  private revealHint(): void {
    this.game.revealHint();
    this.finishPuzzleIfSolved();
    this.render();
  }

  private solvePuzzle(): void {
    this.game.solve();
    this.finishPuzzleIfSolved();
    this.render();
  }

  private finishPuzzleIfSolved(): void {
    const isRunningAndSolved =
      !this.stopwatch.isStopped() && this.game.isSolved();

    if (!isRunningAndSolved) {
      return;
    }

    this.stopwatch.stop();
    this.confetti.launch();
    this.successSound.play();
    this.solvedBoards.markSolved(
      this.selectedDifficulty,
      this.game.puzzle.id,
      this.stopwatch.getElapsedSeconds(),
    );
    this.revealNextButton();
  }

  // On a small screen the button is below the visible part of the page, so it is scrolled into view.
  private revealNextButton(): void {
    this.nextButton.hidden = false;
    drawAttentionTo(this.nextButton);
  }

  // The menu is drawn only when it opens, so playing does not pay for 100+ menu buttons.
  private openMenu(): void {
    this.boardMenu.showLayerOfBoard(this.game.puzzle.id);
    this.boardMenu.render({
      difficultyLabel: DIFFICULTY_LABELS[this.selectedDifficulty],
      solvedBoardIds: this.solvedBoards.getBoardIds(this.selectedDifficulty),
      currentBoardId: this.game.puzzle.id,
    });
    this.menuDrawer.open();
  }

  private togglePause(): void {
    if (this.stopwatch.isPaused()) {
      this.stopwatch.resume();
    } else {
      this.stopwatch.pause();
    }

    this.render();
  }

  private openInfo(): void {
    this.wasStopwatchPausedBeforeInfo = this.stopwatch.isPaused();
    this.stopwatch.pause();
    this.infoDialog.open();
    this.render();
  }

  private handleInfoClosed(): void {
    if (!this.wasStopwatchPausedBeforeInfo) {
      this.stopwatch.resume();
    }

    this.render();
  }

  private render(): void {
    const isSolved = this.game.isSolved();
    const isPaused = this.stopwatch.isPaused();
    const shownHint = this.findHintToShow(isPaused, isSolved);

    this.difficultyPicker.render(this.selectedDifficulty);
    this.renderBoard(shownHint);
    this.hintNoteView.render(shownHint);
    this.boardView.setBlurred(isPaused || this.infoDialog.isOpen());
    this.pauseButton.textContent = isPaused ? "▶ Resume" : "⏸ Pause";
    this.pauseButton.disabled = this.stopwatch.isStopped();
    this.undoButton.disabled = !this.game.canUndo() || isPaused;
    this.nextButton.hidden = !isSolved;
    this.hintButton.disabled = isSolved || isPaused;
    this.solveButton.disabled = isSolved || isPaused;
    this.timerDisplay.render();
    this.titleElement.textContent = `Tango #${formatNumberWithSpaces(this.game.puzzle.id)}`;
    this.statusElement.textContent = this.createStatusMessage(isSolved);
  }

  private renderBoard(shownHint: Hint | null): void {
    this.boardView.render({
      board: this.game.getBoard(),
      lockedCellKeys: this.game.getLockedCellKeys(),
      cellKeysBreakingRules: this.game.findCellsBreakingRules(),
      edgeHints: this.game.puzzle.edgeHints,
      hintTargetCellKey:
        shownHint === null ? null : toCellKey(shownHint.position),
      hintRelatedCellKeys: new Set(shownHint?.relatedPositions.map(toCellKey)),
    });
  }

  // The explanation is hidden while the board is blurred, so a pause cannot be used to read it.
  private findHintToShow(isPaused: boolean, isSolved: boolean): Hint | null {
    const isHintHidden = isPaused || isSolved;
    return isHintHidden ? null : this.game.getActiveHint();
  }

  private createStatusMessage(isSolved: boolean): string {
    if (isSolved) {
      return `🎉 Solved in ${formatDuration(this.stopwatch.getElapsedSeconds())}!`;
    }

    return "";
  }
}

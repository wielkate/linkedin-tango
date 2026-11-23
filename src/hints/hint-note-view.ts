import type { Hint } from "./hint";

// The light-yellow note beside the board that explains the last hint.
export class HintNoteView {
  constructor(
    private readonly noteElement: HTMLElement,
    private readonly textElement: HTMLElement,
  ) {}

  render(shownHint: Hint | null): void {
    this.noteElement.hidden = shownHint === null;
    this.textElement.textContent = shownHint?.explanation ?? "";
  }
}

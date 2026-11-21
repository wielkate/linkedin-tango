// The "how to play" dialog. It tells the page when the player closes it.
export class InfoDialog {
  constructor(
    private readonly dialogElement: HTMLDialogElement,
    onClosed: () => void,
  ) {
    dialogElement.addEventListener("close", onClosed);
  }

  open(): void {
    this.dialogElement.showModal();
  }

  isOpen(): boolean {
    return this.dialogElement.open;
  }
}

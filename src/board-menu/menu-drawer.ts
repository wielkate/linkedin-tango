// The drawer on the left that holds the board menu: opening, closing and the backdrop behind it.
export class MenuDrawer {
  constructor(
    private readonly drawerElement: HTMLElement,
    private readonly backdropElement: HTMLElement,
  ) {}

  open(): void {
    this.drawerElement.inert = false;
    this.drawerElement.classList.add('open');
    this.backdropElement.hidden = false;
  }

  close(): void {
    this.drawerElement.inert = true;
    this.drawerElement.classList.remove('open');
    this.backdropElement.hidden = true;
  }
}

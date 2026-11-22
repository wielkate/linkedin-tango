import { createPawPrintTrailElement } from "./paw-print-element";
import { planPawPrintTrail } from "./paw-print-trail-plan";
import { pickBetween, type RandomNumberGenerator } from "./pet-peek-plan";

const FIRST_WALK_DELAY_MILLISECONDS: [number, number] = [6000, 14000];
const DELAY_BETWEEN_WALKS_MILLISECONDS: [number, number] = [20000, 45000];
const RETRY_WHILE_TAB_HIDDEN_MILLISECONDS = 2000;

// Now and then an invisible cat or dog walks across the screen and leaves a trail of paw prints
// that appear one after another and fade away. The prints are drawn behind everything, so they never cover the text, the buttons or the board.
export class PawPrintWalker {
  private isRunning = false;
  private nextWalkTimer: number | undefined;

  constructor(private readonly random: RandomNumberGenerator = Math.random) {}

  start(): void {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.scheduleNextWalk(FIRST_WALK_DELAY_MILLISECONDS);
  }

  stop(): void {
    this.isRunning = false;
    window.clearTimeout(this.nextWalkTimer);
  }

  private scheduleNextWalk(delayRange: [number, number]): void {
    const delayMilliseconds = pickBetween(this.random, ...delayRange);

    this.nextWalkTimer = window.setTimeout(
      () => this.walk(),
      delayMilliseconds,
    );
  }

  private walk(): void {
    if (document.hidden) {
      this.nextWalkTimer = window.setTimeout(
        () => this.walk(),
        RETRY_WHILE_TAB_HIDDEN_MILLISECONDS,
      );
      return;
    }

    const trail = planPawPrintTrail(this.random, {
      widthPixels: window.innerWidth,
      heightPixels: window.innerHeight,
    });
    const trailElement = createPawPrintTrailElement(trail);
    document.body.appendChild(trailElement);

    window.setTimeout(() => {
      trailElement.remove();

      if (this.isRunning) {
        this.scheduleNextWalk(DELAY_BETWEEN_WALKS_MILLISECONDS);
      }
    }, trail.totalMilliseconds);
  }
}
